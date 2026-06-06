const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
};

export function Button({ variant = "primary", className = "", icon, children, ...props }) {
  const base = variants[variant] || variants.primary;
  return (
    <button className={`${base} ${className}`.trim()} {...props}>
      {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      {children}
    </button>
  );
}
