import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

interface SenderInfoProps {
  sender: Invoice; 
}

export default function SenderInfo({ sender }: SenderInfoProps) {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        From
      </h4>
      <p className="text-sm text-slate-900 font-medium">
        {sender.senderName || "Your Name"}
      </p>
      <p className="text-sm text-slate-700">
        {sender.senderCompany || "Your Agency / Company"}
      </p>
      <p className="text-xs text-slate-600">
        {sender.senderEmail || "your@email.com"}
      </p>
    </div>
  );
}