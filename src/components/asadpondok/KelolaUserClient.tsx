'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const ROLES = ['superadmin', 'korda', 'penguji_sm_putra', 'penguji_sm_putri'];
const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super Admin', korda: 'Koordinator',
  penguji_sm_putra: 'Penguji PUTRA', penguji_sm_putri: 'Penguji PUTRI',
};

interface PondokUser {
  id: number; username: string; full_name: string; role: string;
  is_active: number; created_at: string;
}

export default function KelolaUserClient() {
  const [users, setUsers] = useState<PondokUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<PondokUser | null>(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'korda' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/asadpondok/users');
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditUser(null); setForm({ username: '', password: '', full_name: '', role: 'korda' }); setShowForm(true); };
  const openEdit = (u: PondokUser) => { setEditUser(u); setForm({ username: u.username, password: '', full_name: u.full_name, role: u.role }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = editUser
      ? { username: form.username, full_name: form.full_name, role: form.role, ...(form.password ? { password: form.password } : {}) }
      : form;
    const res = editUser
      ? await fetch(`/api/asadpondok/users/${editUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/asadpondok/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast.success(editUser ? 'User diperbarui' : 'User ditambahkan'); setShowForm(false); load(); }
    else { const d = await res.json(); toast.error(d.error || 'Gagal'); }
  };

  const toggleActive = async (u: PondokUser) => {
    await fetch(`/api/asadpondok/users/${u.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: u.is_active ? 0 : 1 }) });
    toast.success('Status diperbarui'); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    await fetch(`/api/asadpondok/users/${id}`, { method: 'DELETE' });
    toast.success('User dihapus'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Kelola User</h2>
        <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">+ Tambah User</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">{editUser ? 'Edit User' : 'Tambah User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password {editUser && '(kosongkan jika tidak diubah)'}</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" required={!editUser} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded text-sm hover:bg-gray-50">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Username</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.username}</td>
                  <td className="px-4 py-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{ROLE_LABELS[u.role]}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(u)} className={`px-2 py-0.5 rounded text-xs ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
