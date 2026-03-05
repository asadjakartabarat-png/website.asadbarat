'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Teori { id: number; nama_teori: string; urutan: number; created_at: string; }

export default function FormTeoriClient() {
  const [teori, setTeori] = useState<Teori[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Teori | null>(null);
  const [form, setForm] = useState({ nama_teori: '', urutan: 1 });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/asadpondok/teori');
    const data = await res.json();
    setTeori(data.teori || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ nama_teori: '', urutan: (teori.length > 0 ? Math.max(...teori.map(t => t.urutan)) + 1 : 1) });
    setShowForm(true);
  };
  const openEdit = (t: Teori) => { setEditItem(t); setForm({ nama_teori: t.nama_teori, urutan: t.urutan }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editItem
      ? await fetch(`/api/asadpondok/teori/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch('/api/asadpondok/teori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(editItem ? 'Teori diperbarui' : 'Teori ditambahkan'); setShowForm(false); load(); }
    else { const d = await res.json(); toast.error(d.error || 'Gagal'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus item teori ini?')) return;
    await fetch(`/api/asadpondok/teori/${id}`, { method: 'DELETE' });
    toast.success('Teori dihapus'); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Form Penilaian</h2>
          <p className="text-sm text-gray-500 mt-0.5">Master daftar soal teori yang akan dinilai</p>
        </div>
        <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">+ Tambah Teori</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">{editItem ? 'Edit Teori' : 'Tambah Teori'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Teori</label>
                <input value={form.nama_teori} onChange={e => setForm(f => ({ ...f, nama_teori: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" required placeholder="cth: Sejarah Pencak Silat" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urutan</label>
                <input type="number" min={1} value={form.urutan} onChange={e => setForm(f => ({ ...f, urutan: Number(e.target.value) }))} className="w-full border rounded px-3 py-2 text-sm" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded text-sm">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded text-sm">Batal</button>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Urutan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Teori</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teori.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono">{t.urutan}</td>
                  <td className="px-4 py-3 font-medium">{t.nama_teori}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(t)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {teori.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Belum ada item teori</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
