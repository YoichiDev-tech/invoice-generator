import type { Invoice, InvoiceItem } from "../../../features/invoices/types/invoiceTypes";
import SenderInfo from "./SenderInfo";
import ClientInfo from "./ClientInfo";
import InvoiceDetails from "./InvoiceDetails";
import ItemTable from "./ItemTable";

interface PreviewInvoiceProps {
  invoice: Invoice; 
}

export default function PreviewInvoice({ invoice }: PreviewInvoiceProps) {

  const subtotal = invoice.items.reduce(
    (sum: number, item: InvoiceItem) => sum + item.quantity * item.unitPrice, 
    0
  );

  const taxRate = invoice.taxRate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="preview-container space-y">

      {/* Branding block */}
      <div className="preview-branding space-y">
        <div className="branding-logo">
          <div className="branding-logo-placeholder">
            {invoice.senderCompany || "Yoichi Digital"}
          </div>
        </div>

        <div className="branding-name">
          <h2>{invoice.senderCompany || "Yoichi Digital"}</h2>
          <p className="branding-tagline">Professional Invoice</p>
        </div>
      </div>

      {/* Invoice header */}
      <div className="preview-header-title space-y">
        <h1 className="invoice-title">INVOICE</h1>

        <div className="grid-2">
          <div className="preview-block">
            <span className="label">Invoice Number</span>
            <span>{invoice.invoiceNumber}</span>
          </div>

          <div className="preview-block">
            <span className="label">Invoice Date</span>
            <span>{invoice.invoiceDate}</span>
          </div>
        </div>
      </div>

      <div className="preview-header">
        <div className="preview-block">
          <SenderInfo sender={invoice} /> 
        </div>

        <div className="preview-block">
          <ClientInfo client={invoice.client} /> 
        </div>
      </div>

      <div className="preview-details">
        <InvoiceDetails invoice={invoice} /> 
      </div>

      <div className="preview-items-wrapper">
        <ItemTable itemRows={invoice.items} /> 
      </div>

      {/* Totals section */}
      <div className="preview-totals space-y">
        <div className="grid-2">
          <span className="label">Subtotal</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>

        <div className="grid-2">
          <span className="label">Tax ({taxRate}%)</span>
          <span>£{taxAmount.toFixed(2)}</span>
        </div>

        <div className="grid-2" style={{ fontWeight: 600 }}>
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="preview-notes">
          <h3 className="label">Notes / Payment Terms</h3>
          <p>{invoice.notes}</p>
        </div>
      )}
    </div>
  );
}