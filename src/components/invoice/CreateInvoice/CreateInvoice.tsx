import type { Invoice, InvoiceItem } from "../../../features/invoices/types/invoiceTypes";
import CreateInvoiceForm from "./CreateInvoiceForm";

interface CreateInvoiceProps {
  invoice: Invoice;
  updateInvoiceField: <K extends keyof Invoice>(key: K, value: Invoice[K]) => void;
  updateItems: (items: InvoiceItem[]) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  resetInvoice: () => void;
}

export default function CreateInvoice({
  invoice,
  updateInvoiceField,
  updateItems,
  addItem,
  removeItem,
  resetInvoice,
}: CreateInvoiceProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Create Invoice
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Fill out the details below to generate a professional invoice.
        </p>
      </div>

      <CreateInvoiceForm
        invoice={invoice}
        updateInvoiceField={updateInvoiceField}
        updateItems={updateItems}
        addItem={addItem}
        removeItem={removeItem}
        resetInvoice={resetInvoice}
      />
    </div>
  );
}