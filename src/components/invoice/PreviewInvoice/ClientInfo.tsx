import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

export default function ClientInfo({ client }: { client: Invoice["client"] }) {
  return <div className="party-block"><h4 className="section-label">Bill To</h4><p className="party-name">{client.name || "Client Name"}</p>{client.company && <p className="party-detail">{client.company}</p>}<p className="party-detail party-detail--muted">{client.email || "client@email.com"}</p>{client.address && <p className="party-detail">{client.address}</p>}</div>;
}
