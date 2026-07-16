interface InvoiceDetailsProps {
  invoiceNumber: string;
  invoiceDate: string;
}

export default function InvoiceDetails({
  invoiceNumber,
  invoiceDate,
}: InvoiceDetailsProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Invoice Details
      </h4>
      <div className="space-y-1 text-sm text-slate-800">
        <div className="flex gap-2">
          <span className="font-medium w-32">Invoice Number</span>
          <span>{invoiceNumber || "—"}</span>
        </div>
        <div className="flex gap-2">
          <span className="font-medium w-32">Invoice Date</span>
          <span>{invoiceDate || "—"}</span>
        </div>
      </div>
    </div>
  );
}