import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";

export default function Login() {
  const { login, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please select your role.");
      return;
    }
    setLoading(true);
    try {
      const profile = await login(email.trim(), password, role);
      if (profile.role === "admin") navigate("/admin", { replace: true });
      else if (profile.role === "staff") navigate("/staff", { replace: true });
      else navigate("/student", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">T</div>
            <div>
              <div className="font-bold text-slate-900">Testify</div>
              <div className="text-[11px] tracking-widest font-semibold text-indigo-600">SMART. SECURE. SIMPLE.</div>
            </div>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-slate-600 mt-2">Select your role and sign in to continue.</p>
          </div>

          {!isConfigured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <strong>Firebase not configured.</strong> Please create a Firebase project named <strong>Testify</strong>, enable Email/Password auth and Firestore, then paste config into <code className="bg-white px-1.5 py-0.5 rounded">.env</code>. See <code>.env.example</code>.
            </div>
          )}

          {error && <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition border-slate-200"
              >
                <option value="">Select your role</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
              </select>
            </div>
            <Input label="Email address" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Login →"}
            </Button>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Role is validated against your Firestore profile (<code>users/{"{uid}"}.role</code>).<br />
              You must select the correct role assigned to your account.
            </p>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative flex flex-col justify-between w-full max-w-lg mx-auto">
          <div />
          <div>
            <h2 className="text-4xl font-bold leading-tight">Secure exams, honest monitoring, instant results.</h2>
            <p className="mt-4 text-indigo-100 leading-relaxed">Role-verified login. Firestore is the source of truth. No bypass via dropdown.</p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { k: "Admin", v: "Full Control" },
                { k: "Staff", v: "Manage Students" },
                { k: "Student", v: "Take Exams" },
              ].map((s) => (
                <div key={s.v} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
                  <div className="font-bold text-sm">{s.k}</div>
                  <div className="text-xs text-indigo-100">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-indigo-200">© 2026 Testify • Firebase Auth + Firestore • testify-7afa8</div>
        </div>
      </div>
    </div>
  );
}
