import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PreviewInvoice from "../components/invoice/PreviewInvoice/PreviewInvoice";
import { exportInvoicePdf } from "../features/invoices/utils/exportPdf";

// Reusable components
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
    try {
      await exportInvoicePdf("invoice-preview", invoice.invoiceNumber || "invoice");
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Could not export the invoice PDF. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="page space-y invoice-theme-light">
      <h1 className="section-title">Invoice Preview</h1>

      <div className="card space-y">
        {invoice ? (
          <>
            {/* PDF wrapper — status badge, branding, totals, etc all live inside
                PreviewInvoice so there's a single source of truth for the layout */}
            <div id="invoice-preview" className="space-y">
              <PreviewInvoice invoice={invoice} />

              {/* Signature block */}
              <SignatureBlock senderName={invoice.senderName} />

              {/* Footer must live INSIDE #invoice-preview — html2canvas only
                  captures this wrapper, so anything outside it never
                  appears in the exported PDF */}
              <Footer senderEmail={invoice.senderEmail} senderCompany={invoice.senderCompany} />
            </div>

            {/* Buttons */}
            <div className="grid-2">
              <button className="btn btn-secondary" onClick={() => navigate("/create")}>
                Edit Invoice
              </button>

              <button
                className="btn btn-primary"
                onClick={() => void handleExport()}
                disabled={isExporting}
                aria-busy={isExporting}
              >
                {isExporting ? "Preparing PDF…" : "Download / Export PDF"}
              </button>
            </div>
            {exportError && (
              <p role="alert" className="form-alert mt-lg">
                {exportError}
              </p>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No invoice data found. Create an invoice first to see its preview here.</p>
            <button className="btn btn-primary" onClick={() => navigate("/create")}>
              Create an Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}