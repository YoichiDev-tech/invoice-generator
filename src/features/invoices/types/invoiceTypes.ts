// Invoice + client TS types

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company?: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  // Client-side only identifier used for React keys and per-row edits/removals
  // Not persisted directly — the Supabase layer uses its own DB-shaped item type
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id?: string;
  client: Client;
  senderName: string;
  senderCompany: string;
  senderEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  // Due date is distinct from the issue date — every real invoice needs both
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  status: InvoiceStatus;
  taxRate: number;
}