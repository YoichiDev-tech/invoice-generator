import { useState } from "react";
import { useInvoiceState } from "../features/invoices/hooks/useInvoiceState";
import CreateInvoiceForm from "../components/invoice/CreateInvoice/CreateInvoiceForm";
import { useNavigate } from "react-router-dom";
import Footer from "../components/common/Footer";
import Logo from "../components/common/Logo";
import { useAuth } from "../features/auth/hooks/useAuth";
import { signOut } from "../features/auth/api/AuthApi";

// CRUD Functions import
import { createInvoice } from "../features/invoices/api/invoicesApi";
import { createClient } from "../features/invoices/api/invoiceApi";
import { createInvoiceItem } from "../features/invoices/api/invoiceItemsApi";

// This reads the message 
// field directly off whatever shape the error takes
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return "Please try again.";
}

export default function CreateInvoicePage() {
  const { invoice, updateInvoiceField, updateItems, addItem, removeItem, resetInvoice } =
    useInvoiceState();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Basic required-field validation. Returns a list of human-readable
  // problems so the user knows exactly what to fix before hitting Supabase
  function validateInvoice(): string[] {
    const problems: string[] = [];

    if (!invoice.senderName.trim()) problems.push("Your name is required.");
    if (!invoice.client.name.trim()) problems.push("Client name is required.");
    if (!invoice.client.email.trim()) problems.push("Client email is required.");
    if (!invoice.invoiceNumber.trim()) problems.push("Invoice number is required.");

    const validItems = invoice.items.filter(item => item.description.trim().length > 0);
    if (validItems.length === 0) problems.push("Add at least one line item with a description.");

    const hasInvalidQuantity = invoice.items.some(item => item.description.trim() && item.quantity <= 0);
    if (hasInvalidQuantity) problems.push("Quantity must be greater than 0 for every item.");

    const hasNegativePrice = invoice.items.some(item => item.description.trim() && item.unitPrice < 0);
    if (hasNegativePrice) problems.push("Unit price cannot be negative.");

    return problems;
  }

  async function handleCreateInvoice() {
    // ProtectedRoute guarantees a session exists to get here, but guard
    // anyway in case the session expired mid-edit
    if (!user) {
      setErrorMessage("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    const problems = validateInvoice();
    if (problems.length > 0) {
      setErrorMessage(problems.join(" "));
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      // Auto-create (or reuse) the client record, attributed to the
      // logged-in user so it satisfies the "user_id = auth.uid()" RLS policy
      const newClient = await createClient({
        user_id: user.id,
        name: invoice.client.name,
        email: invoice.client.email,
        company: invoice.client.company,
        address: invoice.client.address,
      });

      // Create/save invoice to supabase using the DB-shaped record (snake_case)
      const newInvoice = await createInvoice({
        user_id: user.id,
        client_id: newClient.id,
        invoice_date: invoice.invoiceDate,
        due_date: invoice.dueDate,
        status: invoice.status,
        tax_rate: invoice.taxRate,
        notes: invoice.notes,
      });

      // Create/save each non-empty line item
      const itemsToSave = invoice.items.filter(item => item.description.trim().length > 0);
      for (const item of itemsToSave) {
        await createInvoiceItem({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        });
      }

      // Navigate to preview with the full invoice (DB record + client + items)
      // so the preview page has everything it needs without another trip
      navigate("/preview", {
        state: {
          invoice: {
            ...invoice,
            id: newInvoice.id,
            invoiceNumber: invoice.invoiceNumber,
            client: newClient,
            items: itemsToSave,
          },
        },
      });
    } catch (err) {
      console.error("Error creating invoice:", err);
      setErrorMessage(`Couldn't save the invoice: ${getErrorMessage(err)}`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="page space-y">
      <div className="page-top-bar">
        <Logo size={70} companyName={invoice.senderCompany || undefined} />
        <button className="auth-toggle" onClick={handleSignOut}>
          Sign out{user?.email ? ` (${user.email})` : ""}
        </button>
      </div>

      <h1 className="section-title">Create Invoice</h1>

      <div className="card space-y">
        <CreateInvoiceForm
          invoice={invoice}
          updateInvoiceField={updateInvoiceField}
          updateItems={updateItems}
          addItem={addItem}
          removeItem={removeItem}
          resetInvoice={resetInvoice}
        />

        {errorMessage && (
          <div className="form-alert" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="grid-2">
          <button className="btn btn-secondary" onClick={resetInvoice} disabled={isSaving}>
            Reset
          </button>

          <button className="btn btn-primary" onClick={handleCreateInvoice} disabled={isSaving}>
            {isSaving ? "Saving…" : "Preview Invoice"}
          </button>
        </div>
      </div>

      <Footer senderEmail={invoice.senderEmail} senderCompany={invoice.senderCompany} />
    </div>
  );
}