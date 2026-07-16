import type { Invoice, InvoiceItem } from "../../../features/invoices/types/invoiceTypes";

interface Props {
  invoice: Invoice;
  updateInvoiceField: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
  updateItems: (items: InvoiceItem[]) => void;
}

export default function CreateInvoiceForm({ invoice, updateInvoiceField, updateItems }: Props) {
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...invoice.items];
    updated[index] = { ...updated[index], [field]: value };
    updateItems(updated);
  };

  const addItem = () => {
    updateItems([...invoice.items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeAllItems = () => {
    updateItems([]);
  };

  return (
    <div className="space-y">

      {/* Sender */}
      <div className="space-y">
        <h3 className="label">Sender Information</h3>

        <div className="grid-2">
          <div className="field">
            <label className="label">Your Name</label>
            <input className="input" value={invoice.senderName}
              onChange={e => updateInvoiceField("senderName", e.target.value)} />
          </div>

          <div className="field">
            <label className="label">Company</label>
            <input className="input" value={invoice.senderCompany}
              onChange={e => updateInvoiceField("senderCompany", e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="label">Email</label>
          <input className="input" value={invoice.senderEmail}
            onChange={e => updateInvoiceField("senderEmail", e.target.value)} />
        </div>
      </div>

      {/* Client */}
      <div className="space-y">
        <h3 className="label">Client Information</h3>

        <div className="grid-2">
          <div className="field">
            <label className="label">Client Name</label>
            <input className="input" value={invoice.client.name}
              onChange={e => updateInvoiceField("client", { ...invoice.client, name: e.target.value })} />
          </div>

          <div className="field">
            <label className="label">Client Company</label>
            <input className="input" value={invoice.client.company}
              onChange={e => updateInvoiceField("client", { ...invoice.client, company: e.target.value })} />
          </div>
        </div>

        <div className="field">
          <label className="label">Client Email</label>
          <input className="input" value={invoice.client.email}
            onChange={e => updateInvoiceField("client", { ...invoice.client, email: e.target.value })} />
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="space-y">
        <h3 className="label">Invoice Details</h3>

        <div className="grid-2">
          <div className="field">
            <label className="label">Invoice Number</label>
            <input className="input" value={invoice.invoiceNumber}
              onChange={e => updateInvoiceField("invoiceNumber", e.target.value)} />
          </div>

          <div className="field">
            <label className="label">Invoice Date</label>
            <input type="date" className="input" value={invoice.invoiceDate}
              onChange={e => updateInvoiceField("invoiceDate", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y">
        <h3 className="label">Line Items</h3>

        {invoice.items.map((item, index) => (
          <div key={index} className="grid-4">

            <div className="field" style={{ gridColumn: "span 2" }}>
              <label className="label">Description</label>
              <input className="input" value={item.description}
                onChange={e => updateItem(index, "description", e.target.value)} />
            </div>

            <div className="field">
              <label className="label">Qty</label>
              <input type="number" className="input" value={item.quantity}
                onChange={e => updateItem(index, "quantity", Number(e.target.value))} />
            </div>

            <div className="field">
              <label className="label">Unit Price</label>
              <input type="number" className="input" value={item.unitPrice}
                onChange={e => updateItem(index, "unitPrice", Number(e.target.value))} />
            </div>
          </div>
        ))}

        <div className="grid-2">
          <button className="btn btn-primary" onClick={addItem}>
            + Add Item
          </button>

          <button className="btn btn-secondary" onClick={removeAllItems}>
            Remove All Items
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="field">
        <label className="label">Notes / Payment Terms</label>
        <textarea className="input" style={{ height: "120px" }}
          value={invoice.notes}
          onChange={e => updateInvoiceField("notes", e.target.value)} />
      </div>

    </div>
  );
}