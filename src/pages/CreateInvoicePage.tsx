import { useState } from "react";
import { useInvoiceState } from "../features/invoices/hooks/useInvoiceState";
import CreateInvoiceForm from "../components/invoice/CreateInvoice/CreateInvoiceForm";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import { useAuth } from "../features/auth/hooks/useAuth";
import { createInvoice } from "../features/invoices/api/invoicesApi";
import { createClient } from "../features/invoices/api/invoiceApi";
import { createInvoiceItem } from "../features/invoices/api/invoiceItemsApi";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Please try again.";
}

export default function CreateInvoicePage() {
  const { invoice, updateInvoiceField, updateItems, addItem, removeItem, resetInvoice } = useInvoiceState();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function validateInvoice(): string[] {
    const problems: string[] = [];
    if (!invoice.senderName.trim()) problems.push("Your name is required.");
    if (!invoice.client.name.trim()) problems.push("Client name is required.");
    if (!invoice.client.email.trim()) problems.push("Client email is required.");
    if (!invoice.invoiceNumber.trim()) problems.push("Invoice number is required.");
    const validItems = invoice.items.filter((item) => item.description.trim().length > 0);
    if (validItems.length === 0) problems.push("Add at least one line item with a description.");
    if (invoice.items.some((item) => item.description.trim() && (!Number.isFinite(item.quantity) || item.quantity <= 0))) problems.push("Quantity must be greater than 0 for every item.");
    if (invoice.items.some((item) => item.description.trim() && (!Number.isFinite(item.unitPrice) || item.unitPrice < 0))) problems.push("Unit price cannot be negative.");
    if (!Number.isFinite(invoice.taxRate) || invoice.taxRate < 0 || invoice.taxRate > 100) problems.push("Tax rate must be between 0 and 100.");
    if (invoice.dueDate < invoice.invoiceDate) problems.push("Due date cannot be earlier than the invoice date.");
    return problems;
  }

  async function handleCreateInvoice() {
    if (!user) { setErrorMessage("Your session has expired. Please log in again."); navigate("/login"); return; }
    const problems = validateInvoice();
    if (problems.length) { setErrorMessage(problems.join(" ")); return; }
    setErrorMessage(null);
    setIsSaving(true);
    try {
      const newClient = await createClient({ user_id: user.id, name: invoice.client.name.trim(), email: invoice.client.email.trim(), company: invoice.client.company, address: invoice.client.address });
      const newInvoice = await createInvoice({ user_id: user.id, client_id: newClient.id, invoice_date: invoice.invoiceDate, due_date: invoice.dueDate, status: invoice.status, tax_rate: invoice.taxRate, notes: invoice.notes });
      const itemsToSave = invoice.items.filter((item) => item.description.trim().length > 0);
      for (const item of itemsToSave) await createInvoiceItem({ invoice_id: newInvoice.id, description: item.description.trim(), quantity: item.quantity, unit_price: item.unitPrice });
      navigate("/preview", { state: { invoice: { ...invoice, id: newInvoice.id, client: newClient, items: itemsToSave } } });
    } catch (err) {
      console.error("Error creating invoice:", err);
      setErrorMessage("Couldn't save the invoice: " + getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="create-invoice-workspace">
      <div className="create-invoice-intro"><div><p className="dashboard-eyebrow">INVOICE BUILDER</p><h2>Details that look as professional as your work.</h2><p>Enter your details, add the work delivered, then review the invoice before exporting a PDF.</p></div><span className="create-step-badge"><span>1</span> Details <i /> <span>2</span> Preview <i /> <span>3</span> Export</span></div>
      <div className="card create-invoice-card">
        <CreateInvoiceForm invoice={invoice} updateInvoiceField={updateInvoiceField} updateItems={updateItems} addItem={addItem} removeItem={removeItem} resetInvoice={resetInvoice} />
        {errorMessage && <div className="form-alert" role="alert">{errorMessage}</div>}
        <div className="create-invoice-actions"><button className="btn btn-secondary" onClick={resetInvoice} disabled={isSaving}>Reset form</button><button className="btn btn-primary" onClick={() => void handleCreateInvoice()} disabled={isSaving}>{isSaving ? "Saving invoice…" : "Save & preview invoice →"}</button></div>
      </div>
      <Footer senderEmail={invoice.senderEmail} senderCompany={invoice.senderCompany} />
    </div>
  );
}
