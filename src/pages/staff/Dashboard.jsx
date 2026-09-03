import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTestsByCreator } from "../../services/testService";
import { getAllStudents } from "../../services/userService";
import { getAllAttempts } from "../../services/attemptService";
import { Card, StatCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function StaffDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ myTests: 0, students: 0, attempts: 0 });
  const [myTests, setMyTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [tests, students, attempts] = await Promise.all([getTestsByCreator(profile.uid), getAllStudents(), getAllAttempts()]);
      setStats({ myTests: tests.length, students: students.length, attempts: attempts.filter((a) => tests.some((t) => t.id === a.testId)).length });
      setMyTests(tests.slice(0, 5));
    };
    load();
  }, [profile.uid]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Dashboard</h1>
          <p className="text-slate-600">Welcome, {profile.name}. Manage students and examinations.</p>
        </div>
        <Link to="/staff/tests/create"><Button size="lg">+ Create Test</Button></Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="My Tests" value={stats.myTests} icon="📝" color="indigo" />
        <StatCard title="Total Students" value={stats.students} icon="🎓" color="emerald" />
        <StatCard title="Attempts on My Tests" value={stats.attempts} icon="📊" color="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">My Recent Tests</h3>
          <div className="space-y-3">
            {myTests.length === 0 ? <p className="text-sm text-slate-500">No tests created yet.</p> : myTests.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-500">{t.assignedStudents?.length || 0} students • {t.durationMinutes} mins</div>
                </div>
                <Link to={`/staff/tests/${t.id}/edit`}><Button size="sm" variant="secondary">Manage</Button></Link>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid gap-2">
            <Link to="/staff/students"><Button variant="secondary" className="w-full justify-start">🎓 Manage Students</Button></Link>
            <Link to="/staff/tests"><Button variant="secondary" className="w-full justify-start">📝 My Tests</Button></Link>
            <Link to="/staff/results"><Button variant="secondary" className="w-full justify-start">📊 Results</Button></Link>
            <Link to="/staff/malpractice"><Button variant="secondary" className="w-full justify-start">⚠️ Malpractice Logs</Button></Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
