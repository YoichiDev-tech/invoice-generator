# Title

Invoice Generator

## Screenshot

![alt text](image.png)

## Description

A professional, client-ready invoice generator with a full Supababse backend.
Users can create clients, invoices line items, preview invoices and export them as high quality PDFs.

This project is built as a production-ready prototype with complete CRUD operations 
and secure Row Level Security (RLS) policies.

## Current version

22/07/2026 - 23:55
Release 1.4 - Stability, validation & real invoice polish

## Features

### Frontend
- Create clients
- Create invoices
- Add, edit and remove invoice items
- Automatic subtotal, tax and total calculation
- Professional invoice preview
- PDF export (html"canvas + jsPDF)
- Responsive layout (mobile + desktop)
- Clean spacing and typography

### Backend
- Clients table + CRUD
- Invoices table + CRUD
- Invoice items table + CRUD
- Full Row Level Security
- Policies ensuring users only access their own data
- Secure architecture ready for production

## Tech stack

- React Vite
- Typescript
- CSS3
- html2canvas + jsPDF
- React Router
- Supabase (Postgres + Auth + RLS)

## Bugs (on current commit)

None

## Future improvements

- Add AI assistant
- Add invoice themes
- Add multi-currency support
- Add invoice history + dashboard
- Add client database
- Add authentication
- Add PDF branding
- Add invoice status tracking

## Changelog 

### 22/07/2026 - 22:03
- Added full Supabase backend
- Added clients CRUD
- Added invoices CRUD
- Added invoices items CRUD
- Added RLS + policies 
- Completed backend integration
- Cleaned up frontend logic

### 23//07/2026 - 13.38
Fixed the bug on the UI that wasn't calling the CRUD functions, by adding:
 - CRUD functions imports into the designated file (CreateInvoicePage)
 - added a create invoice handler
 - replaced the button's onCLick with the new handler 

 ### 23/07/2026 - 23.55
Stability and real-world polish pass:
- Fixed `.env.local` — Supabase env vars weren't prefixed with `VITE_`, so the client was silently
  never connecting to the database
- Fixed a type mismatch in `useInvoiceState.ts` / `CreateInvoicePage.tsx` that broke `npm run build`
  entirely (line items were created with DB-shaped snake_case fields against a camelCase type)
- Split the DB-shaped invoice payload out into its own `InvoiceRecord` type in `invoicesApi.ts`
  (matching the existing pattern in `invoiceItemsApi.ts`), instead of misusing the UI's `Invoice` type
- Added an auto-generated invoice number, a proper `dueDate` field, and a status selector to the
  create form (previously due date silently reused the invoice date, and status was never editable)
- Added required-field validation with inline error messages before saving
- Added per-line-item delete (previously only "remove all" existed) and stable item keys
- Added loading/error state around the Supabase save flow
- Fixed `StatusBadge` to support the actual `draft/sent/paid/overdue` statuses instead of a
  hardcoded `PAID`/`UNPAID` pair that never matched real data
- Removed a duplicated invoice number/date block from the preview (it was rendered twice)
- Unified all currency display through `formatCurrency` (previously mixed manual "£" strings and
  raw unformatted numbers)
- Made PDF export paginate across multiple A4 pages for longer invoices instead of clipping them
- Replaced a hardcoded personal brand name ("Yoichi Digital") with a neutral, dynamic placeholder
- General CSS polish: disabled/loading button states, validation alert styling, per-row remove
  button, a two-column invoice header (branding vs. title), and print-friendly styles

### 24/07/2026 - 15:42
- Added auth
- Added login/signup page
- Added more styling

## Author

Yoichi dev