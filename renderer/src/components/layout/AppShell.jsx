import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSaleAlerts } from "../../hooks/useSaleAlerts";
import { Toaster } from "../ui/Toaster";

const NAV = [
  { to: "/",         label: "Dashboard",        icon: "dashboard" },
  { to: "/add",      label: "New Entry",        icon: "inventory_2" },
  { to: "/pending",  label: "Pending Approvals",icon: "pending_actions" },
];

export function AppShell({ children, onSaleEvent }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { events, dismiss } = useSaleAlerts({ enabled: true });

  // Bubble events up so the Dashboard can refresh its row list.
  if (typeof onSaleEvent === "function" && events.length > 0) {
    onSaleEvent(events[0]);
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream-50 text-ink-900">
      <Toaster events={events} onDismiss={dismiss} />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream-100/80 backdrop-blur border-b border-cream-200">
        <div className="flex items-center justify-between px-8 h-16">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold text-primary-700">
            <span className="material-symbols-outlined text-primary-500 text-2xl">diamond</span>
            Stock Entry
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[11px] font-bold uppercase tracking-widest text-ink-500">
              Signed in as Staff
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary-700 hover:bg-primary-50 rounded-lg border border-primary-200 transition"
            >
              <span className="material-symbols-outlined text-sm align-middle mr-1">logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="w-64 sticky top-16 self-start h-[calc(100vh-64px)] bg-white border-r border-cream-200 py-8 px-3">
          <nav className="space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition ${
                    isActive
                      ? "bg-primary-50 text-primary-700 border-r-2 border-primary-500"
                      : "text-ink-500 hover:text-primary-700 hover:bg-cream-100"
                  }`
                }
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 px-2">
            <Link
              to="/add"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                         bg-primary-500 hover:bg-primary-700 text-white
                         font-bold text-[11px] uppercase tracking-widest shadow-glow transition"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Create Entry
            </Link>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────── */}
        <main className="flex-1 p-10">{children}</main>
      </div>
    </div>
  );
}
