import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

export function Layout({ children, navItems }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">T</div>
                <div>
                  <div className="font-bold text-slate-900 leading-none">Testify</div>
                  <div className="text-[11px] tracking-widest font-semibold text-indigo-600 leading-none">SMART. SECURE. SIMPLE.</div>
                </div>
              </Link>
              <nav className="hidden lg:flex items-center gap-1">
                {navItems?.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === item.path ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-900">{profile?.name || profile?.email}</span>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">{profile?.role}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                {(profile?.name || profile?.email || "U")[0].toUpperCase()}
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
                Logout
              </Button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center">
                ☰
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
              {navItems?.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${location.pathname === item.path ? "bg-indigo-50 text-indigo-700" : "text-slate-700"}`}
                >
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <span>© 2026 Testify — Smart. Secure. Simple.</span>
          <span className="text-xs">College Online Examination System • Built with Firebase</span>
        </div>
      </footer>
    </div>
  );
}
