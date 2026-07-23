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

// Generates a simple unique id for client-side line items (React keys, per-row edits)
// Falls back gracefully if crypto.randomUUID isn't available in the runtime
function generateItemId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// A friendly default invoice number so the field is never blank on load,
// while still being fully editable by the user
function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${randomSuffix}`;
}

function buildInitialInvoice(): Invoice {
  const today = new Date().toISOString().slice(0, 10);
  return {
    client: initialClient,
    senderName: "",
    senderCompany: "",
    senderEmail: "",
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: today,
    dueDate: today,
    items: [
      {
        id: generateItemId(),
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
    notes: "",
    status: "draft",
    taxRate: 0,
  };
}

export function useInvoiceState() {
  const [invoice, setInvoice] = useState<Invoice>(buildInitialInvoice);

  function updateInvoiceField<K extends keyof Invoice>(key: K, value: Invoice[K]) {
    setInvoice(prev => ({ ...prev, [key]: value }));
  }

  function updateItems(items: InvoiceItem[]) {
    setInvoice(prev => ({ ...prev, items }));
  }

  function addItem() {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: generateItemId(), description: "", quantity: 1, unitPrice: 0 }],
    }));
  }

  function removeItem(id: string) {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter(item => item.id !== id) : prev.items,
    }));
  }

  function resetInvoice() {
    setInvoice(buildInitialInvoice());
  }

  return {
    invoice,
    updateInvoiceField,
    updateItems,
    addItem,
    removeItem,
    resetInvoice,
  };
}