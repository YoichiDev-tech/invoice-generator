// React hooks for invoices
import { useState } from "react";
import type { Invoice, InvoiceItem, Client } from "../types/invoiceTypes";

const initialClient: Client = {
  name: "",
  email: "",
  company: "",
};

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