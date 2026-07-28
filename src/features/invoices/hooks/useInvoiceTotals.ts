import { useEffect, useState } from "react";
import { getInvoiceTotals } from "../api/invoiceTotalsApi";

export interface InvoiceTotals {
  total_invoices: number;
  total_outstanding: number;
  total_paid: number;
}

export function useInvoiceTotals() {
  const [totals, setTotals] = useState<InvoiceTotals | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getInvoiceTotals();
        if (isMounted) setTotals(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { totals, loading, error };
}