import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAllAttempts, getAttemptsForTest, getStudentAttempts, resetAttempt, getResultsForStudent } from "../../services/attemptService";
import { getAllTests, getTestsByCreator } from "../../services/testService";
import { getAllStudents } from "../../services/userService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";

export default function Results() {
  const { profile } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState({ test: "all", search: "" });
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    let atts = [];
    let ts = [];
    if (profile.role === "student") {
      atts = await getResultsForStudent(profile.uid);
      ts = await getAllTests(); // for lookup
    } else if (profile.role === "admin") {
      atts = await getAllAttempts();
      ts = await getAllTests();
      const studs = await getAllStudents();
      setStudents(studs);
    } else if (profile.role === "staff") {
      const myTests = await getTestsByCreator(profile.uid);
      ts = myTests;
      const all = await getAllAttempts();
      atts = all.filter((a) => myTests.some((t) => t.id === a.testId));
      const studs = await getAllStudents();
      setStudents(studs);
    }
    // only completed
    atts = atts.filter((a) => a.status === "completed");
    atts.sort((a, b) => {
      const aT = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : 0;
      const bT = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : 0;
      return bT - aT;
    });
    setAttempts(atts);
    setTests(ts);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [profile.role]);

  const handleReset = async (attemptId) => {
    if (!confirm("Reset this student's attempt? This will mark it as reset and allow them to retake. Previous attempt preserved as reset. Continue?")) return;
    await resetAttempt(attemptId, profile.uid);
    alert("Attempt reset. Student can now retake.");
    fetch();
  };

  const testMap = Object.fromEntries(tests.map((t) => [t.id, t]));
  const studentMap = Object.fromEntries(students.map((s) => [s.uid, s]));

  const filtered = attempts.filter((a) => {
    if (filter.test !== "all" && a.testId !== filter.test) return false;
    if (filter.search) {
      const testTitle = testMap[a.testId]?.title?.toLowerCase() || "";
      const studentName = (studentMap[a.studentId]?.name || studentMap[a.studentId]?.email || a.studentId).toLowerCase();
      return testTitle.includes(filter.search.toLowerCase()) || studentName.includes(filter.search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Results</h1>
        <p className="text-slate-600">
          {profile.role === "admin" ? "All results in system" : profile.role === "staff" ? "Results for your tests" : "Your results"}
        </p>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-3">
        <input placeholder="Search by test or student..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} className="flex-1 h-10 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={filter.test} onChange={(e) => setFilter({ ...filter, test: e.target.value })} className="h-10 px-4 rounded-xl border border-slate-200 bg-white">
          <option value="all">All Tests</option>
          {tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </Card>

      {loading ? <div className="text-center py-8 text-slate-500">Loading...</div> : filtered.length === 0 ? <Card className="text-center py-12 text-slate-500">No results found.</Card> : (
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold">Student</th>
                  <th className="text-left p-3 font-semibold">Test</th>
                  <th className="text-left p-3 font-semibold">Score</th>
                  <th className="text-left p-3 font-semibold">%</th>
                  <th className="text-left p-3 font-semibold">Malpractice</th>
                  <th className="text-left p-3 font-semibold">Submitted</th>
                  {(profile.role === "admin" || profile.role === "staff") && <th className="text-right p-3 font-semibold">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{profile.role === "student" ? profile.name : studentMap[a.studentId]?.name || a.studentId.slice(0, 8)}</div>
                      <div className="text-xs text-slate-500">{profile.role !== "student" && (studentMap[a.studentId]?.email || "")}</div>
                    </td>
                    <td className="p-3 font-medium">{testMap[a.testId]?.title || a.testId.slice(0, 8)}</td>
                    <td className="p-3"><span className="font-bold">{a.score}</span><span className="text-slate-500">/{a.totalQuestions}</span></td>
                    <td className="p-3"><Badge variant={a.percentage >= 50 ? "success" : a.percentage >= 40 ? "warning" : "danger"}>{a.percentage}%</Badge></td>
                    <td className="p-3 text-center">{a.malpracticeCount || 0}</td>
                    <td className="p-3 text-xs text-slate-500">{formatDate(a.submittedAt)}</td>
                    {(profile.role === "admin" || profile.role === "staff") && (
                      <td className="p-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleReset(a.id)} className="text-amber-600 hover:bg-amber-50">Reset Attempt</Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
