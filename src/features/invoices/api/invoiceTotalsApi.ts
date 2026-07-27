// Responsible for fetching the totals from the Postgres VIEW
import { supabaseClient } from "../../../lib/supabaseClient";

export async function getInvoiceTotals() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  console.log("SESSION DEBUG:", sessionData.session);

  const { data, error } = await supabaseClient
    .from("invoice_totals")
    .select("*")
    .single();

  if (error) throw error;
  return data;
}