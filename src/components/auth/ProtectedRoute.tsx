import { useAuth } from "../../features/auth/hooks/useAuth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    window.location.href = "/login";
    return null;
  }

  return <>{children}</>;
}