// Kept for compatibility with older deployments. The workspace now computes
// per-currency totals from the authenticated invoice list instead of relying on
// an aggregate view whose row-level security must be independently verified.
import { supabaseClient } from "../../../lib/supabaseClient";
import type { InvoiceTotals } from "../hooks/useInvoiceTotals";
import { getInvoices } from "./invoicesApi";

export async function getInvoiceTotals(): Promise<InvoiceTotals> {
  await supabaseClient.auth.getSession();
  const rows = (await getInvoices()) as Array<{ status?: string; currency?: string | null; total_amount?: number | string | null; amount?: number | string | null }>;
  const outstanding: Record<string, number> = {};
  const paid: Record<string, number> = {};
  for (const row of rows) {
    const currency = row.currency || "EUR";
    const amount = Number(row.total_amount ?? row.amount ?? 0);
    if (!Number.isFinite(amount)) continue;
    if (row.status === "paid") paid[currency] = (paid[currency] ?? 0) + amount;
    else outstanding[currency] = (outstanding[currency] ?? 0) + amount;
  }
  return { total_invoices: rows.length, outstanding_by_currency: outstanding, paid_by_currency: paid };
}
