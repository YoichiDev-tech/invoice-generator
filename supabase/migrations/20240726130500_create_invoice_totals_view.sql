CREATE OR REPLACE VIEW public.invoice_totals AS
SELECT
    auth.uid() AS user_id,
    COUNT(*) AS total_invoices,
    COUNT(*) FILTER (WHERE status = 'paid') AS total_paid,
    COUNT(*) FILTER (WHERE status IN ('sent', 'pending', 'overdue')) AS total_outstanding,
    COUNT(*) FILTER (WHERE status = 'draft') AS total_draft,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
    COUNT(*) FILTER (WHERE status = 'sent') AS total_sent,
    COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
    COUNT(*) FILTER (WHERE status = 'overdue') AS total_overdue
FROM public.invoices
WHERE user_id = auth.uid();