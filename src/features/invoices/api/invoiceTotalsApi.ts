// Responsible for fetching the totals from the Postgres VIEW
import { supabaseClient } from "../../../lib/supabaseClient";

export async function getInvoiceTotals() {
  const {data: {user}} = await supabaseClient.auth.getUser();

  if (!sessionData.session) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabaseClient
    .from("invoice_totals")
    .select("*")
    .single();

  if (error) throw error;
  return data;
}