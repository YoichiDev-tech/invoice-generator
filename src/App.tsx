import { Routes, Route, Navigate } from "react-router-dom";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import PreviewInvoicePage from "./pages/PreviewInvoicePage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./features/auth/hooks/AuthProvider";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/create" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
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