// Loads the totals and exposes loading/errors states
import { useEffect, useState } from "react";
import { getInvoiceTotals } from "../api/invoiceTotalsApi";

type InvoiceTotals = {
  total_invoices: number;
  total_paid: number;
  total_outstanding: number;
  total_draft: number;
  total_cancelled: number;
  total_sent: number;
  total_pending: number;
  total_overdue: number;
};

export function useInvoiceTotals() {
  const [totals, setTotals] = useState<InvoiceTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInvoiceTotals();
        setTotals(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { totals, loading, error };
}