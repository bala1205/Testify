import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getTestById, updateTest, getQuestions, addQuestion, updateQuestion, deleteQuestion } from "../../services/testService";
import { getAllStudents } from "../../services/userService";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { formatDate } from "../../utils/helpers";

export default function EditTest() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qForm, setQForm] = useState({ question: "", A: "", B: "", C: "", D: "", correctAnswer: "A" });
  const [editingQ, setEditingQ] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);

  const fetch = async () => {
    const t = await getTestById(id);
    if (!t) { alert("Test not found"); navigate(-1); return; }
    // permission: admin can edit all, staff only own
    if (profile.role === "staff" && t.createdBy !== profile.uid) {
      alert("You can only edit your own tests");
      navigate(-1);
      return;
    }
    setTest(t);
    setAssignedStudents(t.assignedStudents || []);
    const qs = await getQuestions(id);
    setQuestions(qs);
    setLoading(false);
  };

  useEffect(() => {
    getAllStudents().then(setStudents);
    fetch();
  }, [id]);

  const toggleAssigned = (uid) => {
    setAssignedStudents((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]));
  };

  const handleUpdateTest = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      title: fd.get("title"),
      description: fd.get("description"),
      durationMinutes: Number(fd.get("durationMinutes")),
      startTime: new Date(fd.get("startTime")),
      endTime: new Date(fd.get("endTime")),
      assignedStudents,
    };
    await updateTest(id, data);
    alert("Updated");
    fetch();
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      question: qForm.question,
      options: { A: qForm.A, B: qForm.B, C: qForm.C, D: qForm.D },
      correctAnswer: qForm.correctAnswer,
      order: questions.length,
    };
    if (editingQ) {
      await updateQuestion(id, editingQ, payload);
      setEditingQ(null);
    } else {
      await addQuestion(id, payload);
    }
    setQForm({ question: "", A: "", B: "", C: "", D: "", correctAnswer: "A" });
    const qs = await getQuestions(id);
    setQuestions(qs);
  };

  const handleEditQ = (q) => {
    setEditingQ(q.id);
    setQForm({ question: q.question, A: q.options.A, B: q.options.B, C: q.options.C, D: q.options.D, correctAnswer: q.correctAnswer });
  };

  const handleDeleteQ = async (qid) => {
    if (!confirm("Delete question?")) return;
    await deleteQuestion(id, qid);
    setQuestions(await getQuestions(id));
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!test) return null;

  const toLocal = (v) => {
    const d = v?.toDate ? v.toDate() : new Date(v);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Test: {test.title}</h1>
        <p className="text-sm text-slate-500">Created by {test.createdByRole} • {formatDate(test.createdAt)}</p>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Test Details</h2>
        <form onSubmit={handleUpdateTest} className="space-y-4">
          <Input name="title" label="Title" defaultValue={test.title} required />
          <Textarea name="description" label="Description" defaultValue={test.description} />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input name="durationMinutes" label="Duration (mins)" type="number" defaultValue={test.durationMinutes} required />
            <Input name="startTime" label="Start" type="datetime-local" defaultValue={toLocal(test.startTime)} required />
            <Input name="endTime" label="End" type="datetime-local" defaultValue={toLocal(test.endTime)} required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Assigned Students ({assignedStudents.length} selected)</label>
            <div className="mt-2 max-h-52 overflow-y-auto border border-slate-200 rounded-xl divide-y">
              {students.map((s) => (
                <label key={s.uid} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" name="assigned" value={s.uid} checked={assignedStudents.includes(s.uid)} onChange={() => toggleAssigned(s.uid)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                  <span className="text-sm">{s.name} <span className="text-slate-500">({s.email})</span></span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => setAssignedStudents(students.map((s) => s.uid))} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Select All</button>
              <button type="button" onClick={() => setAssignedStudents([])} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Clear</button>
            </div>
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900 mb-4">Questions ({questions.length})</h2>
        <form onSubmit={handleAddQuestion} className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h3 className="font-medium text-sm text-slate-700">{editingQ ? "Edit Question" : "Add New Question"}</h3>
          <Textarea placeholder="Question text" value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} required />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Option A" value={qForm.A} onChange={(e) => setQForm({ ...qForm, A: e.target.value })} required />
            <Input placeholder="Option B" value={qForm.B} onChange={(e) => setQForm({ ...qForm, B: e.target.value })} required />
            <Input placeholder="Option C" value={qForm.C} onChange={(e) => setQForm({ ...qForm, C: e.target.value })} required />
            <Input placeholder="Option D" value={qForm.D} onChange={(e) => setQForm({ ...qForm, D: e.target.value })} required />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Correct Answer:</label>
            <select value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} className="h-9 px-3 rounded-lg border border-slate-200">
              <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
            </select>
            <Button type="submit" size="sm">{editingQ ? "Update" : "Add"} Question</Button>
            {editingQ && <Button type="button" variant="ghost" size="sm" onClick={() => { setEditingQ(null); setQForm({ question: "", A: "", B: "", C: "", D: "", correctAnswer: "A" }); }}>Cancel</Button>}
          </div>
        </form>

        <div className="mt-6 space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{idx + 1}. {q.question}</div>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2 text-sm">
                    {["A", "B", "C", "D"].map((k) => (
                      <div key={k} className={`px-3 py-2 rounded-lg border ${q.correctAnswer === k ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium" : "bg-slate-50 border-slate-200"}`}>
                        <span className="font-bold">{k}.</span> {q.options[k]} {q.correctAnswer === k && "✓"}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="sm" variant="secondary" onClick={() => handleEditQ(q)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteQ(q.id)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No questions yet. Add questions above.</p>}
        </div>
      </Card>
    </div>
  );
}
