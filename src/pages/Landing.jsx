import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export default function Landing() {
  const { profile } = useAuth();
  const getDashboardLink = () => {
    if (!profile) return "/login";
    if (profile.role === "admin") return "/admin";
    if (profile.role === "staff") return "/staff";
    return "/student";
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">T</div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg leading-none">Testify</div>
              <div className="text-[10px] tracking-[0.2em] font-bold text-indigo-600">SMART. SECURE. SIMPLE.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to={getDashboardLink()}>
              <Button>{profile ? "Go to Dashboard" : "Get Started"}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-6">
              ● Trusted by Colleges • Firebase Secured
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[0.95]">
              Online exams, <span className="text-indigo-600">made simple</span> and secure.
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Testify is a production-grade examination platform for colleges. Create tests, assign students, conduct proctored exams with malpractice detection, and automate scoring — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={getDashboardLink()}>
                <Button size="lg">Start Exam Journey →</Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg">Learn More</Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-2">✓ Role-based access</span>
              <span className="flex items-center gap-2">✓ Fullscreen proctoring</span>
              <span className="flex items-center gap-2">✓ Auto scoring</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-indigo-100 via-violet-50 to-indigo-50 rounded-[2.5rem] blur-2xl" />
            <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">📝</div>
                  <div>
                    <div className="font-semibold text-slate-900">React Basics — Final</div>
                    <div className="text-xs text-slate-500">60 mins • 20 Questions</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">Live</span>
              </div>
              <div className="space-y-3">
                {[
                  { q: "What is React?", opt: "JavaScript Library", selected: true },
                  { q: "What is JSX?", opt: "Syntax Extension", selected: false },
                  { q: "Hooks introduced in?", opt: "React 16.8", selected: true },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${item.selected ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="text-sm font-medium text-slate-900">{i + 1}. {item.q}</div>
                    <div className={`mt-2 text-sm px-3 py-2 rounded-xl ${item.selected ? "bg-white border border-indigo-200 text-indigo-700" : "bg-white text-slate-600"}`}>● {item.opt}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-sm font-medium text-amber-800">⚠️ Malpractice Warnings: 1</span>
                <span className="text-xs text-amber-700">Fullscreen monitoring active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need for college exams</h2>
            <p className="mt-3 text-slate-600">From user management to proctoring, Testify handles the entire exam lifecycle.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { title: "Admin Control", desc: "Manage staff, oversee all tests, view results and malpractice logs.", icon: "🛡️" },
              { title: "Staff Workspace", desc: "Create students, craft tests, assign batches, and reset attempts.", icon: "👨‍🏫" },
              { title: "Student Experience", desc: "Clean dashboard, fullscreen exams, instant results, and fairness.", icon: "🎓" },
              { title: "Secure Exams", desc: "Fullscreen API, tab-switch & copy detection with honest limitations.", icon: "🔒" },
              { title: "Auto Scoring", desc: "Instant calculation of scores and percentages on submission.", icon: "⚡" },
              { title: "Firebase Powered", desc: "Authentication + Firestore with strict security rules.", icon: "🔥" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { role: "Admin", items: ["Manage Staff accounts", "Create & manage all tests", "View all results & logs", "Reset any attempt"], color: "from-violet-600 to-indigo-600" },
            { role: "Staff", items: ["Create Student accounts", "Create own tests & questions", "Assign students", "View relevant results"], color: "from-indigo-600 to-blue-600" },
            { role: "Student", items: ["View assigned tests", "Take fullscreen exams", "Auto-submit & scoring", "View own results"], color: "from-emerald-600 to-teal-600" },
          ].map((r) => (
            <div key={r.role} className="rounded-[1.75rem] p-[1.5px] bg-gradient-to-br from-slate-200 to-slate-100">
              <div className="bg-white rounded-[1.65rem] p-6 h-full">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white font-bold`}>{r.role[0]}</div>
                <h3 className="font-bold text-slate-900 mt-4 text-lg">{r.role}</h3>
                <ul className="mt-3 space-y-2">
                  {r.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-emerald-500 mt-0.5">✓</span> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h4 className="font-semibold text-amber-900">⚠️ Honest Proctoring Disclosure</h4>
          <p className="text-sm text-amber-800 mt-1 leading-relaxed">
            Testify uses realistic browser-based monitoring only: fullscreen, visibility, blur, copy/paste, context menu, and shortcut detection. It cannot detect OS-level actions, external devices, or guarantee full cheat prevention. This is clearly communicated to students before exams.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © 2026 Testify • Built for Colleges • Firebase Authentication & Firestore
      </footer>
    </div>
  );
}
