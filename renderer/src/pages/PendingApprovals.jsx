import { useEffect, useState } from "react";
import { listPendingActions } from "../api/products.api";

const STATUS_COLOR = {
  pending:  "bg-primary-50 text-primary-700 border-primary-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  expired:  "bg-cream-200 text-ink-500 border-cream-300",
};

function fmt(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export default function PendingApprovals() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listPendingActions();
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load pending actions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink-900">Pending Approvals</h1>
        <p className="text-sm text-ink-500 mt-1">
          Read-only queue of approval requests awaiting an owner code.
        </p>
      </div>

      {error && <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</div>}

      <div className="surface !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cream-50 text-ink-500 uppercase text-[10px] font-black tracking-[0.18em] border-b border-cream-200">
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Expires</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-cream-200">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-primary-50/40 transition">
                  <td className="px-5 py-3 font-bold text-ink-900 capitalize">{r.action_type}</td>
                  <td className="px-5 py-3 font-mono text-primary-700">{r.product_id || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLOR[r.status] || STATUS_COLOR.pending}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-500 text-xs">{fmt(r.created_at)}</td>
                  <td className="px-5 py-3 text-ink-500 text-xs">{fmt(r.expires_at)}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center label-tag text-ink-300">
                    No pending approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
