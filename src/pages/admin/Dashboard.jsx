import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTests } from "../../services/testService";
import { getAllStaff, getAllStudents } from "../../services/userService";
import { getAllAttempts } from "../../services/attemptService";
import { Card, StatCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tests: 0, staff: 0, students: 0, attempts: 0, completed: 0 });
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [tests, staff, students, attempts] = await Promise.all([getAllTests(), getAllStaff(), getAllStudents(), getAllAttempts()]);
      setStats({ tests: tests.length, staff: staff.length, students: students.length, attempts: attempts.length, completed: attempts.filter((a) => a.status === "completed").length });
      setRecentTests(tests.slice(0, 5));
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Welcome, Admin. Manage your examination system.</p>
        </div>
        <Link to="/admin/tests/create"><Button size="lg">+ Create Test</Button></Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tests" value={stats.tests} icon="📝" color="indigo" />
        <StatCard title="Staff Members" value={stats.staff} icon="👨‍🏫" color="emerald" />
        <StatCard title="Students" value={stats.students} icon="🎓" color="amber" />
        <StatCard title="Completed Attempts" value={stats.completed} subtitle={`${stats.attempts} total attempts`} icon="📊" color="slate" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Tests</h3>
          <div className="space-y-3">
            {recentTests.length === 0 ? <p className="text-sm text-slate-500">No tests yet.</p> : recentTests.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-500">{t.assignedStudents?.length || 0} students • {t.durationMinutes} mins</div>
                </div>
                <Link to={`/admin/tests/${t.id}/edit`}><Button size="sm" variant="secondary">Manage</Button></Link>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid gap-2">
            <Link to="/admin/admins"><Button variant="secondary" className="w-full justify-start">🛡️ Manage Admins</Button></Link>
            <Link to="/admin/staff"><Button variant="secondary" className="w-full justify-start">👨‍🏫 Manage Staff</Button></Link>
            <Link to="/admin/students"><Button variant="secondary" className="w-full justify-start">🎓 Manage Students</Button></Link>
            <Link to="/admin/tests"><Button variant="secondary" className="w-full justify-start">📝 Manage Tests</Button></Link>
            <Link to="/admin/results"><Button variant="secondary" className="w-full justify-start">📊 View Results</Button></Link>
            <Link to="/admin/malpractice"><Button variant="secondary" className="w-full justify-start">⚠️ Malpractice Logs</Button></Link>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs font-semibold text-indigo-700 mb-1">💡 Admin Powers</p>
            <p className="text-xs text-indigo-600 leading-relaxed">You can manage all staff, all tests, view all results, monitor malpractice, and reset any student attempt.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
