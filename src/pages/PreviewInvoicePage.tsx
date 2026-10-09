import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PreviewInvoice from "../components/invoice/PreviewInvoice/PreviewInvoice";
import { exportInvoicePdf } from "../features/invoices/utils/exportPdf";
import SignatureBlock from "../components/common/SignatureBlock";
import Footer from "../components/common/Footer";

export default function PreviewInvoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const invoice = state?.invoice;

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
      <div className="preview-toolbar"><div><p className="dashboard-eyebrow">FINAL REVIEW</p><h2>Review before you send.</h2><p>Check the details and download a PDF copy for your records.</p></div><button className="btn btn-secondary" onClick={() => navigate("/create")}>← Back to editor</button></div>
      <div className="card preview-invoice-card">
        {invoice ? <>
          <div id="invoice-preview" className="invoice-pdf-canvas"><PreviewInvoice invoice={invoice} /><SignatureBlock senderName={invoice.senderName} /><Footer senderEmail={invoice.senderEmail} senderCompany={invoice.senderCompany} /></div>
          <div className="preview-actions"><button className="btn btn-secondary" onClick={() => navigate("/create")}>Edit details</button><button className="btn btn-primary" onClick={() => void handleExport()} disabled={isExporting} aria-busy={isExporting}>{isExporting ? "Preparing PDF…" : "Download PDF ↓"}</button></div>
          {exportError && <p role="alert" className="form-alert mt-lg">{exportError}</p>}
        </> : <div className="empty-state"><p>No invoice data found. Start by creating an invoice.</p><button className="btn btn-primary" onClick={() => navigate("/create")}>Create invoice</button></div>}
      </div>
    </div>
  );
}
