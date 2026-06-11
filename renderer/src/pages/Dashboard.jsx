import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listProducts,
  exportXLSX,
  requestDelete,
  confirmDelete,
} from "../api/products.api";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatCard } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ApprovalCodeModal } from "../components/features/ApprovalCodeModal";

const STATUS_FILTERS = [
  { key: "in_stock", label: "In Stock", icon: "inventory" },
  { key: "sold",     label: "Sold",     icon: "sell" },
  { key: "deleted",  label: "Deleted",  icon: "delete" },
  { key: "all",      label: "All",      icon: "list" },
];

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function Dashboard({ saleNonce = 0 }) {
  const navigate = useNavigate();
  const { staffName } = useAuth();
  const [status, setStatus] = useState("in_stock");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const { stats, refresh: refreshStats } = useDashboardStats({ refreshKey: saleNonce });

  const refresh = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const rows = await listProducts({ status, signal });
      setProducts(Array.isArray(rows) ? rows : []);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const ctl = new AbortController();
    refresh(ctl.signal);
    return () => ctl.abort();
  }, [refresh, saleNonce]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.product_id || "").toLowerCase().includes(q) ||
        (p.supplier_name || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink-900 tracking-tight">
            Inventory Dashboard
          </h1>
          <p className="text-sm text-ink-500 mt-1">Live stock from the shared jewelry database.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon="download" onClick={() => exportXLSX().catch((e) => setError(e.message))}>
            Export Excel
          </Button>
          <Button icon="add" onClick={() => navigate("/add")}>New Entry</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon="inventory_2" label="In Stock"          value={stats?.total_in_stock ?? "—"} />
        <StatCard icon="scale"       label="Total Weight (g)"  value={stats ? Number(stats.total_weight || 0).toFixed(2) : "—"} />
        <StatCard icon="add_circle"  label="Added Today"       value={stats?.added_today ?? "—"} />
        <StatCard icon="sell"        label="Sold Today"        value={stats?.sold_today ?? "—"} />
        <StatCard icon="pending"     label="Pending Approvals" value={stats?.pending_approvals ?? "—"} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatus(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition ${
              status === f.key
                ? "bg-primary-500 text-white shadow-glow"
                : "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm">{f.icon}</span>
            {f.label}
          </button>
        ))}
        <div className="relative flex-1 min-w-[200px] max-w-md ml-auto">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 text-base">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID or supplier…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
          />
        </div>
      </div>

      {error && <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</div>}

      {/* Table */}
      <div className="surface !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <span className="label-tag text-primary-500">
            {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}
          </span>
          <button
            type="button"
            onClick={() => { refresh(); refreshStats(); }}
            className="text-[11px] font-bold uppercase tracking-widest text-primary-700 hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cream-50 text-ink-500 uppercase text-[10px] font-black tracking-[0.18em] border-b border-cream-200">
                <th className="px-5 py-3">Item ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Net Wt (g)</th>
                <th className="px-5 py-3">Purity</th>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-cream-200">
              {filtered.map((p) => (
                <tr key={p.product_id} className="hover:bg-primary-50/40 transition">
                  <td className="px-5 py-3 font-mono font-bold text-primary-700">
                    <Link to={`/products/${p.product_id}`} className="hover:underline">
                      #{p.product_id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-bold text-ink-900">{p.name}</td>
                  <td className="px-5 py-3 text-ink-700">
                    {p.net_weight != null ? Number(p.net_weight).toFixed(3) : "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{p.purity || "—"}</td>
                  <td className="px-5 py-3 text-ink-700">{p.supplier_name || "—"}</td>
                  <td className="px-5 py-3 text-ink-500 text-xs">{fmtDate(p.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => navigate(`/edit/${p.product_id}`)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-700 transition"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setDeleteTarget(p)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center label-tag text-ink-300">
                    No products to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete approval flow */}
      <ApprovalCodeModal
        open={!!deleteTarget}
        purpose="delete"
        productName={deleteTarget?.name}
        onRequest={() => requestDelete(deleteTarget.product_id, staffName)}
        onVerify={async (pendingId, code) => {
          await confirmDelete(deleteTarget.product_id, pendingId, code);
        }}
        onSuccess={() => { refresh(); refreshStats(); }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
