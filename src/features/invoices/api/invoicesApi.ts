import { supabaseClient } from "../../../lib/supabaseClient";
import type { Invoice, InvoiceStatus } from "../types/invoiceTypes";

export interface InvoiceRecord {
  id: string;
  user_id: string;
  client_id: string;
  client_name: string;
  client_company: string | null;
  client_email: string;
  client_address: string | null;
  invoice_number: string;
  sender_name: string;
  sender_company: string | null;
  sender_email: string;
  sender_address: string | null;
  currency: string;
  invoice_date: string;
  due_date: string;
  status: InvoiceStatus;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export function invoiceAmounts(invoice: Pick<Invoice, "items" | "taxRate">) {
  const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
  const subtotal = roundMoney(invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const taxAmount = roundMoney(subtotal * (invoice.taxRate / 100));
  return { subtotal, taxAmount, totalAmount: roundMoney(subtotal + taxAmount) };
}

export async function createInvoiceWithItems(invoice: Omit<InvoiceRecord, "id" | "created_at" | "updated_at">, items: Array<{ description: string; quantity: number; unitPrice: number }>) {
  const { data, error } = await supabaseClient.rpc("create_invoice_with_items", { p_invoice: invoice, p_items: items });
  if (error) throw error;
  const result = data as { invoice: InvoiceRecord; items: Array<{ id: string; invoice_id: string; description: string; quantity: number; unit_price: number }> };
  if (!result?.invoice?.id) throw new Error("The invoice could not be saved. Please try again.");
  return result;
}

export async function updateInvoiceWithItems(
  id: string,
  invoice: Omit<InvoiceRecord, "id" | "created_at" | "updated_at">,
  items: Array<{ description: string; quantity: number; unitPrice: number }>
) {
  const { data, error } = await supabaseClient.rpc("update_invoice_with_items", {
    p_invoice_id: id,
    p_invoice: invoice,
    p_items: items,
  });
  if (error) throw error;
  const result = data as { invoice: InvoiceRecord; items: Array<{ id: string; invoice_id: string; description: string; quantity: number; unit_price: number }> };
  if (!result?.invoice?.id) throw new Error("The invoice could not be updated. Please try again.");
  return result;
}

export async function createInvoice(invoice: Omit<InvoiceRecord, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabaseClient.from("invoices").insert(invoice).select().single();
  if (error) throw error;
  return data;
}

export async function getInvoices() {
  const { data, error } = await supabaseClient.from("invoices").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateInvoice(id: string, updates: Partial<InvoiceRecord>) {
  const { data, error } = await supabaseClient.from("invoices").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string) {
  const { error } = await supabaseClient.rpc("delete_invoice_with_items", { p_invoice_id: id });
  if (error) throw error;
}
