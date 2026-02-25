'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Desa { id: number; nama_desa: string; }
interface Kelompok { id: number; desa_id: number; nama_kelompok: string; target_putra: number; target_putri: number; nama_desa: string; }

const inputCls = 'w-full border rounded-lg px-3 py-3 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-500';

export default function MasterDataClient() {
  const [desa, setDesa] = useState<Desa[]>([]);
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  const [tab, setTab] = useState<'desa' | 'kelompok'>('desa');
  const [showForm, setShowForm] = useState(false);
  const [editingDesa, setEditingDesa] = useState<Desa | null>(null);
  const [editingKelompok, setEditingKelompok] = useState<Kelompok | null>(null);
  const [desaForm, setDesaForm] = useState('');
  const [kelompokForm, setKelompokForm] = useState({ desa_id: '', nama_kelompok: '', target_putra: 25, target_putri: 25 });

  const load = async () => {
    const [d, k] = await Promise.all([fetch('/api/absensi/desa').then(r => r.json()), fetch('/api/absensi/kelompok').then(r => r.json())]);
    setDesa(d.data || []); setKelompok(k.data || []);
  };
  useEffect(() => { load(); }, []);

  const handleDesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingDesa ? 'PUT' : 'POST';
    const body = editingDesa ? { id: editingDesa.id, nama_desa: desaForm } : { nama_desa: desaForm };
    const res = await fetch('/api/absensi/desa', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { toast.success(editingDesa ? 'Desa diperbarui' : 'Desa ditambahkan'); } else { toast.error('Gagal'); }
    setShowForm(false); setEditingDesa(null); setDesaForm(''); load();
  };

  const handleKelompokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...kelompokForm, desa_id: Number(kelompokForm.desa_id), target_putra: Number(kelompokForm.target_putra), target_putri: Number(kelompokForm.target_putri) };
    const method = editingKelompok ? 'PUT' : 'POST';
    const payload = editingKelompok ? { id: editingKelompok.id, ...body } : body;
    const res = await fetch('/api/absensi/kelompok', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(editingKelompok ? 'Kelompok diperbarui' : 'Kelompok ditambahkan'); } else { toast.error('Gagal'); }
    setShowForm(false); setEditingKelompok(null); setKelompokForm({ desa_id: '', nama_kelompok: '', target_putra: 25, target_putri: 25 }); load();
  };

  const handleDeleteDesa = async (id: number) => {
    if (!confirm('Hapus desa ini? Semua kelompok di desa ini juga akan terhapus.')) return;
    await fetch('/api/absensi/desa', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Desa dihapus'); load();
  };

  const handleDeleteKelompok = async (id: number) => {
    if (!confirm('Hapus kelompok ini?')) return;
    await fetch('/api/absensi/kelompok', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Kelompok dihapus'); load();
  };

  const handleEditDesa = (d: Desa) => {
    setEditingDesa(d); setDesaForm(d.nama_desa); setShowForm(true); setTab('desa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditKelompok = (k: Kelompok) => {
    setEditingKelompok(k);
    setKelompokForm({ desa_id: k.desa_id.toString(), nama_kelompok: k.nama_kelompok, target_putra: k.target_putra, target_putri: k.target_putri });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
        <button type="button"
          onClick={() => { setShowForm(true); setEditingDesa(null); setEditingKelompok(null); }}
          className="bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px]">
          + Tambah {tab === 'desa' ? 'Desa' : 'Kelompok'}
        </button>
      </div>

      {/* Tab */}
      <div className="flex gap-2">
        {(['desa', 'kelompok'] as const).map(t => (
          <button key={t} type="button" onClick={() => { setTab(t); setShowForm(false); }}
            className={`flex-1 sm:flex-none px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] ${tab === t ? 'bg-green-700 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {t === 'desa' ? 'Desa' : 'Kelompok'}
          </button>
        ))}
      </div>

      {/* Form Desa */}
      {showForm && tab === 'desa' && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="font-semibold mb-4">{editingDesa ? 'Edit Desa' : 'Tambah Desa'}</h2>
          <form onSubmit={handleDesaSubmit} className="space-y-3">
            <input value={desaForm} onChange={e => setDesaForm(e.target.value)} placeholder="Nama desa"
              className={inputCls} required />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium min-h-[44px]">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Form Kelompok */}
      {showForm && tab === 'kelompok' && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="font-semibold mb-4">{editingKelompok ? 'Edit Kelompok' : 'Tambah Kelompok'}</h2>
          <form onSubmit={handleKelompokSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
              <select value={kelompokForm.desa_id} onChange={e => setKelompokForm(p => ({ ...p, desa_id: e.target.value }))} className={inputCls} required>
                <option value="">Pilih Desa</option>
                {desa.map(d => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelompok</label>
              <input value={kelompokForm.nama_kelompok} onChange={e => setKelompokForm(p => ({ ...p, nama_kelompok: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Putra</label>
              <input type="number" inputMode="numeric" min="0" value={kelompokForm.target_putra}
                onChange={e => setKelompokForm(p => ({ ...p, target_putra: Number(e.target.value) }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Putri</label>
              <input type="number" inputMode="numeric" min="0" value={kelompokForm.target_putri}
                onChange={e => setKelompokForm(p => ({ ...p, target_putri: Number(e.target.value) }))} className={inputCls} required />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium min-h-[44px]">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Desa */}
      {tab === 'desa' && (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {desa.map(d => (
              <div key={d.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <span className="font-medium text-gray-900">{d.nama_desa}</span>
                <div className="flex gap-2 ml-4">
                  <button type="button" onClick={() => handleEditDesa(d)}
                    className="border border-blue-500 text-blue-600 px-4 py-2 rounded-lg text-sm min-h-[44px]">Edit</button>
                  <button type="button" onClick={() => handleDeleteDesa(d.id)}
                    className="border border-red-500 text-red-600 px-4 py-2 rounded-lg text-sm min-h-[44px]">Hapus</button>
                </div>
              </div>
            ))}
            {desa.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada desa</p>}
          </div>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left font-medium text-gray-600">Nama Desa</th><th className="px-4 py-3 text-left font-medium text-gray-600">Aksi</th></tr></thead>
              <tbody className="divide-y">
                {desa.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{d.nama_desa}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button type="button" onClick={() => handleEditDesa(d)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button type="button" onClick={() => handleDeleteDesa(d.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {desa.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada desa</p>}
          </div>
        </>
      )}

      {/* Tab Kelompok */}
      {tab === 'kelompok' && (
        <>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {kelompok.map(k => (
              <div key={k.id} className="bg-white rounded-xl shadow p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{k.nama_kelompok}</p>
                    <p className="text-xs text-gray-500">{k.nama_desa}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 ml-2 shrink-0">
                    <p>Putra: {k.target_putra}</p>
                    <p>Putri: {k.target_putri}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => handleEditKelompok(k)}
                    className="flex-1 border border-blue-500 text-blue-600 py-2 rounded-lg text-sm min-h-[44px]">Edit</button>
                  <button type="button" onClick={() => handleDeleteKelompok(k.id)}
                    className="flex-1 border border-red-500 text-red-600 py-2 rounded-lg text-sm min-h-[44px]">Hapus</button>
                </div>
              </div>
            ))}
            {kelompok.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada kelompok</p>}
          </div>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Desa', 'Kelompok', 'Target Putra', 'Target Putri', 'Aksi'].map(h => <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {kelompok.map(k => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{k.nama_desa}</td>
                    <td className="px-4 py-3">{k.nama_kelompok}</td>
                    <td className="px-4 py-3 text-center">{k.target_putra}</td>
                    <td className="px-4 py-3 text-center">{k.target_putri}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button type="button" onClick={() => handleEditKelompok(k)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button type="button" onClick={() => handleDeleteKelompok(k.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {kelompok.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada kelompok</p>}
          </div>
        </>
      )}
    </div>
  );
}
