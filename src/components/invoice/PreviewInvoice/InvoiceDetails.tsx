import type { Invoice } from "../../../features/invoices/types/invoiceTypes";
import StatusBadge from "../../common/StatusBadge";

interface InvoiceDetailsProps {
  invoice: Invoice;
}

// Formats an ISO date string (YYYY-MM-DD) into a readable, locale-aware date
// Falls back to the raw string if it can't be parsed
function formatDate(value?: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <div className="preview-meta-grid">
      <div className="preview-meta-item">
        <span className="label">Invoice Number</span>
        <span className="preview-meta-value">{invoice.invoiceNumber || "—"}</span>
      </div>

      <div className="preview-meta-item">
        <span className="label">Invoice Date</span>
        <span className="preview-meta-value">{formatDate(invoice.invoiceDate)}</span>
      </div>

      <div className="preview-meta-item">
        <span className="label">Due Date</span>
        <span className="preview-meta-value">{formatDate(invoice.dueDate)}</span>
      </div>

      <div className="preview-meta-item">
        <span className="label">Status</span>
        <StatusBadge status={invoice.status || "draft"} />
      </div>
    </div>
  );
}