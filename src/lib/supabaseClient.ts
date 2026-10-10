import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Folio needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add them to your environment and restart the dev server.");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
