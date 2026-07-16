interface SenderInfoProps {
  senderName: string;
  senderCompany: string;
  senderEmail: string;
}

export default function SenderInfo({
  senderName,
  senderCompany,
  senderEmail,
}: SenderInfoProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        From
      </h4>
      <p className="text-sm text-slate-900 font-medium">
        {senderName || "Your Name"}
      </p>
      <p className="text-sm text-slate-700">
        {senderCompany || "Your Agency / Company"}
      </p>
      <p className="text-xs text-slate-600">
        {senderEmail || "your@email.com"}
      </p>
    </div>
  );
}