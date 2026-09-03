import { useEffect, useState } from "react";
import { createUserAccount, getAllStaff, updateUser, disableUser, enableUser, deleteUserProfile } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { formatDate } from "../../utils/helpers";

export default function StaffManagement() {
  const { profile } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    const data = await getAllStaff();
    setStaff(data);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createUserAccount({ name: form.name, email: form.email, password: form.password, role: "staff", createdBy: profile.uid });
      alert("Staff created successfully. If you were logged out, please re-login.");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "" });
      fetch();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    await updateUser(editing.uid, { name: editing.name });
    setEditing(null);
    fetch();
  };

  const handleToggleStatus = async (u) => {
    if (u.status === "disabled") await enableUser(u.uid);
    else await disableUser(u.uid);
    fetch();
  };

  const handleDelete = async (uid) => {
    if (!confirm("Delete staff profile? Auth user remains in Firebase Auth (delete manually if needed).")) return;
    await deleteUserProfile(uid);
    fetch();
  };

  const filtered = staff.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600">Admin can add, edit, disable, and delete staff.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add Staff</Button>
      </div>

      <Card className="p-4">
        <input placeholder="Search staff by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </Card>

      {loading ? <div className="text-center py-8 text-slate-500">Loading...</div> : (
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Created</th>
                  <th className="text-right p-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.uid} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{s.name}</td>
                    <td className="p-4 text-slate-600">{s.email}</td>
                    <td className="p-4"><Badge variant={s.status === "active" ? "success" : "danger"}>{s.status}</Badge></td>
                    <td className="p-4 text-slate-500 text-xs">{formatDate(s.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(s)} className={s.status === "active" ? "text-amber-600" : "text-emerald-600"}>{s.status === "active" ? "Disable" : "Enable"}</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(s.uid)} className="text-rose-600">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No staff found.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Staff">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 chars" />
          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">⚠️ Creating users from client uses a secondary Firebase app to avoid logging you out. If it still logs you out, simply log back in. For production, use Cloud Functions.</p>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit">Create Staff</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Staff">
        {editing && (
          <div className="space-y-4">
            <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input label="Email" value={editing.email} disabled />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
