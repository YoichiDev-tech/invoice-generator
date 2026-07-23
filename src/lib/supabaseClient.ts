import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars — check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local"
  );
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);