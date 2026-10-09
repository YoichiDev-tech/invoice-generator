import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Client, Invoice, InvoiceStatus } from "../features/invoices/types/invoiceTypes";
import { getInvoices, updateInvoice, deleteInvoice } from "../features/invoices/api/invoicesApi";
import { getClients } from "../features/invoices/api/invoiceApi";
import { getInvoiceItems } from "../features/invoices/api/invoiceItemsApi";
import StatusBadge from "../components/common/StatusBadge";

type InvoiceRow = { id: string; invoice_number?: string | null; client_id?: string | null; sender_name?: string | null; sender_company?: string | null; sender_email?: string | null; sender_address?: string | null; status: InvoiceStatus; invoice_date?: string | null; due_date?: string | null; tax_rate?: number | null; notes?: string | null; amount?: number | null; total_amount?: number | null; currency?: string | null; created_at?: string | null; };
type ClientRow = Client;
const statuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export default function InvoicesPage() {
  const navigate = useNavigate();
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

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  const clientLookup = clients.reduce<Record<string,string>>((map, client) => { map[client.id] = client.name; return map; }, {});
  const money = (amount: number | null | undefined, currency = "EUR") => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount ?? 0));
  const date = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";

  async function changeStatus(invoice: InvoiceRow, status: InvoiceStatus) {
    setBusyId(invoice.id); setError("");
    try { await updateInvoice(invoice.id, { status }); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update invoice status."); }
    finally { setBusyId(""); }
  }

  async function openPreview(invoice: InvoiceRow) {
    setBusyId(invoice.id); setError("");
    try {
      if (!invoice.client_id) throw new Error("This invoice has no linked client record.");
      const client = clients.find((candidate) => candidate.id === invoice.client_id);
      if (!client) throw new Error("The linked client could not be found.");
      const savedItems = await getInvoiceItems(invoice.id);
      const previewInvoice: Invoice = {
        id: invoice.id,
        client,
        senderName: invoice.sender_name || "",
        senderCompany: invoice.sender_company || "",
        senderEmail: invoice.sender_email || "",
        senderAddress: invoice.sender_address || "",
        invoiceNumber: invoice.invoice_number || ("INV-" + invoice.id.slice(0, 8).toUpperCase()),
        invoiceDate: invoice.invoice_date || "",
        dueDate: invoice.due_date || "",
        currency: invoice.currency || "EUR",
        items: (savedItems ?? []).map((item, index) => ({ id: item.id || "saved-" + index, description: item.description, quantity: Number(item.quantity), unitPrice: Number(item.unit_price) })),
        notes: invoice.notes || "",
        status: invoice.status,
        taxRate: Number(invoice.tax_rate ?? 0),
      };
      navigate("/preview", { state: { invoice: previewInvoice } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reopen this invoice.");
    } finally { setBusyId(""); }
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
        <div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td><span className="table-primary">{invoice.invoice_number || "INV-" + invoice.id.slice(0,6).toUpperCase()}</span></td><td>{clientLookup[invoice.client_id ?? ""] || "Client record"}</td><td>{date(invoice.invoice_date)}</td><td>{date(invoice.due_date)}</td><td>{money(invoice.total_amount ?? invoice.amount, invoice.currency || "EUR")}</td><td><StatusBadge status={invoice.status} /></td><td><div className="invoice-row-actions"><button className="invoice-preview-action" disabled={busyId === invoice.id} onClick={() => void openPreview(invoice)}>Preview</button><select aria-label={"Status for invoice " + invoice.id} value={invoice.status} disabled={busyId === invoice.id} onChange={(event) => void changeStatus(invoice, event.target.value as InvoiceStatus)}>{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select><button className="invoice-delete-action" disabled={busyId === invoice.id} onClick={() => void remove(invoice)} aria-label="Delete invoice">Delete</button></div></td></tr>)}</tbody></table></div>}
    </section>
    <div className="workspace-note"><strong>PDF history</strong><span>Invoice records are listed here. Reopening and exporting a previously saved invoice requires the saved invoice-number, sender, and line-item data to be present in your database schema; that persistence audit is part of the production-readiness pass.</span></div>
  </div>;
}
