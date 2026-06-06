import { useEffect } from "react";

export function Modal({ open, onClose, title, subtitle, width = 480, children, dismissable = true }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (dismissable && e.key === "Escape") onClose?.(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-primary-900/30 backdrop-blur-sm"
        onClick={() => dismissable && onClose?.()}
      />
      <div
        className="relative surface !p-8 animate-scale-in max-h-[90vh] overflow-y-auto"
        style={{ width: `min(${width}px, calc(100vw - 32px))` }}
      >
        {title && (
          <div className="mb-6">
            <h2 className="font-display text-2xl font-extrabold text-ink-900">{title}</h2>
            {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
