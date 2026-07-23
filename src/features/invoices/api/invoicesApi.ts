import { supabaseClient } from "../../../lib/supabaseClient";

// It is intentionally distinct from the UI-facing Invoice type in invoiceTypes.ts,
// which is camelCase and shaped for form state, not persistence
export interface InvoiceRecord {
  id: string;
  user_id: string;
  client_id: string;
  invoice_date: string;
  due_date: string;
  status: string;
  tax_rate: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Create an invoice
export async function createInvoice(invoice: Omit<InvoiceRecord, "id" | "created_at" | "updated_at">) {
    const {data, error} = await supabaseClient
    .from("invoices")
    .insert(invoice)
    .select()
    .single();

    if(error) throw error;
    return data;
}

// Get all invoices
export async function getInvoices() {
    const {data, error} = await supabaseClient
    .from("invoices")
    .select("*")
    .order("created_at", {ascending: false});

    if(error) throw error;
    return data;
}

// Update invoice
export async function updateInvoice(id: string, updates: Partial<InvoiceRecord>) {
  const { data, error } = await supabaseClient
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete invoice
export async function deleteInvoice(id: string) {
  const { error } = await supabaseClient
    .from("invoices")
    .delete()
    .eq("id", id);

  if (error) throw error;
}