// Loads the totals and exposes loading/errors states
import { useEffect, useState } from "react";
import { getInvoiceTotals } from "../api/invoiceTotalsApi";

export interface InvoiceTotals {
  total_invoices: number;
  total_outstanding: number;
  total_paid: number;
}

export function useInvoiceTotals() {
  const [totals, setTotals] = useState<InvoiceTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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