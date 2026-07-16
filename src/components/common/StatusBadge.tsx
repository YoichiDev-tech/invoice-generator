interface StatusBadgeProps {
  status: "PAID" | "UNPAID";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isPaid = status === "PAID";

  return (
    <span
      className="status-badge"
      style={{
        background: isPaid ? "#22c55e20" : "#ef444420",
        color: isPaid ? "#15803d" : "#b91c1c",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}