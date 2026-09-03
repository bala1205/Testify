import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAssignedTests } from "../../services/testService";
import { getStudentAttempts } from "../../services/attemptService";
import { getUserProfile } from "../../services/userService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatDate, isTestActive, isTestUpcoming } from "../../utils/helpers";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [assigned, atts] = await Promise.all([getAssignedTests(profile.uid), getStudentAttempts(profile.uid)]);
      setTests(assigned);
      setAttempts(atts);
    };
    load().finally(() => setLoading(false));
  }, [profile.uid]);

  const attemptMap = Object.fromEntries(attempts.filter((a) => a.status !== "reset").map((a) => [a.testId, a]));

  const available = tests.filter((t) => isTestActive(t) && !["completed", "terminated"].includes(attemptMap[t.id]?.status));
  const upcoming = tests.filter((t) => isTestUpcoming(t) && !["completed", "terminated"].includes(attemptMap[t.id]?.status));
  const completed = tests.filter((t) => ["completed", "terminated"].includes(attemptMap[t.id]?.status));
  const terminated = tests.filter((t) => attemptMap[t.id]?.status === "terminated");

  if (loading) return <div className="py-12 text-center text-slate-500">Loading your exams...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-[1.75rem] p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative">
          <h1 className="text-3xl font-bold">Welcome, {profile.name}! 👋</h1>
          <p className="text-indigo-100 mt-2">You have <strong>{available.length}</strong> available, <strong>{upcoming.length}</strong> upcoming and <strong>{completed.length}</strong> completed tests.</p>
          <div className="mt-4 flex gap-2">
            <Badge variant="default" className="bg-white/20 text-white border-0 backdrop-blur">{profile.email}</Badge>
            <Badge variant="default" className="bg-white/20 text-white border-0">Student</Badge>
          </div>
        </div>
      </div>

      {/* Available */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">🟢 Available Tests <Badge variant="success">{available.length}</Badge></h2>
        {available.length === 0 ? <Card className="mt-3 text-center py-8"><p className="text-slate-500">No tests available right now. Check upcoming.</p></Card> : (
          <div className="grid gap-4 mt-3">
            {available.map((t) => {
              const att = attemptMap[t.id];
              const isInProgress = att?.status === "in_progress";
              return (
                <Card key={t.id} hover className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{t.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{t.description || "No description"}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                      <span>⏱ {t.durationMinutes} mins</span>
                      <span>Start: {formatDate(t.startTime)}</span>
                      <span>End: {formatDate(t.endTime)}</span>
                      {isInProgress && <Badge variant="warning">In Progress</Badge>}
                    </div>
                  </div>
                  <Link to={`/student/test/${t.id}/instructions`}><Button size="lg">{isInProgress ? "Resume Exam →" : "Start Test →"}</Button></Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">⏳ Upcoming Tests <Badge variant="warning">{upcoming.length}</Badge></h2>
        {upcoming.length === 0 ? <Card className="mt-3 text-center py-6"><p className="text-sm text-slate-500">No upcoming tests.</p></Card> : (
          <div className="grid gap-4 mt-3">
            {upcoming.map((t) => (
              <Card key={t.id} className="opacity-75">
                <h3 className="font-semibold text-slate-900">{t.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Starts: {formatDate(t.startTime)} — Ends: {formatDate(t.endTime)}</p>
                <Button variant="secondary" disabled className="mt-3">Not yet available</Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">✅ Completed <Badge variant="default">{completed.length}</Badge></h2>
        {completed.length === 0 ? <Card className="mt-3 text-center py-6"><p className="text-sm text-slate-500">No completed tests yet.</p></Card> : (
          <div className="grid gap-4 mt-3">
            {completed.map((t) => {
              const att = attemptMap[t.id];
              const isTerminated = att?.status === "terminated";
              return (
                <Card key={t.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isTerminated ? "border-rose-200 bg-rose-50/50" : ""}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{t.title}</h3>
                      {isTerminated && <Badge variant="danger">Terminated</Badge>}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Score: <strong>{att?.score}/{att?.totalQuestions}</strong> ({att?.percentage}%) • Malpractice: {att?.malpracticeCount || 0} {isTerminated && <span className="text-rose-600">• {att?.terminationEvent || "malpractice"}</span>}</div>
                    <div className="text-xs text-slate-500">{isTerminated ? `Terminated: ${formatDate(att?.terminatedAt || att?.submittedAt)}` : `Submitted: ${formatDate(att?.submittedAt)}`}</div>
                  </div>
                  <Link to={`/student/result/${att.id}`}><Button variant={isTerminated ? "secondary" : "secondary"} className={isTerminated ? "border-rose-200" : ""}>View Result</Button></Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm font-semibold text-amber-800">💻 Recommendation</p>
        <p className="text-sm text-amber-700 mt-1">For the best fullscreen exam experience, use a desktop or laptop with Chrome/Edge/Firefox. Mobile is supported but fullscreen monitoring is less reliable on small screens.</p>
      </Card>
    </div>
  );
}
