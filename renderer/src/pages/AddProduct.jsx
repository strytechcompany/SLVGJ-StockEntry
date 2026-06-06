import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../api/products.api";
import { ProductForm, emptyProduct } from "../components/features/ProductForm";
import { Button } from "../components/ui/Button";

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProduct());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const created = await createProduct(form);
      // Jump to detail page with autoPrint flag so the label fires once.
      navigate(`/products/${created.product_id}?autoPrint=1`);
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="label-tag text-primary-500 hover:text-primary-700">← Back to dashboard</Link>
          <h1 className="font-display text-3xl font-extrabold text-ink-900 mt-2">New Stock Entry</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="surface !p-8 space-y-6 animate-fade-in-up">
        <ProductForm value={form} onChange={setForm} disabled={busy} />

        {error && (
          <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
          <Button type="button" variant="secondary" onClick={() => navigate("/")} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" icon="check" disabled={busy}>
            {busy ? "Saving…" : "Save & Print Label"}
          </Button>
        </div>
      </form>
    </div>
  );
}
