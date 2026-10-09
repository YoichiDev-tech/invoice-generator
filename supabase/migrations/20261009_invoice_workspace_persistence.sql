-- Persist complete invoice documents and enforce owner-based access.
-- Review table/column names against the live project before applying this migration.

alter table public.invoices add column if not exists client_name text;
alter table public.invoices add column if not exists client_company text;
alter table public.invoices add column if not exists client_email text;
alter table public.invoices add column if not exists client_address text;
alter table public.invoices add column if not exists invoice_number text;
alter table public.invoices add column if not exists sender_name text;
alter table public.invoices add column if not exists sender_company text;
alter table public.invoices add column if not exists sender_email text;
alter table public.invoices add column if not exists sender_address text;
alter table public.invoices add column if not exists currency text not null default 'EUR';
alter table public.invoices add column if not exists subtotal numeric(12,2) not null default 0;
alter table public.invoices add column if not exists tax_amount numeric(12,2) not null default 0;
alter table public.invoices add column if not exists total_amount numeric(12,2) not null default 0;

update public.invoices i
set client_name = coalesce(i.client_name, c.name),
    client_company = coalesce(i.client_company, c.company),
    client_email = coalesce(i.client_email, c.email),
    client_address = coalesce(i.client_address, c.address)
from public.clients c
where c.id = i.client_id;

update public.invoices
set invoice_number = 'INV-LEGACY-' || upper(substr(id::text, 1, 8))
where invoice_number is null or length(trim(invoice_number)) = 0;

create unique index if not exists invoices_owner_number_unique on public.invoices (user_id, invoice_number);
create index if not exists invoices_owner_created_idx on public.invoices (user_id, created_at desc);
create index if not exists clients_owner_email_idx on public.clients (user_id, lower(email));

alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- Replace prior policies on these owner-scoped tables with one explicit policy
-- per table so an older permissive policy cannot accidentally widen access.
do $$
declare policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename in ('clients', 'invoices', 'invoice_items')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

create policy "Owner manages clients" on public.clients
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Owner manages invoices" on public.invoices
  for all to authenticated using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.clients c where c.id = client_id and c.user_id = (select auth.uid()))
  );

create policy "Owner manages invoice items" on public.invoice_items
  for all to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = (select auth.uid())))
  with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = (select auth.uid())));

grant select, insert, update, delete on public.clients, public.invoices, public.invoice_items to authenticated;

create or replace function public.create_invoice_with_items(p_invoice jsonb, p_items jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $function$
declare
  saved_invoice public.invoices%rowtype;
  saved_items jsonb;
  item_row jsonb;
  invoice_tax_rate numeric(7,4);
  calculated_subtotal numeric(12,2) := 0;
  calculated_tax numeric(12,2) := 0;
  calculated_total numeric(12,2) := 0;
  item_quantity numeric;
  item_unit_price numeric;
begin
  if (p_invoice->>'user_id') is distinct from (select auth.uid())::text then
    raise exception 'Invoice owner does not match the authenticated user';
  end if;
  if nullif(trim(p_invoice->>'client_id'), '') is null then
    raise exception 'A client is required';
  end if;
  if nullif(trim(p_invoice->>'invoice_number'), '') is null then
    raise exception 'An invoice number is required';
  end if;
  if nullif(trim(p_invoice->>'sender_name'), '') is null or nullif(trim(p_invoice->>'sender_email'), '') is null then
    raise exception 'Sender name and email are required';
  end if;
  if nullif(p_invoice->>'invoice_date', '') is null or nullif(p_invoice->>'due_date', '') is null then
    raise exception 'Invoice date and due date are required';
  end if;
  if (p_invoice->>'due_date')::date < (p_invoice->>'invoice_date')::date then
    raise exception 'Due date cannot be earlier than invoice date';
  end if;
  if coalesce(p_invoice->>'status', 'draft') not in ('draft', 'sent', 'paid', 'overdue') then
    raise exception 'Invalid invoice status';
  end if;
  if coalesce(p_invoice->>'currency', 'EUR') not in ('EUR', 'GBP', 'USD', 'PLN', 'CHF') then
    raise exception 'Unsupported invoice currency';
  end if;
  invoice_tax_rate := coalesce((p_invoice->>'tax_rate')::numeric, 0);
  if invoice_tax_rate < 0 or invoice_tax_rate > 100 then
    raise exception 'Tax rate must be between 0 and 100';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'Invoice line items must be an array';
  end if;
  if jsonb_array_length(p_items) = 0 then
    raise exception 'At least one invoice line item is required';
  end if;

  for item_row in select value from jsonb_array_elements(p_items)
  loop
    item_quantity := (item_row->>'quantity')::numeric;
    item_unit_price := (item_row->>'unitPrice')::numeric;
    if nullif(trim(item_row->>'description'), '') is null then
      raise exception 'Line item description is required';
    end if;
    if item_quantity is null or item_quantity <= 0 then
      raise exception 'Line item quantity must be greater than zero';
    end if;
    if item_unit_price is null or item_unit_price < 0 then
      raise exception 'Line item unit price cannot be negative';
    end if;
    calculated_subtotal := calculated_subtotal + (item_quantity * item_unit_price);
  end loop;

  calculated_subtotal := round(calculated_subtotal, 2);
  calculated_tax := round(calculated_subtotal * invoice_tax_rate / 100, 2);
  calculated_total := calculated_subtotal + calculated_tax;

  insert into public.invoices (
    user_id, client_id, client_name, client_company, client_email, client_address,
    invoice_number, sender_name, sender_company, sender_email, sender_address, currency,
    invoice_date, due_date, status, tax_rate,
    subtotal, tax_amount, total_amount, notes
  ) values (
    (p_invoice->>'user_id')::uuid, (p_invoice->>'client_id')::uuid,
    trim(p_invoice->>'client_name'), nullif(trim(p_invoice->>'client_company'), ''),
    trim(p_invoice->>'client_email'), nullif(trim(p_invoice->>'client_address'), ''),
    trim(p_invoice->>'invoice_number'), trim(p_invoice->>'sender_name'),
    nullif(trim(p_invoice->>'sender_company'), ''), trim(p_invoice->>'sender_email'),
    nullif(trim(p_invoice->>'sender_address'), ''), coalesce(nullif(p_invoice->>'currency', ''), 'EUR'),
    (p_invoice->>'invoice_date')::date, (p_invoice->>'due_date')::date,
    coalesce(p_invoice->>'status', 'draft'), invoice_tax_rate,
    calculated_subtotal, calculated_tax, calculated_total, nullif(trim(p_invoice->>'notes'), '')
  ) returning * into saved_invoice;

  for item_row in select value from jsonb_array_elements(p_items)
  loop
    insert into public.invoice_items (invoice_id, description, quantity, unit_price)
    values (saved_invoice.id, trim(item_row->>'description'), (item_row->>'quantity')::numeric, (item_row->>'unitPrice')::numeric);
  end loop;

  select coalesce(jsonb_agg(to_jsonb(ii) order by ii.created_at), '[]'::jsonb)
  into saved_items
  from public.invoice_items ii where ii.invoice_id = saved_invoice.id;

  return jsonb_build_object('invoice', to_jsonb(saved_invoice), 'items', saved_items);
end;
$function$;

revoke all on function public.create_invoice_with_items(jsonb, jsonb) from public, anon;
grant execute on function public.create_invoice_with_items(jsonb, jsonb) to authenticated;


create or replace function public.delete_invoice_with_items(p_invoice_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $function$
begin
  if not exists (select 1 from public.invoices i where i.id = p_invoice_id and i.user_id = (select auth.uid())) then
    raise exception 'Invoice not found or access denied';
  end if;
  delete from public.invoice_items where invoice_id = p_invoice_id;
  delete from public.invoices where id = p_invoice_id and user_id = (select auth.uid());
end;
$function$;

revoke all on function public.delete_invoice_with_items(uuid) from public, anon;
grant execute on function public.delete_invoice_with_items(uuid) to authenticated;


create or replace function public.update_invoice_with_items(p_invoice_id uuid, p_invoice jsonb, p_items jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $function$
declare
  saved_invoice public.invoices%rowtype;
  saved_items jsonb;
  item_row jsonb;
  invoice_tax_rate numeric(7,4);
  calculated_subtotal numeric(12,2) := 0;
  calculated_tax numeric(12,2) := 0;
  calculated_total numeric(12,2) := 0;
  item_quantity numeric;
  item_unit_price numeric;
begin
  if (p_invoice->>'user_id') is distinct from (select auth.uid())::text then
    raise exception 'Invoice owner does not match the authenticated user';
  end if;
  if not exists (
    select 1 from public.clients c
    where c.id = nullif(p_invoice->>'client_id', '')::uuid
      and c.user_id = (select auth.uid())
  ) then
    raise exception 'Client not found or access denied';
  end if;
  if nullif(trim(p_invoice->>'invoice_number'), '') is null then
    raise exception 'An invoice number is required';
  end if;
  if nullif(trim(p_invoice->>'sender_name'), '') is null or nullif(trim(p_invoice->>'sender_email'), '') is null then
    raise exception 'Sender name and email are required';
  end if;
  if nullif(p_invoice->>'invoice_date', '') is null or nullif(p_invoice->>'due_date', '') is null then
    raise exception 'Invoice date and due date are required';
  end if;
  if (p_invoice->>'due_date')::date < (p_invoice->>'invoice_date')::date then
    raise exception 'Due date cannot be earlier than invoice date';
  end if;
  if coalesce(p_invoice->>'status', 'draft') not in ('draft', 'sent', 'paid', 'overdue') then
    raise exception 'Invalid invoice status';
  end if;
  if coalesce(p_invoice->>'currency', 'EUR') not in ('EUR', 'GBP', 'USD', 'PLN', 'CHF') then
    raise exception 'Unsupported invoice currency';
  end if;
  invoice_tax_rate := coalesce((p_invoice->>'tax_rate')::numeric, 0);
  if invoice_tax_rate < 0 or invoice_tax_rate > 100 then
    raise exception 'Tax rate must be between 0 and 100';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one invoice line item is required';
  end if;

  for item_row in select value from jsonb_array_elements(p_items)
  loop
    item_quantity := (item_row->>'quantity')::numeric;
    item_unit_price := (item_row->>'unitPrice')::numeric;
    if nullif(trim(item_row->>'description'), '') is null then
      raise exception 'Line item description is required';
    end if;
    if item_quantity is null or item_quantity <= 0 then
      raise exception 'Line item quantity must be greater than zero';
    end if;
    if item_unit_price is null or item_unit_price < 0 then
      raise exception 'Line item unit price cannot be negative';
    end if;
    calculated_subtotal := calculated_subtotal + item_quantity * item_unit_price;
  end loop;

  calculated_subtotal := round(calculated_subtotal, 2);
  calculated_tax := round(calculated_subtotal * invoice_tax_rate / 100, 2);
  calculated_total := calculated_subtotal + calculated_tax;

  update public.invoices
  set client_id = (p_invoice->>'client_id')::uuid,
      client_name = trim(p_invoice->>'client_name'),
      client_company = nullif(trim(p_invoice->>'client_company'), ''),
      client_email = trim(p_invoice->>'client_email'),
      client_address = nullif(trim(p_invoice->>'client_address'), ''),
      invoice_number = trim(p_invoice->>'invoice_number'),
      sender_name = trim(p_invoice->>'sender_name'),
      sender_company = nullif(trim(p_invoice->>'sender_company'), ''),
      sender_email = trim(p_invoice->>'sender_email'),
      sender_address = nullif(trim(p_invoice->>'sender_address'), ''),
      currency = coalesce(nullif(p_invoice->>'currency', ''), 'EUR'),
      invoice_date = (p_invoice->>'invoice_date')::date,
      due_date = (p_invoice->>'due_date')::date,
      status = coalesce(p_invoice->>'status', 'draft'),
      tax_rate = invoice_tax_rate,
      subtotal = calculated_subtotal,
      tax_amount = calculated_tax,
      total_amount = calculated_total,
      notes = nullif(trim(p_invoice->>'notes'), '')
  where id = p_invoice_id and user_id = (select auth.uid())
  returning * into saved_invoice;

  if not found then
    raise exception 'Invoice not found or access denied';
  end if;

  delete from public.invoice_items where invoice_id = p_invoice_id;
  for item_row in select value from jsonb_array_elements(p_items)
  loop
    insert into public.invoice_items (invoice_id, description, quantity, unit_price)
    values (p_invoice_id, trim(item_row->>'description'), (item_row->>'quantity')::numeric, (item_row->>'unitPrice')::numeric);
  end loop;

  select coalesce(jsonb_agg(to_jsonb(ii) order by ii.created_at), '[]'::jsonb)
  into saved_items
  from public.invoice_items ii where ii.invoice_id = p_invoice_id;

  return jsonb_build_object('invoice', to_jsonb(saved_invoice), 'items', saved_items);
end;
$function$;

revoke all on function public.update_invoice_with_items(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.update_invoice_with_items(uuid, jsonb, jsonb) to authenticated;
