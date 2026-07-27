import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or a loader

  // If user is logged in => redirect away from login/register
  if (user) {
    return <Navigate to="/create" replace />;
  }

  return children;
}