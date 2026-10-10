import { useEffect, useState } from "react";
import { getInvoices } from "../api/invoicesApi";

export interface InvoiceTotals {
  total_invoices: number;
  outstanding_by_currency: Record<string, number>;
  paid_by_currency: Record<string, number>;
}

type InvoiceAmountRow = { status?: string; currency?: string | null; total_amount?: number | string | null; amount?: number | string | null; };

export function useInvoiceTotals() {
  const [totals, setTotals] = useState<InvoiceTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const invoices = (await getInvoices()) as InvoiceAmountRow[];
        const outstanding: Record<string, number> = {};
        const paid: Record<string, number> = {};
        for (const invoice of invoices) {
          const currency = invoice.currency || "EUR";
          const amount = Number(invoice.total_amount ?? invoice.amount ?? 0);
          if (!Number.isFinite(amount)) continue;
          if (invoice.status === "paid") paid[currency] = (paid[currency] ?? 0) + amount;
          else if (invoice.status !== "draft") outstanding[currency] = (outstanding[currency] ?? 0) + amount;
        }
        if (active) setTotals({ total_invoices: invoices.length, outstanding_by_currency: outstanding, paid_by_currency: paid });
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause : new Error(String(cause)));
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  return { totals, loading, error };
}
