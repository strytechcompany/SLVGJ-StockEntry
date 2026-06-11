import { useEffect, useState } from "react";
import { listPendingActions } from "../api/products.api";

const STATUS_COLOR = {
  pending:  "bg-primary-50 text-primary-700 border-primary-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  expired:  "bg-cream-200 text-ink-500 border-cream-300",
};

const ACTION_LABEL = {
  login:  { label: "Login",  icon: "login",   color: "#7C3AED" },
  edit:   { label: "Edit",   icon: "edit",    color: "#D97706" },
  delete: { label: "Delete", icon: "delete",  color: "#DC2626" },
};

function fmt(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
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
          Approval requests awaiting an owner OTP code.
        </p>
      </div>

      {error && <div className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</div>}

      <div className="surface !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-cream-50 text-ink-500 uppercase text-[10px] font-black tracking-[0.18em] border-b border-cream-200">
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Requested By</th>
                <th className="px-5 py-3">Items Added</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Requested At</th>
                <th className="px-5 py-3">Expires</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-cream-200">
              {rows.map((r) => {
                const act = ACTION_LABEL[r.action_type] || { label: r.action_type, icon: "pending", color: "#6B7280" };
                const displayName = r.requested_by || "—";

                return (
                  <tr key={r.id} className="hover:bg-primary-50/40 transition">

                    {/* Action type */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{ color: act.color }}
                        >
                          {act.icon}
                        </span>
                        <span className="font-bold text-ink-900" style={{ color: act.color }}>
                          {act.label}
                        </span>
                      </div>
                    </td>

                    {/* Who requested — always shown */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          style={{
                            width: "28px", height: "28px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #D97706, #EC4899)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: "10px", fontWeight: "800", color: "#fff" }}>
                            {getInitials(displayName)}
                          </span>
                        </div>
                        <span className="font-semibold text-ink-900">{displayName}</span>
                      </div>
                    </td>

                    {/* Items this person has added to stock */}
                    <td className="px-5 py-3">
                      {r.requested_by && r.requested_by !== "—" ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="material-symbols-outlined text-[14px] text-primary-500"
                          >
                            inventory_2
                          </span>
                          <span className="font-bold text-primary-700">
                            {r.items_added ?? 0}
                          </span>
                          <span className="text-ink-400 text-xs">
                            {(r.items_added ?? 0) === 1 ? "item" : "items"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STATUS_COLOR[r.status] || STATUS_COLOR.pending}`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Timestamps */}
                    <td className="px-5 py-3 text-ink-500 text-xs">{fmt(r.created_at)}</td>
                    <td className="px-5 py-3 text-ink-500 text-xs">{fmt(r.expires_at)}</td>
                  </tr>
                );
              })}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center label-tag text-ink-300">
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
