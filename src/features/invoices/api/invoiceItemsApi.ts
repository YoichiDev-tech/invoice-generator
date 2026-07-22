import { supabaseClient } from "../../../lib/supabaseClient";

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

// Create item
export async function createInvoiceItem(
  item: Omit<InvoiceItem, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabaseClient
    .from("invoice_items")
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get items for an invoice
export async function getInvoiceItems(invoiceId: string) {
  const { data, error } = await supabaseClient
    .from("invoice_items")
    .select("*")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// Update item
export async function updateInvoiceItem(
  id: string,
  updates: Partial<InvoiceItem>
) {
  const { data, error } = await supabaseClient
    .from("invoice_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete item
export async function deleteInvoiceItem(id: string) {
  const { error } = await supabaseClient
    .from("invoice_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}