import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ProductDetail from "./pages/ProductDetail";
import PendingApprovals from "./pages/PendingApprovals";

export default function App() {
  const { isAuthed } = useAuth();
  // Bumped each time the dashboard should refetch (after a sale toast pops).
  const [saleNonce, setSaleNonce] = useState(0);

  if (!isAuthed) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <AppShell onSaleEvent={() => setSaleNonce((n) => n + 1)}>
      <Routes>
        <Route path="/" element={<Dashboard saleNonce={saleNonce} />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/edit/:id" element={<EditProduct />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/pending" element={<PendingApprovals />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
