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

export default function CreateInvoiceForm({
  invoice,
  updateInvoiceField,
  updateItems,
  addItem,
  removeItem,
}: Props) {
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...invoice.items];
    updated[index] = { ...updated[index], [field]: value };
    updateItems(updated);
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="space-y">
      {/* Sender */}
      <div className="space-y-compact form-section">
        <h3 className="label">Sender Information</h3>

        <div className="grid-2 fields-compact">
          <div className="field">
            <label className="label">Your Name</label>
            <input
              className="input input-compact"
              value={invoice.senderName}
              placeholder="Jane Smith"
              onChange={e => updateInvoiceField("senderName", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Company</label>
            <input
              className="input input-compact"
              value={invoice.senderCompany}
              placeholder="Your Company Ltd."
              onChange={e => updateInvoiceField("senderCompany", e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Email</label>
          <input
            type="email"
            className="input input-compact"
            value={invoice.senderEmail}
            placeholder="you@company.com"
            onChange={e => updateInvoiceField("senderEmail", e.target.value)}
          />
        </div>
      </div>

      {/* Divider between sender and client sections */}
      <div className="section-divider" role="separator" />

      {/* Client */}
      <div className="space-y-compact form-section">
        <h3 className="label">Client Information</h3>

        <div className="grid-2 fields-compact">
          <div className="field">
            <label className="label">Client Name</label>
            <input
              className="input input-compact"
              value={invoice.client.name}
              placeholder="Client full name"
              onChange={e => updateInvoiceField("client", { ...invoice.client, name: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="label">Client Company</label>
            <input
              className="input input-compact"
              value={invoice.client.company}
              placeholder="Client Company Ltd."
              onChange={e => updateInvoiceField("client", { ...invoice.client, company: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-2 fields-compact">
          <div className="field">
            <label className="label">Client Email</label>
            <input
              type="email"
              className="input input-compact"
              value={invoice.client.email}
              placeholder="client@email.com"
              onChange={e => updateInvoiceField("client", { ...invoice.client, email: e.target.value })}
            />
          </div>

          <div className="field">
            <label className="label">Client Address</label>
            <input
              className="input input-compact"
              value={invoice.client.address}
              placeholder="Street, City, Postcode"
              onChange={e => updateInvoiceField("client", { ...invoice.client, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Divider before invoice details */}
      <div className="section-divider" role="separator" />

      {/* Invoice Meta */}
      <div className="space-y">
        <h3 className="label">Invoice Details</h3>

        <div className="grid-3">
          <div className="field">
            <label className="label">Invoice Number</label>
            <input
              className="input"
              value={invoice.invoiceNumber}
              onChange={e => updateInvoiceField("invoiceNumber", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Invoice Date</label>
            <input
              type="date"
              className="input"
              value={invoice.invoiceDate}
              onChange={e => updateInvoiceField("invoiceDate", e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={invoice.dueDate}
              min={invoice.invoiceDate}
              onChange={e => updateInvoiceField("dueDate", e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label className="label">Status</label>
            <select
              className="input"
              value={invoice.status}
              onChange={e => updateInvoiceField("status", e.target.value as InvoiceStatus)}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">Tax Rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className="input"
              value={invoice.taxRate}
              onChange={e => updateInvoiceField("taxRate", Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y">
        <div className="items-header">
          <h3 className="label">Line Items</h3>
          <span className="items-subtotal-hint">Running subtotal: {subtotal.toFixed(2)}</span>
        </div>

        {invoice.items.map((item, index) => (
          <div key={item.id} className="line-item-row">
            <div className="field" style={{ gridColumn: "span 2" }}>
              <label className="label">Description</label>
              <input
                className="input"
                value={item.description}
                placeholder="Website design & development"
                onChange={e => updateItem(index, "description", e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label">Qty</label>
              <input
                type="number"
                min={0}
                className="input"
                value={item.quantity}
                onChange={e => updateItem(index, "quantity", Number(e.target.value))}
              />
            </div>

            <div className="field">
              <label className="label">Unit Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input"
                value={item.unitPrice}
                onChange={e => updateItem(index, "unitPrice", Number(e.target.value))}
              />
            </div>

            <button
              type="button"
              className="btn-remove-row"
              onClick={() => removeItem(item.id)}
              disabled={invoice.items.length === 1}
              aria-label="Remove line item"
              title={invoice.items.length === 1 ? "At least one item is required" : "Remove item"}
            >
              ×
            </button>
          </div>
        ))}

        <div className="grid-2">
          <button className="btn btn-primary" onClick={addItem}>
            + Add Item
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => updateItems(invoice.items.slice(0, 1).map(item => ({ ...item, description: "", quantity: 1, unitPrice: 0 })))}
          >
            Clear Items
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="field">
        <label className="label">Notes / Payment Terms</label>
        <textarea
          className="input"
          style={{ height: "120px" }}
          value={invoice.notes}
          placeholder="Payment due within 14 days via bank transfer."
          onChange={e => updateInvoiceField("notes", e.target.value)}
        />
      </div>
    </div>
  );
}