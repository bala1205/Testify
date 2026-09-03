import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { createTest } from "../../services/testService";
import { getAllStudents } from "../../services/userService";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

export default function CreateTest() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    startTime: "",
    endTime: "",
    assignedStudents: [],
  });

  useEffect(() => {
    getAllStudents().then(setStudents).catch(console.error);
  }, []);

  const toggleStudent = (uid) => {
    setForm((f) => ({
      ...f,
      assignedStudents: f.assignedStudents.includes(uid) ? f.assignedStudents.filter((id) => id !== uid) : [...f.assignedStudents, uid],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      alert("End time must be after start time");
      return;
    }
    setLoading(true);
    try {
      const id = await createTest({
        ...form,
        createdBy: profile.uid,
        createdByRole: profile.role,
      });
      alert("Test created: " + id);
      navigate(profile.role === "admin" ? "/admin/tests" : "/staff/tests");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Create Examination</h1>
      <p className="text-slate-600 mt-1">Fill test details and assign students. Duration is in minutes.</p>
      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Test Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g., React Basics — Midterm" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Test overview, instructions..." />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input label="Duration (minutes)" type="number" min={5} max={300} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
            <Input label="Start Date & Time" type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
            <Input label="End Date & Time" type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Assign Students ({form.assignedStudents.length} selected)</label>
            <div className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {students.length === 0 && <p className="p-4 text-sm text-slate-500">No students found. Create students first.</p>}
              {students.map((s) => (
                <label key={s.uid} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" checked={form.assignedStudents.includes(s.uid)} onChange={() => toggleStudent(s.uid)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.email} • {s.status}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setForm({ ...form, assignedStudents: students.map((s) => s.uid) })}>Select All</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, assignedStudents: [] })}>Clear</Button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Test"}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
