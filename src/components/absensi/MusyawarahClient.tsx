'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users, Calendar, MapPin, X } from 'lucide-react';

interface Peserta { nama: string; fungsi: string; }
interface Musyawarah {
  id: number;
  judul: string;
  tanggal: string;
  tempat: string | null;
  catatan: string | null;
  peserta_count?: number;
  created_at?: string;
}
interface MusyawarahDetail extends Musyawarah { peserta: Peserta[]; }

const inputCls = 'w-full border rounded-lg px-3 py-3 text-base sm:text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-green-500';

const emptyForm = { judul: '', tanggal: '', tempat: '', catatan: '' };

function formatTanggal(t: string) {
  if (!t) return '-';
  const d = new Date(t.length <= 10 ? t + 'T00:00:00' : t);
  if (isNaN(d.getTime())) return t;
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MusyawarahClient() {
  const [list, setList] = useState<Musyawarah[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [peserta, setPeserta] = useState<Peserta[]>([{ nama: '', fungsi: '' }]);
  const [detail, setDetail] = useState<MusyawarahDetail | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/absensi/musyawarah').then(r => r.json());
    setList(res.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setPeserta([{ nama: '', fungsi: '' }]);
    setEditingId(null);
  };

  const openCreate = () => { resetForm(); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const openEdit = async (id: number) => {
    const res = await fetch(`/api/absensi/musyawarah?id=${id}`).then(r => r.json());
    const d: MusyawarahDetail = res.data;
    if (!d) { toast.error('Data tidak ditemukan'); return; }
    setEditingId(id);
    setForm({ judul: d.judul, tanggal: (d.tanggal || '').slice(0, 10), tempat: d.tempat || '', catatan: d.catatan || '' });
    setPeserta(d.peserta && d.peserta.length ? d.peserta : [{ nama: '', fungsi: '' }]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDetail = async (id: number) => {
    const res = await fetch(`/api/absensi/musyawarah?id=${id}`).then(r => r.json());
    if (!res.data) { toast.error('Data tidak ditemukan'); return; }
    setDetail(res.data);
  };

  const addPeserta = () => setPeserta(p => [...p, { nama: '', fungsi: '' }]);
  const removePeserta = (i: number) => setPeserta(p => p.filter((_, idx) => idx !== i));
  const updatePeserta = (i: number, key: keyof Peserta, val: string) =>
    setPeserta(p => p.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanPeserta = peserta.filter(p => p.nama.trim());
    const body = { ...form, peserta: cleanPeserta };
    const method = editingId ? 'PUT' : 'POST';
    const payload = editingId ? { id: editingId, ...body } : body;
    const res = await fetch('/api/absensi/musyawarah', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) { toast.success(editingId ? 'Notulensi diperbarui' : 'Notulensi disimpan'); }
    else { toast.error('Gagal menyimpan'); return; }
    setShowForm(false); resetForm(); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus notulensi ini beserta daftar pesertanya?')) return;
    await fetch('/api/absensi/musyawarah', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    toast.success('Notulensi dihapus'); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notulensi Musyawarah</h1>
          <p className="text-sm text-gray-500">Catatan hasil musyawarah &amp; daftar peserta yang hadir</p>
        </div>
        <button type="button" onClick={openCreate}
          className="bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px] flex items-center gap-2">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Tambah Notulensi</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit Notulensi' : 'Tambah Notulensi'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Musyawarah</label>
                <input value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} className={inputCls} placeholder="Contoh: Musyawarah Persiapan Penderesan" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input type="date" value={form.tanggal} onChange={e => setForm(p => ({ ...p, tanggal: e.target.value }))} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input value={form.tempat} onChange={e => setForm(p => ({ ...p, tempat: e.target.value }))} className={inputCls} placeholder="Contoh: GSG Padepokan" />
              </div>
            </div>

            {/* Peserta hadir */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Peserta Hadir</label>
                <button type="button" onClick={addPeserta} className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline">
                  <Plus className="h-4 w-4" /> Tambah Baris
                </button>
              </div>
              <div className="space-y-2">
                {peserta.map((row, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2">
                    <input value={row.nama} onChange={e => updatePeserta(i, 'nama', e.target.value)} placeholder="Nama" className={inputCls + ' flex-1'} />
                    <div className="flex gap-2">
                      <input value={row.fungsi} onChange={e => updatePeserta(i, 'fungsi', e.target.value)} placeholder="Fungsi / Jabatan" className={inputCls + ' flex-1'} />
                      <button type="button" onClick={() => removePeserta(i)} disabled={peserta.length === 1}
                        className="border border-red-300 text-red-600 rounded-lg px-3 min-h-[44px] disabled:opacity-40 shrink-0" aria-label="Hapus baris">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Isi / Catatan Musyawarah</label>
              <textarea value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))}
                rows={8} className="w-full border rounded-lg px-3 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Tuliskan pokok bahasan, keputusan, dan hasil musyawarah..." />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium min-h-[44px] hover:bg-green-800 disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Memuat...</p>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">Belum ada notulensi musyawarah</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map(m => (
            <div key={m.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{m.judul}</h3>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatTanggal(m.tanggal)}</p>
                  {m.tempat && <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {m.tempat}</p>}
                  <p className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {m.peserta_count ?? 0} peserta hadir</p>
                </div>
                {m.catatan && <p className="mt-2 text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">{m.catatan}</p>}
              </div>
              <div className="flex gap-2 pt-3 mt-3 border-t">
                <button type="button" onClick={() => openDetail(m.id)} className="flex-1 border border-green-600 text-green-700 py-2 rounded-lg text-sm min-h-[40px]">Detail</button>
                <button type="button" onClick={() => openEdit(m.id)} className="flex-1 border border-blue-500 text-blue-600 py-2 rounded-lg text-sm min-h-[40px]">Edit</button>
                <button type="button" onClick={() => handleDelete(m.id)} className="border border-red-500 text-red-600 px-3 rounded-lg text-sm min-h-[40px]" aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDetail(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between p-5 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{detail.judul}</h2>
                <p className="text-sm text-gray-500">{formatTanggal(detail.tanggal)}{detail.tempat ? ` · ${detail.tempat}` : ''}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Peserta Hadir ({detail.peserta?.length || 0})</h3>
                {detail.peserta && detail.peserta.length ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left font-medium text-gray-600">Nama</th><th className="px-3 py-2 text-left font-medium text-gray-600">Fungsi / Jabatan</th></tr></thead>
                      <tbody className="divide-y">
                        {detail.peserta.map((p, i) => (
                          <tr key={i}><td className="px-3 py-2">{p.nama}</td><td className="px-3 py-2 text-gray-600">{p.fungsi || '-'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : <p className="text-sm text-gray-400">Tidak ada peserta tercatat</p>}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Isi / Catatan</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.catatan || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
