import type { InvoiceStatus } from "../../features/invoices/types/invoiceTypes";

interface StatusBadgeProps {
  status: InvoiceStatus;
}

// Colour + label per status. Kept in one place so the badge always
// reflects the invoice's real lifecycle state, not just paid/unpaid
const STATUS_STYLES: Record<InvoiceStatus, { label: string; bg: string; color: string }> = {
  draft: { label: "Draft", bg: "#e2e8f020", color: "#475569" },
  sent: { label: "Sent", bg: "#2563eb20", color: "#1d4ed8" },
  paid: { label: "Paid", bg: "#22c55e20", color: "#15803d" },
  overdue: { label: "Overdue", bg: "#ef444420", color: "#b91c1c" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft;

  return (
    <span
      className="status-badge"
      style={{
        background: style.bg,
        color: style.color,
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {style.label}
    </span>
  );
}