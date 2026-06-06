import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getProductById } from "../api/products.api";
import { buildLabelHtml } from "../components/features/BarcodeLabel";
import { Button } from "../components/ui/Button";

const STATUS_BADGE = {
  in_stock: "bg-primary-50 text-primary-700 border-primary-200",
  sold:     "bg-cream-200 text-ink-700 border-cream-300",
  deleted:  "bg-red-50 text-red-600 border-red-200",
};

export default function ProductDetail() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [printMsg, setPrintMsg] = useState("");
  const printedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    getProductById(id)
      .then((p) => alive && setProduct(p))
      .catch((e) => alive && setError(e.message || "Failed to load product"));
    return () => { alive = false; };
  }, [id]);

  async function handlePrint() {
    if (!product) return;
    setPrintMsg("");
    try {
      const html = buildLabelHtml(product);
      if (window.electronAPI?.printLabel) {
        const res = await window.electronAPI.printLabel(html);
        setPrintMsg(res?.ok ? `Sent to ${res.printer || "default printer"}` : (res?.error || "Print failed"));
      } else {
        // Browser fallback for dev — open the label in a new window.
        const w = window.open("", "_blank", "width=400,height=300");
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      }
    } catch (e) {
      setPrintMsg(e.message || "Print failed");
    }
  }

  // Auto-print once if AddProduct redirected us with ?autoPrint=1
  useEffect(() => {
    if (!product || printedRef.current) return;
    if (search.get("autoPrint") === "1") {
      printedRef.current = true;
      handlePrint();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (error) return <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</div>;
  if (!product) return <div className="label-tag text-ink-500">Loading…</div>;

  const statusClass = STATUS_BADGE[product.status] || STATUS_BADGE.in_stock;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link to="/" className="label-tag text-primary-500 hover:text-primary-700">← Back to dashboard</Link>
      </div>

      <div className="surface !p-8 animate-fade-in-up">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="label-tag text-primary-500 mb-1">Product</div>
            <h1 className="font-display text-3xl font-extrabold text-ink-900">{product.name}</h1>
            <div className="text-sm text-ink-500 font-mono mt-1">#{product.product_id}</div>
          </div>
          <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusClass}`}>
            {product.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-3 text-sm">
            <Row label="Purity"          value={product.purity || "—"} />
            <Row label="Gross Weight"    value={fmtG(product.gross_weight)} />
            <Row label="Stone Weight"    value={fmtG(product.stone_weight)} />
            <Row label="Net Weight"      value={fmtG(product.net_weight)} highlight />
            <Row label="Buying Cost"     value={product.buying_cost ?? "—"} />
            <Row label="Bore Rate"       value={product.bore_rate ?? "—"} />
            <Row label="Supplier"        value={product.supplier_name || "—"} />
            <Row label="Price / gram"    value={product.price_per_gram ?? "—"} />
            <Row label="Making Charge"   value={product.making_charge ?? "—"} />
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="surface !bg-white !p-4 w-full text-center">
              {product.barcodeImage ? (
                <img src={product.barcodeImage} alt={product.barcode} className="w-full max-w-[260px] mx-auto" />
              ) : (
                <div className="text-ink-500 text-xs">No barcode</div>
              )}
              <div className="text-xs font-mono text-primary-700 mt-2">{product.barcode}</div>
            </div>
            <Button icon="print" onClick={handlePrint}>Print Label</Button>
            {printMsg && <div className="label-tag text-primary-700">{printMsg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtG(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `${n.toFixed(3)} g`;
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-baseline border-b border-cream-200 pb-2">
      <span className="label-tag text-ink-500">{label}</span>
      <span className={`font-bold ${highlight ? "text-primary-700 text-lg" : "text-ink-900"}`}>{value}</span>
    </div>
  );
}
