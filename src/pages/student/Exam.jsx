import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTestById, getQuestions } from "../../services/testService";
import { getAttemptForTest, createAttempt, updateAttempt, submitAttempt, terminateAttempt } from "../../services/attemptService";
import { useMalpractice } from "../../hooks/useMalpractice";
import { Button } from "../../components/ui/Button";

export default function Exam() {
  const { testId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationEvent, setTerminationEvent] = useState(null);
  const containerRef = useRef(null);
  const isTerminatingRef = useRef(false);
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const calculateScore = useCallback(() => {
    let score = 0;
    questions.forEach((q) => {
      if (answersRef.current[q.id] && answersRef.current[q.id] === q.correctAnswer) score++;
    });
    return score;
  }, [questions]);

  const handleMalpracticeTermination = useCallback(async (eventType) => {
    if (isTerminatingRef.current) return;
    isTerminatingRef.current = true;
    setIsTerminated(true);
    setTerminationEvent(eventType);
    setSubmitting(true);
    // Disable timer by clearing startedAt? We'll set a flag and stop timer via isTerminated
    // Save current answers and terminate attempt
    try {
      const score = calculateScore();
      const total = questions.length;
      const percentage = total ? Math.round((score / total) * 100) : 0;
      const currentAnswers = answersRef.current;
      await terminateAttempt(attemptId, {
        answers: currentAnswers,
        score,
        totalQuestions: total,
        percentage,
        eventType,
      });
    } catch (e) {
      console.error("Terminate failed", e);
    }
    // Exit fullscreen
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
    // Small delay to ensure Firestore write completes, then navigate
    setTimeout(() => {
      navigate(`/student/result/${attemptId}?terminated=1&event=${eventType}`, { replace: true });
    }, 800);
  }, [attemptId, questions, calculateScore, navigate]);

  // malpractice
  const { count: malpracticeCount, warningVisible } = useMalpractice({
    attemptId,
    studentId: profile.uid,
    testId,
    enabled: !!attemptId && !submitting && !isTerminated && !isTerminatingRef.current,
    onTerminate: handleMalpracticeTermination,
  });

  useEffect(() => {
    const init = async () => {
      const t = await getTestById(testId);
      if (!t) { alert("Test not found"); navigate("/student"); return; }
      setTest(t);
      const qs = await getQuestions(testId);
      setQuestions(qs);
      // check attempt
      let att = await getAttemptForTest(profile.uid, testId);
      if (att && att.status === "completed") {
        alert("Already completed");
        navigate("/student");
        return;
      }
      if (att && att.status === "terminated") {
        alert("This test was terminated due to malpractice. Contact admin to reset.");
        navigate(`/student/result/${att.id}?terminated=1`, { replace: true });
        return;
      }
      if (att && att.status === "in_progress") {
        setAttemptId(att.id);
        setAnswers(att.answers || {});
        answersRef.current = att.answers || {};
        setStartedAt(att.startedAt);
      } else {
        // create new attempt
        const newId = await createAttempt({ studentId: profile.uid, testId, totalQuestions: qs.length });
        setAttemptId(newId);
        const newAtt = await getAttemptForTest(profile.uid, testId);
        setStartedAt(newAtt?.startedAt || new Date());
      }
      setLoading(false);
      setTimeout(() => {
        if (containerRef.current?.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(() => console.log("Fullscreen denied"));
        } else if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      }, 300);
    };
    init();
  }, [testId, profile.uid, navigate]);

  // auto-save answer
  const handleSelect = async (qid, opt) => {
    if (isTerminated || isTerminatingRef.current) return;
    const newAnswers = { ...answers, [qid]: opt };
    setAnswers(newAnswers);
    if (attemptId) {
      try {
        await updateAttempt(attemptId, { answers: newAnswers });
      } catch {}
    }
  };

  const handleNext = () => {
    if (isTerminated || isTerminatingRef.current) return;
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
  };
  const handlePrev = () => {
    if (isTerminated || isTerminatingRef.current) return;
    setCurrentIdx((i) => Math.max(i - 1, 0));
  };
  const handleJump = (idx) => {
    if (isTerminated || isTerminatingRef.current) return;
    setCurrentIdx(idx);
  };

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting || isTerminated || isTerminatingRef.current) return;
    if (!isAuto && !confirm("Are you sure you want to submit the examination?")) return;
    setSubmitting(true);
    try {
      const score = calculateScore();
      const total = questions.length;
      const percentage = total ? Math.round((score / total) * 100) : 0;
      await submitAttempt(attemptId, {
        answers: answersRef.current,
        score,
        totalQuestions: total,
        percentage,
        malpracticeCount,
      });
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch {}
      }
      navigate(`/student/result/${attemptId}`, { replace: true });
    } catch (e) {
      alert("Submit failed: " + e.message);
      setSubmitting(false);
    }
  }, [submitting, isTerminated, calculateScore, questions.length, attemptId, malpracticeCount, navigate]);

  // timer handling
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!startedAt || !test || isTerminated || isTerminatingRef.current) return;
    const start = startedAt.toDate ? startedAt.toDate() : new Date(startedAt);
    const totalSec = test.durationMinutes * 60;
    const tick = () => {
      if (isTerminatingRef.current || isTerminated) return;
      const elapsed = Math.floor((Date.now() - start.getTime()) / 1000);
      const left = Math.max(0, totalSec - elapsed);
      setRemaining(left);
      if (left === 0) handleSubmit(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, test, handleSubmit, isTerminated]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Loading exam...</div>;
  if (!test || questions.length === 0) return <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8"><div className="bg-white p-8 rounded-2xl">No questions in this test. Contact staff.</div></div>;

  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const m = remaining !== null ? Math.floor(remaining / 60) : 0;
  const s = remaining !== null ? remaining % 60 : 0;
  const isLow = remaining !== null && remaining < 300;
  const isCritical = remaining !== null && remaining < 60;

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 flex flex-col">
      {/* Termination Overlay */}
      {isTerminated && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur flex items-center justify-center p-6">
          <div className="bg-white rounded-[1.5rem] p-8 max-w-md w-full text-center shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl mx-auto">⛔</div>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Test Terminated</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">Your test has been ended because a malpractice activity was detected.</p>
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-left">
              <div className="text-xs font-semibold text-rose-700 uppercase">Detected</div>
              <div className="text-sm font-medium text-rose-800">{terminationEvent || "malpractice"} • Warnings: {malpracticeCount + 1}</div>
              <div className="text-xs text-rose-600 mt-1">Status: <strong>Terminated</strong> • Termination is final. You cannot continue.</div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Redirecting to result page...</p>
            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 animate-pulse" style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-slate-900 truncate">{test.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-500">Q {currentIdx + 1}/{questions.length} • {answeredCount} answered</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${malpracticeCount > 0 ? "bg-rose-100 text-rose-700 border border-rose-200" : "bg-slate-100 text-slate-600"}`}>
            ⚠️ Warnings: {malpracticeCount}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold border ${isCritical ? "bg-rose-600 text-white border-rose-600 animate-pulse" : isLow ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-slate-900 text-white border-slate-900"}`}>
            ⏱ {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
        </div>
      </header>

      {warningVisible && !isTerminated && (
        <div className="bg-rose-600 text-white text-center py-3 px-4 text-sm font-medium animate-pulse">
          ⚠️ Malpractice Warning — Suspicious activity detected. Please remain in the examination window and avoid prohibited actions. Warnings: {malpracticeCount}
        </div>
      )}

      <div className={`flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col ${isTerminated ? "pointer-events-none opacity-50" : ""}`}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col">
          <div className="p-6 sm:p-8 flex-1">
            <div className="flex items-start gap-3">
              <span className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{currentIdx + 1}</span>
              <h2 className="text-lg font-semibold text-slate-900 leading-relaxed">{q.question}</h2>
            </div>
            <div className="grid gap-3 mt-6">
              {["A", "B", "C", "D"].map((optKey) => {
                const selected = answers[q.id] === optKey;
                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelect(q.id, optKey)}
                    disabled={isTerminated}
                    className={`text-left p-4 rounded-xl border-2 transition flex items-center gap-3 ${selected ? "bg-indigo-50 border-indigo-600 text-indigo-900" : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}>{optKey}</span>
                    <span className="flex-1 text-sm font-medium">{q.options?.[optKey]}</span>
                    {selected && <span className="text-indigo-600">●</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between gap-3">
            <Button variant="secondary" disabled={currentIdx === 0 || isTerminated} onClick={handlePrev}>← Previous</Button>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-500">{currentIdx + 1} / {questions.length}</span>
              {currentIdx < questions.length - 1 ? (
                <Button onClick={handleNext} disabled={isTerminated}>Next →</Button>
              ) : (
                <Button onClick={() => handleSubmit(false)} disabled={submitting || isTerminated} className="bg-emerald-600 hover:bg-emerald-700">
                  {submitting ? "Submitting..." : "Submit Test ✓"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question palette */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-700 mb-3">Question Palette</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((qq, idx) => {
              const isAnswered = !!answers[qq.id];
              const isCurrent = idx === currentIdx;
              return (
                <button
                  key={qq.id}
                  onClick={() => handleJump(idx)}
                  disabled={isTerminated}
                  className={`h-9 w-9 rounded-xl text-sm font-medium border-2 transition ${isCurrent ? "bg-indigo-600 text-white border-indigo-600" : isAnswered ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"} disabled:opacity-50`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-200"></span> Answered</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-white border border-slate-200"></span> Not Answered</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-indigo-600"></span> Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}
