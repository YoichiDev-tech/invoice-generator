import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

export default function SenderInfo({ sender }: { sender: Invoice }) {
  return <div className="party-block"><h4 className="section-label">From</h4><p className="party-name">{sender.senderName || "Your Name"}</p><p className="party-detail">{sender.senderCompany || "Your Business"}</p>{sender.senderAddress && <p className="party-detail">{sender.senderAddress}</p>}<p className="party-detail party-detail--muted">{sender.senderEmail || "your@email.com"}</p></div>;
}
