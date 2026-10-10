import { useState } from "react";
import type { Invoice, InvoiceItem, Client } from "../types/invoiceTypes";

const initialClient: Client = { id: "", user_id: "", name: "", email: "", company: "", address: "", created_at: "", updated_at: "" };

function generateItemId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "item-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return "INV-" + year + "-" + suffix;
}

function readPreferences(): { businessName?: string; senderName?: string; senderEmail?: string; currency?: string; defaultNotes?: string; defaultTaxRate?: string; businessAddress?: string } {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem("folio.invoice-preferences") || "{}") as ReturnType<typeof readPreferences>;
  } catch { return {}; }
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildInitialInvoice(): Invoice {
  const now = new Date();
  const today = formatLocalDate(now);
  const due = new Date(now);
  due.setDate(due.getDate() + 14);
  const preferences = readPreferences();
  const parsedTaxRate = Number(preferences.defaultTaxRate ?? 0);
  return {
    client: { ...initialClient },
    senderName: preferences.senderName ?? "",
    senderCompany: preferences.businessName ?? "",
    senderEmail: preferences.senderEmail ?? "",
    senderAddress: preferences.businessAddress ?? "",
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: today,
    dueDate: formatLocalDate(due),
    currency: preferences.currency ?? "EUR",
    items: [{ id: generateItemId(), description: "", quantity: 1, unitPrice: 0 }],
    notes: preferences.defaultNotes ?? "",
    status: "draft",
    taxRate: Number.isFinite(parsedTaxRate) && parsedTaxRate >= 0 && parsedTaxRate <= 100 ? parsedTaxRate : 0,
  };
}

export function useInvoiceState(initialInvoice?: Invoice) {
  const cloneInvoice = (value: Invoice): Invoice => ({ ...value, client: { ...value.client }, items: value.items.map((item) => ({ ...item })) });
  const [invoice, setInvoice] = useState<Invoice>(() => initialInvoice ? cloneInvoice(initialInvoice) : buildInitialInvoice());
  function updateInvoiceField<K extends keyof Invoice>(key: K, value: Invoice[K]) { setInvoice((prev) => ({ ...prev, [key]: value })); }
  function updateItems(items: InvoiceItem[]) { setInvoice((prev) => ({ ...prev, items })); }
  function addItem() { setInvoice((prev) => ({ ...prev, items: [...prev.items, { id: generateItemId(), description: "", quantity: 1, unitPrice: 0 }] })); }
  function removeItem(id: string) { setInvoice((prev) => ({ ...prev, items: prev.items.length > 1 ? prev.items.filter((item) => item.id !== id) : prev.items })); }
  function resetInvoice() { setInvoice(initialInvoice ? cloneInvoice(initialInvoice) : buildInitialInvoice()); }
  return { invoice, updateInvoiceField, updateItems, addItem, removeItem, resetInvoice };
}
