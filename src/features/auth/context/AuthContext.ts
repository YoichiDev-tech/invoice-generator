import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  // True only while we're checking for an existing session on first load.
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  isLoading: true,
});