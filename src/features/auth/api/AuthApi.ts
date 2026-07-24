import { supabaseClient } from "../../../lib/supabaseClient";

// Sign up a new user with email + password
// Depending on your Supabase project's Auth settings, this may require
// email confirmation before a session is returned
export async function signUp(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

// Sign in an existing user with email + password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign the current user out and clear their session
export async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}