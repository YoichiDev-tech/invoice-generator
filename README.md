# Folio — Invoice Generator

A personal invoicing workspace for freelance and small-studio work. The app supports client records, invoice creation, line items, tax calculations, saved invoice history, status tracking, and PDF export.

## Stack

- React, TypeScript, Vite, React Router
- Supabase Auth and Postgres
- html2canvas + jsPDF for client-side PDF export

## Local setup

1. Install dependencies with `npm ci`.
2. Create `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Review and apply migrations in `supabase/migrations/` to the intended Supabase project.
4. Configure Supabase Auth redirect URLs for local development and the production origin.
5. Run `npm run dev`.
6. Run `npm run lint` and `npm run build`.

## Production requirements

- The database migration persists invoice number, sender details, currency, totals, and invoice line items.
- The `create_invoice_with_items` RPC saves invoice data and line items in one database transaction.
- The migration replaces row-level policies on clients, invoices, and invoice items with owner-scoped policies. Review the policy changes against your live project before applying them.
- Dashboard totals are grouped by currency to avoid adding euros, pounds, dollars, and złoty together.
- Settings currently save defaults in the current browser only; cloud sync and company tax identifiers are not implemented.
- PDF export and visual behavior still require browser testing on desktop and mobile, including long invoices and page breaks.
- Do not treat the app as production-ready until the migrations have been applied, RLS has been tested with separate accounts, and real invoice creation/reopen/export has been verified against Supabase.

## Acceptance checklist

- [ ] Signup, email confirmation, login, logout, and protected routes
- [ ] Account A cannot read or mutate Account B's clients, invoices, or invoice items
- [ ] Duplicate client email reuses the existing client record
- [ ] Invoice number, sender/client details, currency, tax, notes, and all line items persist
- [ ] Saved invoices can be reopened and exported after a page refresh
- [ ] Status updates and deletion behave correctly with linked line items
- [ ] PDF pagination, currency formatting, and mobile layout are reviewed manually
- [ ] Production Vercel environment variables and deployment are verified
