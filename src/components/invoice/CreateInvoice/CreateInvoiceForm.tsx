import type { Invoice, InvoiceItem, InvoiceStatus } from "../../../features/invoices/types/invoiceTypes";

interface Props {
  invoice: Invoice;
  updateInvoiceField: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
  updateItems: (items: InvoiceItem[]) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  resetInvoice: () => void;
}
const STATUS_OPTIONS: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
const CURRENCY_OPTIONS = [{ value: "EUR", label: "EUR — Euro" }, { value: "GBP", label: "GBP — Pound sterling" }, { value: "USD", label: "USD — US dollar" }, { value: "PLN", label: "PLN — Polish złoty" }, { value: "CHF", label: "CHF — Swiss franc" }];

export default function CreateInvoiceForm({ invoice, updateInvoiceField, updateItems, addItem, removeItem }: Props) {
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...invoice.items];
    updated[index] = { ...updated[index], [field]: value };
    updateItems(updated);
  };
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const money = (amount: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: invoice.currency }).format(amount);

  return <div className="space-y">
    <div className="space-y-compact form-section">
      <h3 className="label">Your business details</h3>
      <div className="grid-2 fields-compact">
        <div className="field"><label className="label" htmlFor="sender-name">Your name *</label><input id="sender-name" className="input input-compact" value={invoice.senderName} placeholder="Jane Smith" onChange={(e) => updateInvoiceField("senderName", e.target.value)} required /></div>
        <div className="field"><label className="label" htmlFor="sender-company">Business name</label><input id="sender-company" className="input input-compact" value={invoice.senderCompany} placeholder="Your Studio" onChange={(e) => updateInvoiceField("senderCompany", e.target.value)} /></div>
      </div>
      <div className="grid-2 fields-compact">
        <div className="field"><label className="label" htmlFor="sender-email">Business email *</label><input id="sender-email" type="email" className="input input-compact" value={invoice.senderEmail} placeholder="you@company.com" onChange={(e) => updateInvoiceField("senderEmail", e.target.value)} required /></div>
        <div className="field"><label className="label" htmlFor="sender-address">Business address</label><input id="sender-address" className="input input-compact" value={invoice.senderAddress} placeholder="Street, city, postcode" onChange={(e) => updateInvoiceField("senderAddress", e.target.value)} /></div>
      </div>
    </div>
    <div className="section-divider" role="separator" />
    <div className="space-y-compact form-section">
      <h3 className="label">Client details</h3>
      <div className="grid-2 fields-compact">
        <div className="field"><label className="label" htmlFor="client-name">Client name *</label><input id="client-name" className="input input-compact" value={invoice.client.name} placeholder="Client full name" onChange={(e) => updateInvoiceField("client", { ...invoice.client, name: e.target.value })} required /></div>
        <div className="field"><label className="label" htmlFor="client-company">Client company</label><input id="client-company" className="input input-compact" value={invoice.client.company ?? ""} placeholder="Client company" onChange={(e) => updateInvoiceField("client", { ...invoice.client, company: e.target.value })} /></div>
      </div>
      <div className="grid-2 fields-compact">
        <div className="field"><label className="label" htmlFor="client-email">Client email *</label><input id="client-email" type="email" className="input input-compact" value={invoice.client.email} placeholder="client@email.com" onChange={(e) => updateInvoiceField("client", { ...invoice.client, email: e.target.value })} required /></div>
        <div className="field"><label className="label" htmlFor="client-address">Billing address</label><input id="client-address" className="input input-compact" value={invoice.client.address} placeholder="Street, city, postcode" onChange={(e) => updateInvoiceField("client", { ...invoice.client, address: e.target.value })} /></div>
      </div>
    </div>
    <div className="section-divider" role="separator" />
    <div className="space-y">
      <h3 className="label">Invoice details</h3>
      <div className="grid-3">
        <div className="field"><label className="label" htmlFor="invoice-number">Invoice number *</label><input id="invoice-number" className="input" value={invoice.invoiceNumber} onChange={(e) => updateInvoiceField("invoiceNumber", e.target.value)} required /></div>
        <div className="field"><label className="label" htmlFor="invoice-date">Issue date</label><input id="invoice-date" type="date" className="input" value={invoice.invoiceDate} onChange={(e) => updateInvoiceField("invoiceDate", e.target.value)} required /></div>
        <div className="field"><label className="label" htmlFor="due-date">Due date</label><input id="due-date" type="date" className="input" value={invoice.dueDate} min={invoice.invoiceDate} onChange={(e) => updateInvoiceField("dueDate", e.target.value)} required /></div>
      </div>
      <div className="grid-3">
        <div className="field"><label className="label" htmlFor="invoice-status">Status</label><select id="invoice-status" className="input" value={invoice.status} onChange={(e) => updateInvoiceField("status", e.target.value as InvoiceStatus)}>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select></div>
        <div className="field"><label className="label" htmlFor="invoice-currency">Currency</label><select id="invoice-currency" className="input" value={invoice.currency} onChange={(e) => updateInvoiceField("currency", e.target.value)}>{CURRENCY_OPTIONS.map((currency) => <option key={currency.value} value={currency.value}>{currency.label}</option>)}</select></div>
        <div className="field"><label className="label" htmlFor="invoice-tax">Tax rate (%)</label><input id="invoice-tax" type="number" min={0} max={100} step="0.01" className="input" value={invoice.taxRate} onChange={(e) => updateInvoiceField("taxRate", Number(e.target.value))} /></div>
      </div>
    </div>
    <div className="space-y">
      <div className="items-header"><h3 className="label">Line items</h3><span className="items-subtotal-hint">Subtotal: {money(subtotal)}</span></div>
      {invoice.items.map((item, index) => <div key={item.id} className="line-item-row">
        <div className="field" style={{ gridColumn: "span 2" }}><label className="label" htmlFor={"item-description-" + item.id}>Description</label><input id={"item-description-" + item.id} className="input" value={item.description} placeholder="Website design & development" onChange={(e) => updateItem(index, "description", e.target.value)} /></div>
        <div className="field"><label className="label" htmlFor={"item-quantity-" + item.id}>Quantity</label><input id={"item-quantity-" + item.id} type="number" min={0.01} step="0.01" className="input" value={item.quantity} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} /></div>
        <div className="field"><label className="label" htmlFor={"item-price-" + item.id}>Unit price</label><input id={"item-price-" + item.id} type="number" min={0} step="0.01" className="input" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))} /></div>
        <button type="button" className="btn-remove-row" onClick={() => removeItem(item.id)} disabled={invoice.items.length === 1} aria-label="Remove line item" title={invoice.items.length === 1 ? "At least one item is required" : "Remove item"}>×</button>
      </div>)}
      <div className="grid-2"><button type="button" className="btn btn-primary" onClick={addItem}>＋ Add line item</button><button type="button" className="btn btn-secondary" onClick={() => updateItems(invoice.items.slice(0,1).map((item) => ({ ...item, description: "", quantity: 1, unitPrice: 0 })))}>Clear items</button></div>
    </div>
    <div className="field"><label className="label" htmlFor="invoice-notes">Notes / payment terms</label><textarea id="invoice-notes" className="input" style={{ minHeight: "110px", resize: "vertical" }} value={invoice.notes ?? ""} placeholder="Payment due within 14 days via bank transfer." onChange={(e) => updateInvoiceField("notes", e.target.value)} /></div>
  </div>;
}
