import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { InvoiceStatus } from "../features/invoices/types/invoiceTypes";
import { supabaseClient } from "../lib/supabaseClient";
import StatusBadge from "../components/common/StatusBadge";
import { useInvoiceTotals } from "../features/invoices/hooks/useInvoiceTotals";
import { getClients } from "../features/invoices/api/invoiceApi";
import { getInvoices } from "../features/invoices/api/invoicesApi";

type RecentInvoice = { id: string; client_name?: string | null; invoice_number?: string | null; client_id: string | null; amount?: number | null; total_amount?: number | null; currency?: string | null; status: InvoiceStatus; invoice_date: string; due_date?: string | null; created_at?: string | null; };
type ClientRecord = { id: string; name: string; };

export default function DashboardPage() {
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [error, setError] = useState("");
  const { totals, loading: totalsLoading } = useInvoiceTotals();

  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
          if (active) { setRecentInvoices([]); setClients([]); setLoading(false); }
          return;
        }
        const [invoiceData, clientData] = await Promise.all([getInvoices(), getClients()]);
        if (!active) return;
        setRecentInvoices((invoiceData ?? []).slice(0, 5) as RecentInvoice[]);
        setClients((clientData ?? []) as ClientRecord[]);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadData();
    return () => { active = false; };
  }, []);

  const clientLookup = clients.reduce<Record<string, string>>((acc, client) => { acc[client.id] = client.name; return acc; }, {});
  const currencyGroups = (values: Record<string, number> | undefined) => { const entries = Object.entries(values ?? {}).filter(([, amount]) => Number.isFinite(amount) && amount !== 0); return entries.length ? entries.map(([currencyCode, amount]) => new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode, maximumFractionDigits: 2 }).format(amount)).join(" · ") : "—"; };
  const currency = (amount: number | null | undefined, currencyCode = "EUR") => new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(Number(amount ?? 0));
  const effectiveStatus = (invoice: RecentInvoice): InvoiceStatus => invoice.status !== "paid" && invoice.status !== "draft" && invoice.due_date && new Date(invoice.due_date).getTime() < new Date().setHours(0, 0, 0, 0) ? "overdue" : invoice.status;

  return (
    <div className="dashboard-stack">
      {error && <div className="workspace-alert" role="alert">{error}</div>}
      <section className="dashboard-welcome">
        <div><p className="dashboard-eyebrow">YOUR BUSINESS SNAPSHOT</p><h2>Make the admin feel lighter.</h2><p>Keep client billing organized so you can spend more time doing the work you’re paid for.</p></div>
        <Link to="/create" className="dashboard-primary-action"><span aria-hidden="true">＋</span> Create invoice</Link>
      </section>
      <section className="dashboard-metrics">
        <article className="dashboard-metric"><div className="dashboard-metric-top"><span>Total invoices</span><span className="dashboard-metric-icon">▤</span></div><p>{totalsLoading ? "—" : totals?.total_invoices ?? 0}</p><small>All invoices in your workspace</small></article>
        <article className="dashboard-metric"><div className="dashboard-metric-top"><span>Clients</span><span className="dashboard-metric-icon">♙</span></div><p>{loading ? "—" : clients.length}</p><small>People and businesses you bill</small></article>
        <article className="dashboard-metric"><div className="dashboard-metric-top"><span>Outstanding</span><span className="dashboard-metric-icon">◷</span></div><p className="dashboard-money-value">{totalsLoading ? "—" : currencyGroups(totals?.outstanding_by_currency)}</p><small>Invoices still awaiting payment</small></article>
        <article className="dashboard-metric"><div className="dashboard-metric-top"><span>Paid</span><span className="dashboard-metric-icon">✓</span></div><p className="dashboard-money-value">{totalsLoading ? "—" : currencyGroups(totals?.paid_by_currency)}</p><small>Recorded as paid</small></article>
      </section>
      <section className="workspace-card">
        <div className="workspace-card-heading"><div><h2>Recent invoices</h2><p>Your latest billing activity.</p></div><Link to="/invoices" className="workspace-text-link">View all invoices <span aria-hidden="true">→</span></Link></div>
        {loading ? <div className="workspace-empty">Loading your invoices…</div> : recentInvoices.length === 0 ? <div className="workspace-empty"><div className="workspace-empty-icon">▤</div><h3>No invoices yet</h3><p>Create your first invoice to start keeping your freelance billing in one place.</p><Link className="workspace-text-link" to="/create">Create your first invoice →</Link></div> : <div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Status</th><th>Issue date</th></tr></thead><tbody>{recentInvoices.map((invoice) => <tr key={invoice.id}><td><span className="table-primary">{invoice.invoice_number || ("INV-" + invoice.id.slice(0, 6).toUpperCase())}</span></td><td>{invoice.client_name || clientLookup[invoice.client_id ?? ""] || "Client record"}</td><td>{currency(invoice.total_amount ?? invoice.amount, invoice.currency || "EUR")}</td><td><StatusBadge status={effectiveStatus(invoice)} /></td><td>{invoice.invoice_date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(invoice.invoice_date)) : "—"}</td></tr>)}</tbody></table></div>}
      </section>
      <section className="dashboard-quick-actions"><div><h2>Keep moving</h2><p>Shortcuts for the work you do most often.</p></div><div className="dashboard-action-grid"><Link to="/create" className="dashboard-action-card"><span className="dashboard-action-symbol">＋</span><span><strong>New invoice</strong><small>Prepare a client-ready document</small></span><span className="dashboard-action-arrow">↗</span></Link><Link to="/clients" className="dashboard-action-card"><span className="dashboard-action-symbol">♙</span><span><strong>Manage clients</strong><small>Keep contact details up to date</small></span><span className="dashboard-action-arrow">↗</span></Link><Link to="/settings" className="dashboard-action-card"><span className="dashboard-action-symbol">⚙</span><span><strong>Business settings</strong><small>Set your default invoice details</small></span><span className="dashboard-action-arrow">↗</span></Link></div></section>
    </div>
  );
}
