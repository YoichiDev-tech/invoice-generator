import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

interface ClientInfoProps {
  client: Invoice["client"];
}

export default function ClientInfo({ client }: ClientInfoProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Bill To
      </h4>
      <p className="text-sm text-slate-900 font-medium">
        {client.name || "Client Name"}
      </p>
      <p className="text-xs text-slate-600">
        {client.email || "client@email.com"}
      </p>
    </div>
  );
}