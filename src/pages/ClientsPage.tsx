import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";
import { createClient, deleteClient, getClients, updateClient } from "../features/invoices/api/invoiceApi";
import type { Client } from "../features/invoices/types/invoiceTypes";

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setClients((await getClients()) as Client[]); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load clients."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [load]);

  function startEdit(client: Client) {
    setEditingId(client.id); setName(client.name); setEmail(client.email); setCompany(client.company ?? ""); setAddress(client.address ?? ""); setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() { setEditingId(null); setName(""); setEmail(""); setCompany(""); setAddress(""); setError(""); }

  async function addClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) { setError("Your session has expired. Please sign in again."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      if (editingId) {
        await updateClient(editingId, { name: name.trim(), email: email.trim().toLowerCase(), company: company.trim() || "", address: address.trim() });
        setNotice("Client details updated.");
      } else {
        await createClient({ user_id: user.id, name: name.trim(), email: email.trim(), company: company.trim(), address: address.trim() });
        setNotice("Client saved successfully.");
      }
      setEditingId(null); setName(""); setEmail(""); setCompany(""); setAddress("");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save this client."); }
    finally { setSaving(false); }
  }

  async function removeClient(client: Client) {
    if (!window.confirm("Delete " + client.name + "? This may be blocked if invoices still reference this client.")) return;
    setError(""); setNotice("");
    try { await deleteClient(client.id); setNotice("Client deleted."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete this client."); }
  }

  return <div className="clients-layout">
    <section className="workspace-card"><div className="workspace-card-heading"><div><h2>{editingId ? "Edit client" : "Add a client"}</h2><p>Save client details so they are ready when you bill your next project.</p></div><span className="settings-section-icon">＋</span></div>
      <form className="settings-grid" onSubmit={(event) => void addClient(event)}>
        <div className="settings-field"><label htmlFor="client-name">Client name *</label><input id="client-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required placeholder="Full name" /></div>
        <div className="settings-field"><label htmlFor="client-email">Email address *</label><input id="client-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="client@company.com" /></div>
        <div className="settings-field"><label htmlFor="client-company">Company</label><input id="client-company" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" /></div>
        <div className="settings-field"><label htmlFor="client-address">Billing address</label><input id="client-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street, city, postcode" /></div>
        <div className="settings-field-full client-form-submit"><button className="dashboard-primary-action" disabled={saving}>{saving ? "Saving client…" : editingId ? "Save changes" : "Save client"}</button>{editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>Cancel</button>}</div>
      </form>
    </section>
    {error && <div className="workspace-alert" role="alert">{error}</div>}
    {notice && <p className="clients-notice" role="status">{notice}</p>}
    <section className="workspace-card"><div className="workspace-card-heading"><div><h2>Your clients</h2><p>Contact records in your workspace.</p></div><span className="clients-count">{clients.length} total</span></div>
      {loading ? <div className="workspace-empty">Loading clients…</div> : clients.length === 0 ? <div className="workspace-empty"><div className="workspace-empty-icon">♙</div><h3>Your client list starts here</h3><p>Add a client above, or save one while creating your first invoice.</p></div> : <div className="clients-list">{clients.map((client) => <article key={client.id} className="client-row"><div className="client-avatar">{client.name.trim().charAt(0).toUpperCase()}</div><div className="client-info"><strong>{client.name}</strong><span>{client.company || "Independent client"}</span><a href={"mailto:" + client.email}>{client.email}</a>{client.address && <small>{client.address}</small>}</div><div className="client-row-actions"><button className="invoice-preview-action" onClick={() => startEdit(client)}>Edit</button><button className="invoice-delete-action" onClick={() => void removeClient(client)}>Delete</button></div></article>)}</div>}
    </section>
  </div>;
}
