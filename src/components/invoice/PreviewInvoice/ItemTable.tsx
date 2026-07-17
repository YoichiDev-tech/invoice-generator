import type { InvoiceItem } from "../../../features/invoices/types/invoiceTypes";

interface ItemTableProps {
  itemRows: InvoiceItem[];
}

export default function ItemTable({ itemRows }: ItemTableProps) {
  const subtotal = itemRows.reduce(
    (sum: number, item: InvoiceItem) => sum + item.quantity * item.unitPrice, 
    0
  );

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
        Line Items
      </h4>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 px-4 py-3 text-left font-semibold text-slate-700">
              Description
            </th>
            <th className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700">
              Quantity
            </th>
            <th className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700">
              Unit Price
            </th>
            <th className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {itemRows.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="border border-slate-200 px-4 py-4 text-center text-slate-500"
              >
                No items added yet.
              </td>
            </tr>
          )}
          {itemRows.map((row: InvoiceItem, index: number) => { 
            const total = row.quantity * row.unitPrice;
            return (
              <tr key={index}>
                <td className="border border-slate-200 px-4 py-3 text-slate-800">
                  {row.description || "—"}
                </td>
                <td className="border border-slate-200 px-4 py-3 text-right text-slate-800">
                  {row.quantity}
                </td>
                <td className="border border-slate-200 px-4 py-3 text-right text-slate-800">
                  {row.unitPrice.toFixed(2)}
                </td>
                <td className="border border-slate-200 px-4 py-3 text-right text-slate-800">
                  {total.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50">
            <td
              colSpan={3}
              className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-800"
            >
              Subtotal
            </td>
            <td className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-800">
              {subtotal.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}