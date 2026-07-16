interface ClientInfoProps {
  clientName: string;
  clientEmail: string;
}

export default function ClientInfo({
  clientName,
  clientEmail,
}: ClientInfoProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Bill To
      </h4>
      <p className="text-sm text-slate-900 font-medium">
        {clientName || "Client Name"}
      </p>
      <p className="text-xs text-slate-600">
        {clientEmail || "client@email.com"}
      </p>
    </div>
  );
}