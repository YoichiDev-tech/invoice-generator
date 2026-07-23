// Create + Preview + layout
import CreateInvoice from "../components/invoice/CreateInvoice/CreateInvoice";
import PreviewInvoice from "../components/invoice/PreviewInvoice/PreviewInvoice";
import { useInvoiceState } from "../features/invoices/hooks/useInvoiceState";

export default function InvoicePage() {
  const {
    invoice,
    updateInvoiceField,
    updateItems,
    addItem,
    removeItem,
    resetInvoice,
  } = useInvoiceState();

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Invoice Generator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Create, preview, and export professional invoices for your agency clients.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <section className="bg-white rounded-xl border border-slate-200 shadow-lg p-8">
          <CreateInvoice
            invoice={invoice}
            updateInvoiceField={updateInvoiceField}
            updateItems={updateItems}
            addItem={addItem}
            removeItem={removeItem}
            resetInvoice={resetInvoice}
          />
        </section>

        <section className="bg-white rounded-xl border border-slate-200 shadow-lg p-8">
          <PreviewInvoice invoice={invoice} />
        </section>
      </div>
    </div>
  );
}