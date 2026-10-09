import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { Invoice } from "../features/invoices/types/invoiceTypes";
import { getInvoiceById } from "../features/invoices/api/invoicesApi";
import { getInvoiceItems } from "../features/invoices/api/invoiceItemsApi";
import PreviewInvoice from "../components/invoice/PreviewInvoice/PreviewInvoice";
import { exportInvoicePdf } from "../features/invoices/utils/exportPdf";
import SignatureBlock from "../components/common/SignatureBlock";
import Footer from "../components/common/Footer";

function getInvoiceFromRecord(record: Awaited<ReturnType<typeof getInvoiceById>>, items: Awaited<ReturnType<typeof getInvoiceItems>>): Invoice {
  return {
    id: record.id,
    client: {
      id: record.client_id || "",
      user_id: record.user_id || "",
      name: record.client_name || "",
      email: record.client_email || "",
      company: record.client_company || "",
      address: record.client_address || "",
      created_at: record.created_at || "",
      updated_at: record.updated_at || "",
    },
    senderName: record.sender_name || "",
    senderCompany: record.sender_company || "",
    senderEmail: record.sender_email || "",
    senderAddress: record.sender_address || "",
    invoiceNumber: record.invoice_number || ("INV-" + record.id.slice(0, 8).toUpperCase()),
    invoiceDate: record.invoice_date || "",
    dueDate: record.due_date || "",
    currency: record.currency || "EUR",
    items: (items ?? []).map((item, index) => ({
      id: item.id || "saved-" + index,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
    })),
    notes: record.notes || "",
    status: record.status,
    taxRate: Number(record.tax_rate ?? 0),
  };
}

export default function PreviewInvoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(() => (state as { invoice?: Invoice } | null)?.invoice ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(invoiceId));
  const [loadError, setLoadError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    let active = true;
    if (!invoiceId) {
      setIsLoading(false);
      return () => { active = false; };
    }
    setIsLoading(true);
    setLoadError("");
    Promise.all([getInvoiceById(invoiceId), getInvoiceItems(invoiceId)])
      .then(([record, items]) => {
        if (active) setInvoice(getInvoiceFromRecord(record, items));
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Could not load this saved invoice.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [invoiceId]);

  async function handleExport() {
    if (!invoice || isExporting) return;
    setExportError("");
    setIsExporting(true);
    try { await exportInvoicePdf("invoice-preview", invoice.invoiceNumber || "invoice"); }
    catch (error) { setExportError(error instanceof Error ? error.message : "Could not export the invoice PDF. Please try again."); }
    finally { setIsExporting(false); }
  }

  return (
    <div className="preview-workspace">
      <div className="preview-toolbar"><div><p className="dashboard-eyebrow">FINAL REVIEW</p><h2>Review before you send.</h2><p>Check the details and download a PDF copy for your records.</p></div><button className="btn btn-secondary" onClick={() => navigate("/create", { state: { invoice } })} disabled={!invoice}>← Back to editor</button></div>
      <div className="card preview-invoice-card">
        {isLoading ? <div className="empty-state" role="status"><p>Loading saved invoice…</p></div> : loadError ? <div className="empty-state"><p role="alert" className="form-alert">{loadError}</p><button className="btn btn-secondary" onClick={() => navigate("/invoices")}>Back to invoices</button></div> : invoice ? <>
          <div id="invoice-preview" className="invoice-pdf-canvas"><PreviewInvoice invoice={invoice} /><SignatureBlock senderName={invoice.senderName} /><Footer senderEmail={invoice.senderEmail} senderCompany={invoice.senderCompany} /></div>
          <div className="preview-actions"><button className="btn btn-secondary" onClick={() => navigate("/create", { state: { invoice } })}>Edit details</button><button className="btn btn-primary" onClick={() => void handleExport()} disabled={isExporting} aria-busy={isExporting}>{isExporting ? "Preparing PDF…" : "Download PDF ↓"}</button></div>
          {exportError && <p role="alert" className="form-alert mt-lg">{exportError}</p>}
        </> : <div className="empty-state"><p>No invoice data found. Start by creating an invoice.</p><button className="btn btn-primary" onClick={() => navigate("/create")}>Create invoice</button></div>}
      </div>
    </div>
  );
}
