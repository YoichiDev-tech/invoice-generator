import { useAuth } from "../features/auth/hooks/useAuth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PublicOnlyRoute({ children }: Props) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    window.location.href = "/";
    return null;
  }

  return <>{children}</>;
}