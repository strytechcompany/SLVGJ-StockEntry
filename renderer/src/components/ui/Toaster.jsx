// Tiny toast container. Place once in AppShell; subscribers push events via
// the `events` prop and call `onDismiss` when the user clears one.
export function Toaster({ events, onDismiss }) {
  if (!events?.length) return null;
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {events.map((e) => (
        <div
          key={e.id}
          className="surface !p-4 !bg-primary-50 border-l-4 !border-l-primary-500 animate-slide-in-right flex items-start gap-3"
        >
          <span className="material-symbols-outlined text-primary-500 text-xl mt-0.5">sell</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary-600">
              Item Sold
            </div>
            <div className="text-sm font-bold text-ink-900 truncate">{e.product_name}</div>
            <div className="text-[11px] text-ink-500 font-mono">#{e.product_id}</div>
          </div>
          <button
            type="button"
            className="text-ink-300 hover:text-primary-600 transition"
            onClick={() => onDismiss(e.id)}
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
