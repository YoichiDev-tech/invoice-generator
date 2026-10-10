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
  senderAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  notes?: string;
  status: InvoiceStatus;
  taxRate: number;
}
