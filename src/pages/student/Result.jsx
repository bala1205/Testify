import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAttemptById } from "../../services/attemptService";
import { getTestById } from "../../services/testService";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";

export default function Result() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const att = await getAttemptById(attemptId);
      setAttempt(att);
      if (att) {
        const t = await getTestById(att.testId);
        setTest(t);
      }
      setLoading(false);
    };
    load();
  }, [attemptId]);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading result...</div>;
  if (!attempt) return <div className="py-12 text-center">Attempt not found</div>;

  const isTerminated = attempt.status === "terminated";
  const isPassed = isTerminated ? false : attempt.percentage >= 40;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/student" className="text-sm text-slate-600 hover:text-slate-900">← Back to Dashboard</Link>
      <Card className="text-center overflow-hidden" padding={false}>
        <div className={`p-8 text-white ${isTerminated ? "bg-gradient-to-br from-slate-800 to-slate-900" : isPassed ? "bg-gradient-to-br from-emerald-600 to-teal-600" : "bg-gradient-to-br from-rose-600 to-orange-600"}`}>
          <div className={`h-16 w-16 rounded-2xl backdrop-blur flex items-center justify-center text-2xl mx-auto ${isTerminated ? "bg-rose-500 text-white" : "bg-white/20"}`}>{isTerminated ? "⛔" : "✓"}</div>
          <h1 className="text-3xl font-bold mt-4">{isTerminated ? "Test Terminated" : "Examination Submitted"}</h1>
          <p className="text-white/80 mt-2">{test?.title}</p>
          {isTerminated && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500 text-white text-sm font-medium">
              Terminated due to malpractice: {attempt.terminationEvent || attempt.terminationReason || "malpractice"}
            </div>
          )}
          <div className="mt-6 flex justify-center gap-4">
            <div className="bg-white rounded-2xl px-6 py-4 text-slate-900 min-w-[120px]">
              <div className="text-3xl font-extrabold">{attempt.score}<span className="text-slate-400 font-bold">/{attempt.totalQuestions}</span></div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Score</div>
            </div>
            <div className="bg-white rounded-2xl px-6 py-4 text-slate-900 min-w-[120px]">
              <div className="text-3xl font-extrabold">{attempt.percentage}%</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Percentage</div>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <Badge variant="default" className={`border-0 ${isTerminated ? "bg-rose-500 text-white" : isPassed ? "bg-white text-emerald-700" : "bg-white text-rose-700"}`}>{isTerminated ? "Terminated" : isPassed ? "Passed" : "Needs Improvement"}</Badge>
            {isTerminated && <span className="text-xs text-white/70">Malpractice count: {attempt.malpracticeCount || 1} • {formatDate(attempt.terminatedAt || attempt.submittedAt)}</span>}
          </div>
        </div>
        <div className="p-6 sm:p-8 text-left space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">Test</div>
              <div className="font-medium text-slate-900 mt-1">{test?.title}</div>
              <div className="text-xs text-slate-500">{test?.description}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase">Submission</div>
              <div className="text-sm text-slate-900 mt-1">{formatDate(attempt.submittedAt)}</div>
              <div className="text-xs text-slate-500 mt-1">Status: <Badge variant="success">{attempt.status}</Badge></div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
              <div className="text-2xl font-bold text-indigo-700">{attempt.totalQuestions}</div>
              <div className="text-xs font-medium text-indigo-600">Total Questions</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="text-2xl font-bold text-emerald-700">{attempt.score}</div>
              <div className="text-xs font-medium text-emerald-600">Correct Answers</div>
            </div>
            <div className={`p-4 rounded-xl border text-center ${attempt.malpracticeCount > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
              <div className={`text-2xl font-bold ${attempt.malpracticeCount > 0 ? "text-amber-700" : "text-slate-700"}`}>{attempt.malpracticeCount || 0}</div>
              <div className="text-xs font-medium text-slate-600">Malpractice Warnings</div>
            </div>
          </div>
          {isTerminated ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-sm font-semibold text-rose-800">⛔ Your test has been ended because a malpractice activity was detected.</p>
              <p className="text-xs text-rose-700 mt-1">Termination is final. Your current answers have been saved. Detected: <strong>{attempt.terminationEvent || "malpractice"}</strong> • Status: <strong>Terminated</strong> • Malpractice count: {attempt.malpracticeCount || 1}. Contact admin/staff to reset if you believe this was in error.</p>
            </div>
          ) : attempt.malpracticeCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm font-semibold text-amber-800">⚠️ Note on Malpractice</p>
              <p className="text-xs text-amber-700 mt-1">Your malpractice count has been recorded and is visible to admin/staff. It does not auto-fail you but may be reviewed. This is browser-based monitoring with known limitations as disclosed before the exam.</p>
            </div>
          )}
          <div className="flex gap-3 justify-center pt-4">
            <Link to="/student"><Button variant="secondary">Back to Dashboard</Button></Link>
            <Link to="/student/results"><Button>View All Results</Button></Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
