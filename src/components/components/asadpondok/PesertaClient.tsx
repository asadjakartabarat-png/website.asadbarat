'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Peserta { id: number; nama: string; kelas: string; created_at: string; }

export default function PesertaClient() {
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Peserta | null>(null);
  const [form, setForm] = useState({ nama: '', kelas: 'PUTRA' });
  const [filterKelas, setFilterKelas] = useState('');

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/asadpondok/peserta');
    const data = await res.json();
    setPeserta(data.peserta || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm({ nama: '', kelas: 'PUTRA' }); setShowForm(true); };
  const openEdit = (p: Peserta) => { setEditItem(p); setForm({ nama: p.nama, kelas: p.kelas }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editItem
      ? await fetch(`/api/asadpondok/peserta/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : await fetch('/api/asadpondok/peserta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(editItem ? 'Peserta diperbarui' : 'Peserta ditambahkan'); setShowForm(false); load(); }
    else { const d = await res.json(); toast.error(d.error || 'Gagal'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus peserta ini?')) return;
    await fetch(`/api/asadpondok/peserta/${id}`, { method: 'DELETE' });
    toast.success('Peserta dihapus'); load();
  };

  const filtered = filterKelas ? peserta.filter(p => p.kelas === filterKelas) : peserta;
  const putraCount = peserta.filter(p => p.kelas === 'PUTRA').length;
  const putriCount = peserta.filter(p => p.kelas === 'PUTRI').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Peserta Tes</h2>
        <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">+ Tambah Peserta</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{putraCount}</div>
          <div className="text-sm text-blue-600">Peserta PUTRA</div>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-pink-700">{putriCount}</div>
          <div className="text-sm text-pink-600">Peserta PUTRI</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'PUTRA', 'PUTRI'].map(k => (
          <button key={k} onClick={() => setFilterKelas(k)}
            className={`px-3 py-1 rounded text-sm ${filterKelas === k ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
            {k || 'Semua'}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">{editItem ? 'Edit Peserta' : 'Tambah Peserta'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Peserta</label>
                <input value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kelas</label>
                <select value={form.kelas} onChange={e => setForm(f => ({ ...f, kelas: e.target.value }))} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="PUTRA">PUTRA</option>
                  <option value="PUTRI">PUTRI</option>
                </select>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Kelas</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.nama}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {p.kelas}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada peserta</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
