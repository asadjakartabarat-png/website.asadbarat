'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface User { id: number; username: string; full_name: string; role: string; desa_id: number | null; nama_desa?: string; is_active: number; }
interface Desa { id: number; nama_desa: string; }

const ROLES = ['super_admin', 'koordinator_desa', 'koordinator_daerah', 'viewer', 'astrida'];
const ROLE_LABELS: Record<string, string> = { super_admin: 'Super Admin', koordinator_desa: 'Koordinator Desa', koordinator_daerah: 'Koordinator Daerah', viewer: 'Viewer', astrida: 'Astrida' };

const inputCls = 'w-full border rounded-lg px-3 py-3 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-500';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
        <button type="button"
          onClick={() => { setEditing(null); setForm({ username: '', password: '', full_name: '', role: 'koordinator_desa', desa_id: '' }); setShowForm(true); }}
          className="bg-green-700 text-white px-4 py-3 rounded-lg text-sm hover:bg-green-800 min-h-[44px]">
          + Tambah User
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="font-semibold mb-4">{editing ? 'Edit User' : 'Tambah User'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {editing && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
              </label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputCls} required={!editing} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className={inputCls}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Desa (opsional)</label>
              <select value={form.desa_id} onChange={e => setForm(p => ({ ...p, desa_id: e.target.value }))} className={inputCls}>
                <option value="">-- Tidak ada --</option>
                {desa.map((d: Desa) => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px]">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile: card per user */}
      <div className="md:hidden space-y-3">
        {users.map((u: User) => (
          <div key={u.id} className="bg-white rounded-xl shadow p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{u.full_name}</p>
                <p className="text-xs text-gray-500 break-all">{u.username}</p>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs shrink-0 ml-2">{ROLE_LABELS[u.role]}</span>
            </div>
            {u.nama_desa && <p className="text-sm text-gray-500">Desa: {u.nama_desa}</p>}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => handleEdit(u)}
                className="flex-1 border border-blue-500 text-blue-600 py-2 rounded-lg text-sm font-medium min-h-[44px]">
                Edit
              </button>
              <button type="button" onClick={() => handleDelete(u.id)}
                className="flex-1 border border-red-500 text-red-600 py-2 rounded-lg text-sm font-medium min-h-[44px]">
                Hapus
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada user</p>}
      </div>

      {/* Desktop: tabel */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Nama', 'Username', 'Role', 'Desa', 'Aksi'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u: User) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">{u.username}</td>
                <td className="px-4 py-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{ROLE_LABELS[u.role]}</span></td>
                <td className="px-4 py-3 text-gray-500">{u.nama_desa || '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button type="button" onClick={() => handleEdit(u)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button type="button" onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
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
