import { useState } from "react";
import type { Invoice, InvoiceItem, Client } from "../types/invoiceTypes";

const initialClient: Client = {
  id: "",
  user_id: "",
  name: "",
  email: "",
  company: "",
  address: "",
  created_at: "",
  updated_at: "",
};

const initialInvoice: Invoice = {
  client: initialClient,
  senderName: "",
  senderCompany: "",
  senderEmail: "",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  items: [
    {
      id: "",
      invoice_id: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      created_at: "",
      updated_at: "",
    },
  ],
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