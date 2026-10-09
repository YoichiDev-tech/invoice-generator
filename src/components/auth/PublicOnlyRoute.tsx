import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PublicOnlyRoute({ children }: Props) {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && session) {
      navigate("/", { replace: true });
    }
  }, [isLoading, session, navigate]);

  if (isLoading || session) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
