import { useEffect, useState } from "react";
import { createUserAccount, getAllUsersByRole, updateUser, disableUser, enableUser, deleteUserProfile } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { formatDate } from "../../utils/helpers";

export default function AdminManagement() {
  const { profile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [search, setSearch] = useState("");

  const fetchAdmins = async () => {
    setLoading(true);
    const data = await getAllUsersByRole("admin");
    setAdmins(data);
    setLoading(false);
  };
  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert("All fields required");
      return;
    }
    try {
      await createUserAccount({ name: form.name, email: form.email, password: form.password, role: "admin", createdBy: profile.uid });
      alert("Admin created successfully. Secondary app used — you remain logged in.");
      setShowAdd(false);
      setForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {
    await updateUser(editing.uid, { name: editing.name });
    setEditing(null);
    fetchAdmins();
  };

  const handleToggleStatus = async (u) => {
    // Prevent disabling self
    if (u.uid === profile.uid) {
      alert("You cannot disable your own account.");
      return;
    }
    if (u.status === "disabled") await enableUser(u.uid);
    else await disableUser(u.uid);
    fetchAdmins();
  };

  const handleDelete = async (uid) => {
    if (uid === profile.uid) {
      alert("You cannot delete your own account.");
      return;
    }
    if (!confirm("Delete admin profile? Auth user remains in Firebase Auth (delete manually if needed).")) return;
    await deleteUserProfile(uid);
    fetchAdmins();
  };

  const filtered = admins.filter((a) => a.name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
          <p className="text-slate-600">Only Admins can create other Admins. You remain logged in via secondary app.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Add Admin</Button>
      </div>

      <Card className="p-4">
        <input placeholder="Search admins by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
                {filtered.map((a) => (
                  <tr key={a.uid} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{a.name} {a.uid === profile.uid && <span className="text-xs text-indigo-600">(You)</span>}</td>
                    <td className="p-4 text-slate-600">{a.email}</td>
                    <td className="p-4"><Badge variant={a.status === "active" ? "success" : "danger"}>{a.status}</Badge></td>
                    <td className="p-4 text-slate-500 text-xs">{formatDate(a.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>Edit</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(a)} className={a.status === "active" ? "text-amber-600" : "text-emerald-600"}>{a.status === "active" ? "Disable" : "Enable"}</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(a.uid)} className="text-rose-600">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No admins found.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Admin">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Min 6 chars" />
          <p className="text-xs text-slate-500">Creates Firebase Auth user + Firestore <code>users/{"{uid}"} role:admin</code>. Password never stored in Firestore.</p>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit">Create Admin</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Admin">
        {editing && (
          <div className="space-y-4">
            <Input label="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Input label="Email" value={editing.email} disabled />
            <p className="text-xs text-slate-500">Role and status cannot be changed here via edit; use Disable/Enable buttons. Users cannot change their own role via this UI.</p>
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
