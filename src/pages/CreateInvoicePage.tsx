import { useInvoiceState } from "../features/invoices/hooks/useInvoiceState";
import CreateInvoiceForm from "../components/invoice/CreateInvoice/CreateInvoiceForm";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";

export default function CreateInvoicePage() {
  const { invoice, updateInvoiceField, updateItems, resetInvoice } = useInvoiceState();
  const navigate = useNavigate();

  return (
    <div className="page space-y">

      <Logo size={70} />

      <h1 className="section-title">Create Invoice</h1>

      <div className="card space-y">
        <CreateInvoiceForm
          invoice={invoice}
          updateInvoiceField={updateInvoiceField}
          updateItems={updateItems}
        />

        <div className="grid-2">
          <button className="btn btn-secondary" onClick={resetInvoice}>
            Reset
          </button>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/preview", { state: { invoice } })}
          >
            Preview Invoice
          </button>
        </div>
      </div>

      <Footer
        senderEmail={invoice.senderEmail}
        senderCompany={invoice.senderCompany}
      />
    </div>
  );
}