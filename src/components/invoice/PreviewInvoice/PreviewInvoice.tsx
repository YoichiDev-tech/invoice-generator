import type { Invoice } from "../../../features/invoices/types/invoiceTypes";
import { formatCurrency } from "../../../features/invoices/utils/formatCurrency";
import SenderInfo from "./SenderInfo";
import ClientInfo from "./ClientInfo";
import InvoiceDetails from "./InvoiceDetails";
import ItemTable from "./ItemTable";

export default function PreviewInvoice({ invoice }: { invoice: Invoice }) {
  const roundMoney = (amount: number) => Math.round((amount + Number.EPSILON) * 100) / 100;
  const subtotal = roundMoney(invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const taxRate = invoice.taxRate || 0;
  const taxAmount = roundMoney(subtotal * (taxRate / 100));
  const total = roundMoney(subtotal + taxAmount);
  return <div className="preview-container space-y">
    <div className="preview-top-row"><div className="preview-branding"><div className="branding-logo-placeholder">{invoice.senderCompany || "Your Company"}</div></div><div className="preview-title-block"><h1 className="invoice-title">INVOICE</h1></div></div>
    <InvoiceDetails invoice={invoice} />
    <div className="preview-header"><div className="preview-block"><SenderInfo sender={invoice} /></div><div className="preview-block"><ClientInfo client={invoice.client} /></div></div>
    <div className="preview-items-wrapper"><ItemTable itemRows={invoice.items} currency={invoice.currency} /></div>
    <div className="preview-totals space-y">
      <div className="grid-2"><span className="label">Subtotal</span><span>{formatCurrency(subtotal, invoice.currency)}</span></div>
      <div className="grid-2"><span className="label">Tax ({taxRate}%)</span><span>{formatCurrency(taxAmount, invoice.currency)}</span></div>
      <div className="grid-2 preview-total-row"><span>Total Due</span><span>{formatCurrency(total, invoice.currency)}</span></div>
    </div>
    {invoice.notes && <div className="preview-notes"><h3 className="label">Notes / Payment Terms</h3><p>{invoice.notes}</p></div>}
  </div>;
}
