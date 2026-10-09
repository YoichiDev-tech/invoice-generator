import { useState } from "react";

interface InvoicePreferences { businessName: string; senderName: string; senderEmail: string; businessAddress: string; currency: string; defaultNotes: string; defaultTaxRate: string; }

const initialPreferences: InvoicePreferences = { businessName: "", senderName: "", senderEmail: "", businessAddress: "", currency: "EUR", defaultNotes: "Thank you for your business. Payment is due within 14 days.", defaultTaxRate: "0" };

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<InvoicePreferences>(() => {
    if (typeof window === "undefined") return initialPreferences;
    try {
      const stored = window.localStorage.getItem("folio.invoice-preferences");
      return stored ? { ...initialPreferences, ...(JSON.parse(stored) as Partial<InvoicePreferences>) } : initialPreferences;
    } catch (error) {
      console.warn("Invoice preferences could not be restored.", error);
      return initialPreferences;
    }
  });
  const [saved, setSaved] = useState(false);

  function update<K extends keyof InvoicePreferences>(key: K, value: InvoicePreferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function savePreferences() {
    try {
      window.localStorage.setItem("folio.invoice-preferences", JSON.stringify(preferences));
      setSaved(true);
    } catch (error) {
      console.error("Invoice preferences could not be saved.", error);
      setSaved(false);
    }
  }

  return (
    <div className="settings-layout">
      <section className="workspace-card settings-card">
        <div className="workspace-card-heading"><div><h2>Business profile</h2><p>These details help keep new invoices consistent.</p></div><span className="settings-section-icon">⌂</span></div>
        <div className="settings-grid">
          <div className="settings-field"><label htmlFor="business-name">Business or trading name</label><input id="business-name" value={preferences.businessName} onChange={(event) => update("businessName", event.target.value)} placeholder="e.g. Cole Digital Studio" /></div>
          <div className="settings-field"><label htmlFor="sender-name">Your full name</label><input id="sender-name" value={preferences.senderName} onChange={(event) => update("senderName", event.target.value)} placeholder="Name shown on invoices" /></div>
          <div className="settings-field"><label htmlFor="sender-email">Business email</label><input id="sender-email" type="email" value={preferences.senderEmail} onChange={(event) => update("senderEmail", event.target.value)} placeholder="you@yourbusiness.com" /></div>
          <div className="settings-field settings-field-full"><label htmlFor="business-address">Business address</label><input id="business-address" autoComplete="street-address" value={preferences.businessAddress} onChange={(event) => update("businessAddress", event.target.value)} placeholder="Street, city, postcode, country" /></div>
          <div className="settings-field"><label htmlFor="currency">Default currency</label><select id="currency" value={preferences.currency} onChange={(event) => update("currency", event.target.value)}><option value="EUR">EUR — Euro</option><option value="GBP">GBP — Pound sterling</option><option value="USD">USD — US dollar</option><option value="PLN">PLN — Polish złoty</option><option value="CHF">CHF — Swiss franc</option></select></div>
        </div>
      </section>
      <section className="workspace-card settings-card">
        <div className="workspace-card-heading"><div><h2>Invoice defaults</h2><p>Set sensible starting values; review every invoice before sending.</p></div><span className="settings-section-icon">▤</span></div>
        <div className="settings-grid">
          <div className="settings-field"><label htmlFor="tax-rate">Default tax rate (%)</label><input id="tax-rate" type="number" min="0" max="100" step="0.01" value={preferences.defaultTaxRate} onChange={(event) => update("defaultTaxRate", event.target.value)} /></div>
          <div className="settings-field settings-field-full"><label htmlFor="default-notes">Default notes / payment terms</label><textarea id="default-notes" rows={4} value={preferences.defaultNotes} onChange={(event) => update("defaultNotes", event.target.value)} placeholder="Payment terms, bank transfer details, or a thank-you note." /></div>
        </div>
        <div className="settings-save-row"><p role="status" className={saved ? "settings-saved" : "settings-save-hint"}>{saved ? "Preferences saved on this device." : "Preferences are stored locally in this browser."}</p><button type="button" className="dashboard-primary-action" onClick={savePreferences}>Save preferences</button></div>
      </section>
      <div className="workspace-note"><strong>Privacy note</strong><span>These preferences are currently stored in this browser only. They are not synced across devices or included automatically on new invoices yet.</span></div>
    </div>
  );
}
