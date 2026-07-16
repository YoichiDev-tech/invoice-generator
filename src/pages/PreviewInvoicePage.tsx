import { useLocation, useNavigate } from "react-router-dom";
import PreviewInvoice from "../components/invoice/PreviewInvoice/PreviewInvoice";
import { exportInvoicePdf } from "../features/invoices/utils/exportPdf";

// Reusable components
import StatusBadge from "../components/common/StatusBadge";
import SignatureBlock from "../components/common/SignatureBlock";
import Footer from "../components/common/Footer";

export default function PreviewInvoicePage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const invoice = state?.invoice;

  return (
    <div className="page space-y invoice-theme-light">
      <h1 className="section-title">Invoice Preview</h1>

      <div className="card space-y">
        {invoice ? (
          <>
            {/* PDF wrapper */}
            <div id="invoice-preview" className="space-y">

              {/* Status badge */}
              <StatusBadge status={invoice.status || "UNPAID"} />

              {/* Full invoice preview (includes logo + branding) */}
              <PreviewInvoice invoice={invoice} />

              {/* Signature block */}
              <SignatureBlock senderName={invoice.senderName} />
            </div>

            {/* Buttons */}
            <div className="grid-2">
              <button className="btn btn-secondary" onClick={() => navigate("/create")}>
                Edit Invoice
              </button>

              <button
                className="btn btn-primary"
                onClick={() => exportInvoicePdf("invoice-preview", "invoice")}
              >
                Download / Export PDF
              </button>
            </div>

            <Footer
              senderEmail={invoice.senderEmail}
              senderCompany={invoice.senderCompany}
            />
          </>
        ) : (
          <p>No invoice data found.</p>
        )}
      </div>
    </div>
  );
}