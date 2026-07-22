// React hooks for invoices
import { useState } from "react";
import type { Invoice, InvoiceItem, Client } from "../types/invoiceTypes";

const [client, setClient] = useState<Client>({
  id: "",
  user_id: "",
  name: "",
  email: "",
  company: "",
  address: "",
  created_at: "",
  updated_at: "",
});

const initialInvoice: Invoice = {
  client: initialClient,
  senderName: "",
  senderCompany: "",
  senderEmail: "",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  items: [{ description: "", quantity: 1, unitPrice: 0 }],
  notes: "",
  status: "draft",
  taxRate: 0,
};

export function useInvoiceState() {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

  function updateInvoiceField<K extends keyof Invoice>(key: K, value: Invoice[K]) {
    setInvoice(prev => ({ ...prev, [key]: value }));
  }

  function updateItems(items: InvoiceItem[]) {
    setInvoice(prev => ({ ...prev, items }));
  }

  function resetInvoice() {
    setInvoice(initialInvoice);
  }

  return {
    invoice,
    updateInvoiceField,
    updateItems,
    resetInvoice,
  };
}