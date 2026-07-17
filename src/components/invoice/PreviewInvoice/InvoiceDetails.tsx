import type { Invoice } from "../../../features/invoices/types/invoiceTypes";

interface InvoiceDetailsProps {
  invoice: Invoice; 
}

export default function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Invoice Details
      </h4>
      <div className="space-y-1 text-sm text-slate-800">
        <div className="flex gap-2">
          <span className="font-medium w-32">Invoice Number</span>
          <span>{invoice.invoiceNumber || "—"}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium w-32">Invoice Date</span>
          <span>{invoice.invoiceDate || "—"}</span>
        </div>
      </div>
    </div>
  );
}