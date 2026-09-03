export function Button({ children, variant = "primary", size = "md", className = "", disabled, ...props }) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-500/20",
    secondary: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-400",
    ghost: "hover:bg-slate-100 text-slate-600",
    danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    outline: "border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
  };
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-[15px]",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
