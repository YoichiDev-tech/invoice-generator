import { Routes, Route, Navigate } from "react-router-dom";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import PreviewInvoicePage from "./pages/PreviewInvoicePage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import { AuthProvider } from "./features/auth/hooks/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Redirect root to create invoice */}
        <Route path="/" element={<Navigate to="/create" replace />} />

        {/* Public-only routes */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateInvoicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <PreviewInvoicePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}