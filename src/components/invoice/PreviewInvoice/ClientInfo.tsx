import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

interface ClientInfoProps {
  client: Invoice["client"];
}

export default function ClientInfo({ client }: ClientInfoProps) {
  return (
    <div className="party-block">
      <h4 className="section-label">Bill To</h4>
      <p className="party-name">{client.name || "Client Name"}</p>
      <p className="party-detail party-detail--muted">
        {client.email || "client@email.com"}
      </p>
    </div>
  );
}