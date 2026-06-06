export function Card({ className = "", children, ...rest }) {
  return (
    <div className={`surface p-6 ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, accent = "primary" }) {
  const accentClass = accent === "primary"
    ? "from-primary-100 to-primary-50 text-primary-700"
    : "from-cream-200 to-cream-100 text-ink-700";
  return (
    <div className="surface p-5 flex items-center gap-4 animate-fade-in-up">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div>
        <div className="label-tag text-primary-500">{label}</div>
        <div className="text-2xl font-extrabold text-ink-900 leading-tight">{value}</div>
      </div>
    </div>
  );
}
