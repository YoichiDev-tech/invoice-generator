import { Routes, Route, Navigate } from "react-router-dom";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import PreviewInvoicePage from "./pages/PreviewInvoicePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/create" />} />
      <Route path="/create" element={<CreateInvoicePage />} />
      <Route path="/preview" element={<PreviewInvoicePage />} />
    </Routes>
  );
}