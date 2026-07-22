import { supabaseClient } from "../../../lib/supabaseClient";
import type {Client} from "../types/invoiceTypes";

// Create client
export async function createClient(client: Omit<Client, "id" | "created_at" | "updated_at">) {
    const {data, error} = await supabaseClient
    .from("clients")
    .insert(client)
    .select()
    .single();

    if(error) throw error;
    return data;
}

// Get all clients
export async function getClients() {
    const {data, error} = await supabaseClient
    .from("clients")
    .select("*")
    .order("created_at", {ascending: false});

    if(error) throw error;
    return data;
}

// Update client
export async function updateClient(id: string, updates: Partial<Client>) {
  const { data, error } = await supabaseClient
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete client
export async function deleteClient(id: string) {
  const { error } = await supabaseClient
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) throw error;
}