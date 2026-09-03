import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTestById } from "../../services/testService";
import { getAttemptForTest } from "../../services/attemptService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatDate } from "../../utils/helpers";

export default function Instructions() {
  const { testId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const t = await getTestById(testId);
      if (!t) { alert("Test not found"); navigate("/student"); return; }
      if (!t.assignedStudents?.includes(profile.uid)) { alert("Not assigned to this test"); navigate("/student"); return; }
      const att = await getAttemptForTest(profile.uid, testId);
      if (att?.status === "completed") { alert("You have already completed this test. Contact staff to reset."); navigate("/student"); return; }
      if (att?.status === "terminated") { alert("This test was terminated due to malpractice. Contact admin/staff to reset."); navigate(`/student/result/${att.id}?terminated=1`, { replace: true }); return; }
      setTest(t);
      setAttempt(att);
      setLoading(false);
    };
    load();
  }, [testId, profile.uid, navigate]);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading...</div>;
  if (!test) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/student" className="text-sm text-slate-600 hover:text-slate-900">← Back to Dashboard</Link>
      <Card className="overflow-hidden" padding={false}>
        <div className="bg-slate-900 text-white p-8">
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-slate-300 mt-2">{test.description}</p>
          <div className="flex flex-wrap gap-3 mt-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/10">⏱ {test.durationMinutes} mins</span>
            <span className="px-3 py-1 rounded-full bg-white/10">Start: {formatDate(test.startTime)}</span>
            <span className="px-3 py-1 rounded-full bg-white/10">End: {formatDate(test.endTime)}</span>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Exam Instructions — Please read carefully</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <h3 className="font-semibold text-amber-900">⚠️ Fullscreen Required</h3>
              <ul className="list-disc ml-5 mt-2 text-sm text-amber-800 space-y-1">
                <li>Exam will request fullscreen mode. Stay in fullscreen.</li>
                <li>Exiting fullscreen will be recorded as malpractice.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <h3 className="font-semibold text-rose-900">🚫 Prohibited Actions — Immediate Termination</h3>
              <ul className="list-disc ml-5 mt-2 text-sm text-rose-800 space-y-1">
                <li>Exiting fullscreen</li>
                <li>Switching browser tabs (visibilitychange)</li>
                <li>Minimizing or blurring the window</li>
                <li>Copy, Paste, Cut, Right-click</li>
                <li>Shortcuts like Ctrl+C/V/X/A/P, F12, Ctrl+Shift+I</li>
              </ul>
              <p className="text-xs text-rose-700 mt-2 font-semibold">⚠️ Any detected malpractice will immediately terminate your test. The first event will end the exam, save your current answers, and mark the attempt as terminated. You will be redirected and cannot continue without admin/staff reset.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900">ℹ️ Important Limitations (Honest Disclosure)</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Browser-based monitoring <strong>cannot</strong> detect everything: it cannot see outside the browser, prevent Alt+Tab at OS level reliably, detect secondary devices, or guarantee full cheat prevention without dedicated proctoring software. It only monitors realistic browser events via Fullscreen API, visibilitychange, blur/focus, and clipboard/contextmenu events.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <h3 className="font-semibold text-indigo-900">✅ Exam Flow</h3>
              <ul className="list-disc ml-5 mt-2 text-sm text-indigo-800 space-y-1">
                <li>Timer starts when you click <strong>Start Exam</strong> and request fullscreen.</li>
                <li>Navigate with Previous/Next; answers auto-saved.</li>
                <li>Timer auto-submits at 00:00. You can also submit manually.</li>
                <li>Do not close the browser until you see submission confirmation.</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 text-white text-sm">
              <span>💻</span> Recommendation: Use desktop/laptop for best fullscreen experience. Mobile/tablet is supported but may have limited proctoring.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" className="flex-1" onClick={() => navigate(`/student/test/${testId}/exam`)}>
              Start Exam → Enter Fullscreen
            </Button>
            <Link to="/student"><Button variant="secondary" size="lg">Cancel</Button></Link>
          </div>
          <p className="text-xs text-slate-500 text-center">By starting, you consent to browser-based malpractice monitoring as described above.</p>
        </div>
      </Card>
    </div>
  );
}
