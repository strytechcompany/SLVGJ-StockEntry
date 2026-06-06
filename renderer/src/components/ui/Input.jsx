export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="label-tag block mb-1 text-primary-600">{label}</span>
      {children}
      {hint && !error && <span className="block mt-1 text-[11px] text-ink-500">{hint}</span>}
      {error && <span className="block mt-1 text-[11px] text-red-500">{error}</span>}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`field-input ${className}`.trim()} {...props} />;
}

export function NumberInput(props) {
  return <Input type="number" step="0.001" {...props} />;
}
