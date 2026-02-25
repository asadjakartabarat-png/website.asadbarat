'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User { id: number; username: string; full_name: string; role: string; desa_id: number | null; nama_desa?: string; is_active: number; }
interface Desa { id: number; nama_desa: string; }

const ROLES = ['super_admin', 'koordinator_desa', 'koordinator_daerah', 'viewer', 'astrida'];
const ROLE_LABELS: Record<string, string> = { super_admin: 'Super Admin', koordinator_desa: 'Koordinator Desa', koordinator_daerah: 'Koordinator Daerah', viewer: 'Viewer', astrida: 'Astrida' };

export default function KelolaUserClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [desa, setDesa] = useState<Desa[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'koordinator_desa', desa_id: '' });

  const load = async () => {
    const [u, d] = await Promise.all([fetch('/api/absensi/users').then(r => r.json()), fetch('/api/absensi/desa').then(r => r.json())]);
    setUsers(u.data || []);
    setDesa(d.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, desa_id: form.desa_id ? Number(form.desa_id) : null };
    if (editing) {
      const res = await fetch('/api/absensi/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...body }) });
      if (res.ok) { toast.success('User diperbarui'); } else { toast.error('Gagal memperbarui'); }
    } else {
      const res = await fetch('/api/absensi/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { toast.success('User ditambahkan'); } else { toast.error('Gagal menambahkan'); }
    }
    setShowForm(false); setEditing(null); setForm({ username: '', password: '', full_name: '', role: 'koordinator_desa', desa_id: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus user ini?')) return;
    await fetch('/api/absensi/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('User dihapus'); load();
  };

  const handleEdit = (u: User) => {
    setEditing(u);
    setForm({ username: u.username, password: '', full_name: u.full_name, role: u.role, desa_id: u.desa_id?.toString() || '' });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
        <button onClick={() => { setEditing(null); setForm({ username: '', password: '', full_name: '', role: 'koordinator_desa', desa_id: '' }); setShowForm(true); }}
          className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">+ Tambah User</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit User' : 'Tambah User'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['username', 'full_name'].map(f => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{f.replace('_', ' ')}</label>
                <input value={(form as any)[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" required={f !== 'password'} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password {editing && '(kosongkan jika tidak diubah)'}</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm" required={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desa (opsional)</label>
              <select value={form.desa_id} onChange={e => setForm(p => ({ ...p, desa_id: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">-- Tidak ada --</option>
                {desa.map((d: Desa) => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg text-sm">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Nama', 'Username', 'Role', 'Desa', 'Aksi'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u: User) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{u.username}</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{ROLE_LABELS[u.role]}</span></td>
                <td className="px-4 py-3 text-gray-500">{u.nama_desa || '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada user</p>}
      </div>
    </div>
  );
}
