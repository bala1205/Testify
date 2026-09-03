import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAllTests, getTestsByCreator, deleteTest } from "../../services/testService";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDate, getTestStatusBadge } from "../../utils/helpers";

export default function TestList() {
  const { profile } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    const data = profile.role === "admin" ? await getAllTests() : await getTestsByCreator(profile.uid);
    setTests(data);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this test? Questions will also be removed.")) return;
    await deleteTest(id);
    fetch();
  };

  const filtered = tests.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Test Management</h1>
          <p className="text-slate-600">{profile.role === "admin" ? "All tests in system" : "Tests created by you"}</p>
        </div>
        <Link to={profile.role === "admin" ? "/admin/tests/create" : "/staff/tests/create"}>
          <Button>+ Create Test</Button>
        </Link>
      </div>

      <Card className="p-4">
        <input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </Card>

      {loading ? <div className="text-center py-12 text-slate-500">Loading...</div> : filtered.length === 0 ? <Card className="text-center py-12"><p className="text-slate-500">No tests found.</p></Card> : (
        <div className="grid gap-4">
          {filtered.map((t) => {
            const badge = getTestStatusBadge(t);
            return (
              <Card key={t.id} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{t.title}</h3>
                    <Badge variant={badge.label === "Active" ? "success" : badge.label === "Upcoming" ? "warning" : "default"}>{badge.label}</Badge>
                    <span className="text-xs text-slate-500">• {t.durationMinutes} mins</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{t.description || "No description"}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                    <span>Start: {formatDate(t.startTime)}</span>
                    <span>End: {formatDate(t.endTime)}</span>
                    <span>Assigned: {t.assignedStudents?.length || 0} students</span>
                    <span>By: {t.createdByRole}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`${profile.role === "admin" ? "/admin" : "/staff"}/tests/${t.id}/edit`}><Button variant="secondary" size="sm">Edit & Questions</Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-rose-600 hover:bg-rose-50">Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
