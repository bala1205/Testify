export function Card({ children, className = "", hover, padding = true, ...props }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${hover ? "hover:shadow-md hover:border-slate-300 transition-all" : ""} ${padding ? "p-6" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}
export function StatCard({ title, value, subtitle, icon, color = "indigo" }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>{icon}</div>}
      </div>
    </Card>
  );
}
