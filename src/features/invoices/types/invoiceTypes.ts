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
  items: InvoiceItem[];
  notes?: string;
  status: InvoiceStatus;
  taxRate: number;
}