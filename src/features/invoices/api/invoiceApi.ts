import { supabaseClient } from "../../../lib/supabaseClient";
import type { Client } from "../types/invoiceTypes";

type ClientInput = Omit<Client, "id" | "created_at" | "updated_at">;

export async function createClient(client: ClientInput) {
  const email = client.email.trim().toLowerCase();
  const { data: existing, error: lookupError } = await supabaseClient.from("clients").select("*").eq("user_id", client.user_id).ilike("email", email).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { data, error } = await supabaseClient.from("clients").update({ name: client.name.trim(), email, company: client.company?.trim() || null, address: client.address?.trim() || "" }).eq("id", existing.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabaseClient.from("clients").insert({ ...client, name: client.name.trim(), email, company: client.company?.trim() || null, address: client.address?.trim() || "" }).select().single();
  if (error) throw error;
  return data;
}

export async function getClients() {
  const { data, error } = await supabaseClient.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<Client>) {
  const { data, error } = await supabaseClient.from("clients").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabaseClient.from("clients").delete().eq("id", id);
  if (error) throw error;
}
