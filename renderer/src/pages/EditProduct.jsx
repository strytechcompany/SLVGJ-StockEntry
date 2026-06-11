import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, requestEdit, confirmEdit } from "../api/products.api";
import { useAuth } from "../contexts/AuthContext";
import { ProductForm } from "../components/features/ProductForm";
import { ApprovalCodeModal } from "../components/features/ApprovalCodeModal";
import { Button } from "../components/ui/Button";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staffName } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalOpen, setApprovalOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getProductById(id)
      .then((p) => { if (alive) setForm(p); })
      .catch((e) => alive && setError(e.message || "Failed to load product"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  function handleSubmit(e) {
    e.preventDefault();
    setApprovalOpen(true);
  }

  if (loading) {
    return <div className="label-tag text-ink-500">Loading product…</div>;
  }
  if (!form) {
    return <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error || "Not found"}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/" className="label-tag text-primary-500 hover:text-primary-700">← Back to dashboard</Link>
        <h1 className="font-display text-3xl font-extrabold text-ink-900 mt-2">Edit Product</h1>
        <p className="text-xs text-ink-500 font-mono mt-1">#{form.product_id}</p>
      </div>

      <form onSubmit={handleSubmit} className="surface !p-8 space-y-6 animate-fade-in-up">
        <ProductForm value={form} onChange={setForm} />

        {error && <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
          <Button type="button" variant="secondary" onClick={() => navigate("/")}>Cancel</Button>
          <Button type="submit" icon="lock_open">Request approval & save</Button>
        </div>
      </form>

      <ApprovalCodeModal
        open={approvalOpen}
        purpose="edit"
        productName={form.name}
        onRequest={() => requestEdit(form.product_id, form, staffName)}
        onVerify={async (pendingId, code) => {
          await confirmEdit(form.product_id, pendingId, code);
        }}
        onSuccess={() => navigate("/")}
        onClose={() => setApprovalOpen(false)}
      />
    </div>
  );
}
