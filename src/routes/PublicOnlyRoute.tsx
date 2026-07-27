import { Navigate } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";

export function PublicOnlyRoute({ children }) {
  const session = supabaseClient.auth.getSession();

  if (session === null) return null;

  if (session.data.session) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}