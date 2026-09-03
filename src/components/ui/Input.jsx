export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={`w-full h-11 px-4 rounded-xl border bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${error ? "border-rose-300 focus:ring-rose-500 focus:border-rose-500" : "border-slate-200"} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        className={`w-full min-h-[90px] p-4 rounded-xl border bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${error ? "border-rose-300" : "border-slate-200"} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select className={`w-full h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${error ? "border-rose-300" : "border-slate-200"} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
