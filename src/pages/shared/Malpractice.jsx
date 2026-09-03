import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getAllAttempts, getMalpracticeEvents } from "../../services/attemptService";
import { getTestsByCreator, getAllTests } from "../../services/testService";
import { getAllStudents } from "../../services/userService";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";

export default function Malpractice() {
  const { profile } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [eventsByAttempt, setEventsByAttempt] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      let atts = await getAllAttempts();
      let ts = [];
      if (profile.role === "staff") {
        const myTests = await getTestsByCreator(profile.uid);
        ts = myTests;
        atts = atts.filter((a) => myTests.some((t) => t.id === a.testId));
      } else {
        ts = await getAllTests();
      }
      const studs = await getAllStudents();
      setAttempts(atts.filter((a) => (a.malpracticeCount || 0) > 0));
      setTests(ts);
      setStudents(studs);
      // fetch events for those attempts
      const map = {};
      for (const a of atts.filter((a) => (a.malpracticeCount || 0) > 0).slice(0, 20)) {
        const ev = await getMalpracticeEvents(a.id);
        map[a.id] = ev;
      }
      setEventsByAttempt(map);
      setLoading(false);
    };
    load();
  }, [profile.role, profile.uid]);

  const testMap = Object.fromEntries(tests.map((t) => [t.id, t]));
  const studentMap = Object.fromEntries(students.map((s) => [s.uid, s]));

  if (loading) return <div className="py-8 text-center text-slate-500">Loading malpractice logs...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Malpractice Monitoring</h1>
        <p className="text-slate-600">Browser-based events. Honest limitations disclosed — not full OS proctoring.</p>
      </div>

      <Card className="p-4 bg-indigo-50 border-indigo-200">
        <p className="text-sm text-indigo-800 leading-relaxed">
          <strong>What we detect:</strong> fullscreen exit, tab switch (visibility hidden), window blur, copy/paste/cut, context menu, and shortcuts (Ctrl+C/V/X etc). <strong>What we cannot detect:</strong> OS-level Alt+Tab, external devices, activity outside browser, or phone usage. This is realistic browser-level monitoring only.
        </p>
      </Card>

      {attempts.length === 0 ? <Card className="text-center py-12 text-slate-500">No malpractice events recorded. All good! 🎉</Card> : (
        <div className="space-y-3">
          {attempts.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{testMap[a.testId]?.title || a.testId} <Badge variant="danger" className="ml-2">{a.malpracticeCount} warnings</Badge></div>
                  <div className="text-sm text-slate-600">Student: {studentMap[a.studentId]?.name || a.studentId} ({studentMap[a.studentId]?.email || ""})</div>
                  <div className="text-xs text-slate-500">Status: {a.status} • Started: {formatDate(a.startedAt)} {a.submittedAt && `• Submitted: ${formatDate(a.submittedAt)}`}</div>
                </div>
                <button onClick={() => setExpanded(expanded === a.id ? null : a.id)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  {expanded === a.id ? "Hide events" : "View events →"}
                </button>
              </div>
              {expanded === a.id && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  {(eventsByAttempt[a.id] || []).length === 0 ? <p className="text-sm text-slate-500">No detailed events found (or not yet loaded). Count: {a.malpracticeCount}</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 border-b">
                            <th className="pb-2">Event Type</th>
                            <th className="pb-2">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {eventsByAttempt[a.id].map((ev) => (
                            <tr key={ev.id}>
                              <td className="py-2"><Badge variant="warning">{ev.eventType}</Badge></td>
                              <td className="py-2 text-xs text-slate-500">{formatDate(ev.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
