import { Routes, Route, Navigate } from "react-router-dom";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import PreviewInvoicePage from "./pages/PreviewInvoicePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ClientsPage from "./pages/ClientsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";
import { AuthProvider } from "./features/auth/hooks/AuthProvider";
import AppLayout from "./components/invoice/layout/AppLayout";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout title="Overview" description="Your freelance business, at a glance."><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><AppLayout title="Invoices" description="Create, track, and manage your client billing."><InvoicesPage /></AppLayout></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><AppLayout title="Clients" description="Keep client details ready for the next project."><ClientsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><AppLayout title="Create invoice" description="Build a polished invoice with all the details your client needs."><CreateInvoicePage /></AppLayout></ProtectedRoute>} />
        <Route path="/preview" element={<ProtectedRoute><AppLayout title="Invoice preview" description="Review the document before exporting it."><PreviewInvoicePage /></AppLayout></ProtectedRoute>}
        <Route path="/preview/:invoiceId" element={<ProtectedRoute><AppLayout title="Invoice preview" description="Review the document before exporting it."><PreviewInvoicePage /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout title="Settings" description="Set defaults for your freelance business."><SettingsPage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
