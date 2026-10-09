import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { InvoiceStatus } from "../features/invoices/types/invoiceTypes";
import { getInvoices, updateInvoice, deleteInvoice } from "../features/invoices/api/invoicesApi";
import { getClients } from "../features/invoices/api/invoiceApi";
import StatusBadge from "../components/common/StatusBadge";

type InvoiceRow = { id: string; invoice_number?: string | null; client_id?: string | null; status: InvoiceStatus; invoice_date?: string | null; due_date?: string | null; amount?: number | null; total_amount?: number | null; created_at?: string | null; };
type ClientRow = { id: string; name: string; email?: string | null; };
const statuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [invoiceData, clientData] = await Promise.all([getInvoices(), getClients()]);
      setInvoices((invoiceData ?? []) as InvoiceRow[]);
      setClients((clientData ?? []) as ClientRow[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load invoices.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const clientLookup = clients.reduce<Record<string,string>>((map, client) => { map[client.id] = client.name; return map; }, {});
  const money = (amount: number | null | undefined) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(Number(amount ?? 0));
  const date = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";

  async function changeStatus(invoice: InvoiceRow, status: InvoiceStatus) {
    setBusyId(invoice.id); setError("");
    try { await updateInvoice(invoice.id, { status }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update invoice status."); }
    finally { setBusyId(""); }
  }

  async function remove(invoice: InvoiceRow) {
    if (!window.confirm("Delete this invoice? This action cannot be undone.")) return;
    setBusyId(invoice.id); setError("");
    try { await deleteInvoice(invoice.id); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete this invoice."); }
    finally { setBusyId(""); }
  }

  return <div className="dashboard-stack">
    <section className="dashboard-welcome"><div><p className="dashboard-eyebrow">BILLING WORKSPACE</p><h2>Your invoices, all in one place.</h2><p>Keep an eye on payment status and follow up on outstanding work.</p></div><Link to="/create" className="dashboard-primary-action"><span>＋</span> New invoice</Link></section>
    {error && <div className="workspace-alert" role="alert">{error}</div>}
    <section className="workspace-card"><div className="workspace-card-heading"><div><h2>Invoice register</h2><p>{invoices.length} saved {invoices.length === 1 ? "invoice" : "invoices"}</p></div><button className="btn btn-secondary" onClick={() => void load()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button></div>
      {loading ? <div className="workspace-empty">Loading invoices…</div> : invoices.length === 0 ? <div className="workspace-empty"><div className="workspace-empty-icon">▤</div><h3>No invoices yet</h3><p>When you create an invoice, it will be tracked here.</p><Link className="workspace-text-link" to="/create">Create an invoice →</Link></div> :
        <div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td><span className="table-primary">{invoice.invoice_number || "INV-" + invoice.id.slice(0,6).toUpperCase()}</span></td><td>{clientLookup[invoice.client_id ?? ""] || "Client record"}</td><td>{date(invoice.invoice_date)}</td><td>{date(invoice.due_date)}</td><td>{money(invoice.total_amount ?? invoice.amount)}</td><td><StatusBadge status={invoice.status} /></td><td><div className="invoice-row-actions"><select aria-label={"Status for invoice " + invoice.id} value={invoice.status} disabled={busyId === invoice.id} onChange={(event) => void changeStatus(invoice, event.target.value as InvoiceStatus)}>{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select><button className="invoice-delete-action" disabled={busyId === invoice.id} onClick={() => void remove(invoice)} aria-label="Delete invoice">Delete</button></div></td></tr>)}</tbody></table></div>}
    </section>
    <div className="workspace-note"><strong>PDF history</strong><span>Invoice records are listed here. Reopening and exporting a previously saved invoice requires the saved invoice-number, sender, and line-item data to be present in your database schema; that persistence audit is part of the production-readiness pass.</span></div>
  </div>;
}
