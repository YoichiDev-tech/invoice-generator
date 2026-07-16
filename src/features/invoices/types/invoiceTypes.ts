// Invoice + client TS types

export interface Client {
  id?: string;
  name: string;
  email: string;
  company?: string;
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
}