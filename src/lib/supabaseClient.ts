import { createClient } from "@supabase/supabase-js";

// .trim() guards against a stray trailing \r/whitespace character sometimes
// left in .env.local by certain editors on Windows — a value like
// "https://xyz.supabase.co\r" is still "truthy" so it slips past a plain
// falsy check, but can cause hard-to-diagnose failures downstream
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars. Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in " +
      ".env.local, then FULLY RESTART the dev server (stop `npm run dev` and run it again). " +
      "Vite only reads .env files once, when the server starts — saving the file or hot-reloading " +
      "components will NOT pick up new or changed env vars."
  );
}

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);