// Responsible for fetching the totals from the Postgres VIEW
import { supabaseClient } from "../../../lib/supabaseClient";
import type { InvoiceTotals } from "../hooks/useInvoiceTotals";

export async function getInvoiceTotals(): Promise<InvoiceTotals> {
  await supabaseClient.auth.getSession();

  const { data, error } = await supabaseClient
    .from("invoice_totals")
    .select("*")
    .single();

  if (error) throw error;
  if (!data) throw new Error("No invoice totals returned");

  return data as unknown as InvoiceTotals;
}