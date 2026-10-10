import type { InvoiceItem } from "../../../features/invoices/types/invoiceTypes";
import { formatCurrency } from "../../../features/invoices/utils/formatCurrency";

interface ItemTableProps { itemRows: InvoiceItem[]; currency?: string; }

export default function ItemTable({ itemRows, currency = "EUR" }: ItemTableProps) {
  return <div className="items-block">
    <h4 className="section-label">Line Items</h4>
    <table className="invoice-table"><colgroup><col className="col-desc" /><col className="col-qty" /><col className="col-price" /><col className="col-total" /></colgroup>
      <thead><tr><th className="col-left">Description</th><th className="col-num">Quantity</th><th className="col-num">Unit Price</th><th className="col-num">Total</th></tr></thead>
      <tbody>
        {itemRows.length === 0 && <tr><td colSpan={4} className="empty-row">No items added yet.</td></tr>}
        {itemRows.map((row, index) => <tr key={row.id || index}><td className="col-left">{row.description || "—"}</td><td className="col-num">{row.quantity}</td><td className="col-num">{formatCurrency(row.unitPrice, currency)}</td><td className="col-num">{formatCurrency(row.quantity * row.unitPrice, currency)}</td></tr>)}
      </tbody>
    </table>
  </div>;
}
