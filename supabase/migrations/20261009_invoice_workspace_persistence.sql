-- Persist complete invoice documents and enforce owner-based access.
-- Review table/column names against the live project before applying this migration.

alter table public.invoices add column if not exists invoice_number text;
alter table public.invoices add column if not exists sender_name text;
alter table public.invoices add column if not exists sender_company text;
alter table public.invoices add column if not exists sender_email text;
alter table public.invoices add column if not exists sender_address text;
alter table public.invoices add column if not exists currency text not null default 'EUR';
alter table public.invoices add column if not exists subtotal numeric(12,2) not null default 0;
alter table public.invoices add column if not exists tax_amount numeric(12,2) not null default 0;
alter table public.invoices add column if not exists total_amount numeric(12,2) not null default 0;

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
  with check (user_id = (select auth.uid()));

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
begin
  if (p_invoice->>'user_id') is distinct from (select auth.uid())::text then
    raise exception 'Invoice owner does not match the authenticated user';
  end if;

  insert into public.invoices (
    user_id, client_id, invoice_number, sender_name, sender_company, sender_email,
    sender_address, currency, invoice_date, due_date, status, tax_rate,
    subtotal, tax_amount, total_amount, notes
  ) values (
    (p_invoice->>'user_id')::uuid, (p_invoice->>'client_id')::uuid,
    trim(p_invoice->>'invoice_number'), trim(p_invoice->>'sender_name'),
    nullif(trim(p_invoice->>'sender_company'), ''), trim(p_invoice->>'sender_email'),
    nullif(trim(p_invoice->>'sender_address'), ''), coalesce(nullif(p_invoice->>'currency', ''), 'EUR'),
    (p_invoice->>'invoice_date')::date, (p_invoice->>'due_date')::date,
    coalesce(p_invoice->>'status', 'draft'), coalesce((p_invoice->>'tax_rate')::numeric, 0),
    coalesce((p_invoice->>'subtotal')::numeric, 0), coalesce((p_invoice->>'tax_amount')::numeric, 0),
    coalesce((p_invoice->>'total_amount')::numeric, 0), nullif(trim(p_invoice->>'notes'), '')
  ) returning * into saved_invoice;

  for item_row in select value from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
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
