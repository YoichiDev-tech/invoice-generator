import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

interface SenderInfoProps {
  sender: Invoice; 
}

export default function SenderInfo({ sender }: SenderInfoProps) {
  return (
    <div className="party-block">
      <h4 className="section-label">From</h4>
      <p className="party-name">{sender.senderName || "Your Name"}</p>
      <p className="party-detail">{sender.senderCompany || "Your Agency / Company"}</p>
      <p className="party-detail party-detail--muted">
        {sender.senderEmail || "your@email.com"}
      </p>
    </div>
  );
}