import type { Invoice, InvoiceItem } from "../../../features/invoices/types/invoiceTypes";
import { formatCurrency } from "../../../features/invoices/utils/formatCurrency";
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
      {/* Header: company branding on the left, "INVOICE" title on the right —
          the layout real invoices use so the document is identifiable at a glance */}
      <div className="preview-top-row">
        <div className="preview-branding">
          <div className="branding-logo-placeholder">
            {invoice.senderCompany || "Your Company"}
          </div>

          <div className="branding-name">
            <h2>{invoice.senderCompany || "Your Company"}</h2>
            <p className="branding-tagline">Professional Invoice</p>
          </div>
        </div>

        <div className="preview-title-block">
          <h1 className="invoice-title">INVOICE</h1>
        </div>
      </div>

      {/* Single source of truth for invoice number / dates / status — this used
          to be duplicated between an inline block here and InvoiceDetails */}
      <InvoiceDetails invoice={invoice} />

      <div className="preview-header">
        <div className="preview-block">
          <SenderInfo sender={invoice} />
        </div>

        <div className="preview-block">
          <ClientInfo client={invoice.client} />
        </div>
      </div>

      <div className="preview-items-wrapper">
        <ItemTable itemRows={invoice.items} />
      </div>

      {/* Totals section */}
      <div className="preview-totals space-y">
        <div className="grid-2">
          <span className="label">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="grid-2">
          <span className="label">Tax ({taxRate}%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>

        <div className="grid-2 preview-total-row">
          <span>Total Due</span>
          <span>{formatCurrency(total)}</span>
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