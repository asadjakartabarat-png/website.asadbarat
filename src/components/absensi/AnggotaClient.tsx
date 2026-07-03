'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Upload, X, Phone } from 'lucide-react';

interface Desa { id: number; nama_desa: string; }
interface Kelompok { id: number; desa_id: number; nama_kelompok: string; nama_desa?: string; }
interface Anggota {
  id: number; nama: string; desa_id: number | null; kelompok_id: number | null;
  jenis_kelamin: string | null; status: string | null; no_hp: string | null; aktif: number;
  nama_desa: string | null; nama_kelompok: string | null;
}

const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
const STATUS_OPTS = ['SB', 'SM', 'Pelatih'];

const emptyForm = { nama: '', desa_id: '', kelompok_id: '', jenis_kelamin: '', status: '', no_hp: '' };

export default function AnggotaClient() {
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [desa, setDesa] = useState<Desa[]>([]);
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDesa, setFilterDesa] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Anggota | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [a, d, k] = await Promise.all([
      fetch('/api/absensi/anggota').then((r) => r.json()),
      fetch('/api/absensi/desa').then((r) => r.json()),
      fetch('/api/absensi/kelompok').then((r) => r.json()),
    ]);
    setAnggota(a.data || []);
    setDesa(d.data || []);
    setKelompok(k.data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const kelompokByDesa = useMemo(
    () => kelompok.filter((k) => String(k.desa_id) === String(form.desa_id)),
    [kelompok, form.desa_id]
  );

  const filtered = useMemo(() => {
    return anggota.filter((a) => {
      if (filterDesa && String(a.desa_id) !== filterDesa) return false;
      if (search && !a.nama.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [anggota, search, filterDesa]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openEdit = (a: Anggota) => {
    setEditing(a);
    setForm({
      nama: a.nama,
      desa_id: a.desa_id ? String(a.desa_id) : '',
      kelompok_id: a.kelompok_id ? String(a.kelompok_id) : '',
      jenis_kelamin: a.jenis_kelamin || '',
      status: a.status || '',
      no_hp: a.no_hp || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim()) { toast.error('Nama wajib diisi'); return; }
    const payload: Record<string, unknown> = {
      nama: form.nama.trim(),
      desa_id: form.desa_id || null,
      kelompok_id: form.kelompok_id || null,
      jenis_kelamin: form.jenis_kelamin || null,
      status: form.status || null,
      no_hp: form.no_hp || null,
    };
    if (editing) payload.id = editing.id;
    const res = await fetch('/api/absensi/anggota', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { toast.success(editing ? 'Anggota diperbarui' : 'Anggota ditambahkan'); setShowForm(false); load(); }
    else toast.error('Gagal menyimpan');
  };

  const remove = async (a: Anggota) => {
    if (!confirm(`Hapus anggota "${a.nama}"?`)) return;
    const res = await fetch('/api/absensi/anggota', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id }),
    });
    if (res.ok) { toast.success('Anggota dihapus'); load(); } else toast.error('Gagal menghapus');
  };

  const parseImport = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const rows: Array<{ nama: string; desa?: string; kelompok?: string; jenis_kelamin?: string; status?: string; no_hp?: string }> = [];
    for (const line of lines) {
      const parts = line.split(/\t|;|,/).map((p) => p.trim());
      const head = parts[0]?.toLowerCase();
      if (head === 'nama') continue; // lewati baris header
      if (!parts[0]) continue;
      rows.push({ nama: parts[0], desa: parts[1] || '', kelompok: parts[2] || '', jenis_kelamin: parts[3] || '', status: parts[4] || '', no_hp: parts[5] || '' });
    }
    return rows;
  };

  const doImport = async () => {
    const rows = parseImport(importText);
    if (rows.length === 0) { toast.error('Tidak ada data terbaca'); return; }
    setImporting(true);
    const res = await fetch('/api/absensi/anggota', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }),
    });
    setImporting(false);
    if (res.ok) {
      const j = await res.json();
      toast.success(`${j.inserted} anggota ditambahkan`);
      setShowImport(false); setImportText(''); load();
    } else toast.error('Gagal import');
  };

  const previewCount = useMemo(() => parseImport(importText).length, [importText]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Anggota</h1>
          <p className="text-sm text-gray-500">{anggota.length} anggota terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 border border-green-700 text-green-700 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-green-50 min-h-[44px]">
            <Upload className="h-4 w-4" /> Import
          </button>
          <button type="button" onClick={openCreate}
            className="flex items-center gap-1.5 bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px]">
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editing ? 'Edit Anggota' : 'Tambah Anggota'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
              <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
              <select value={form.desa_id} onChange={(e) => setForm((p) => ({ ...p, desa_id: e.target.value, kelompok_id: '' }))} className={inputCls}>
                <option value="">- Pilih Desa -</option>
                {desa.map((d) => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok</label>
              <select value={form.kelompok_id} onChange={(e) => setForm((p) => ({ ...p, kelompok_id: e.target.value }))} className={inputCls} disabled={!form.desa_id}>
                <option value="">- Pilih Kelompok -</option>
                {kelompokByDesa.map((k) => <option key={k.id} value={k.id}>{k.nama_kelompok}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select value={form.jenis_kelamin} onChange={(e) => setForm((p) => ({ ...p, jenis_kelamin: e.target.value }))} className={inputCls}>
                <option value="">-</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={inputCls}>
                <option value="">-</option>
                {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
              <input value={form.no_hp} onChange={(e) => setForm((p) => ({ ...p, no_hp: e.target.value }))} className={inputCls} inputMode="tel" placeholder="08xxxxxxxxxx" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium min-h-[44px] hover:bg-green-800">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama..." className={inputCls + ' pl-9'} />
        </div>
        <select value={filterDesa} onChange={(e) => setFilterDesa(e.target.value)} className={inputCls + ' sm:w-56'}>
          <option value="">Semua Desa</option>
          {desa.map((d) => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
        </select>
      </div>

      {/* Daftar */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Memuat...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          Belum ada anggota. Klik <span className="font-medium">Tambah</span> atau <span className="font-medium">Import</span>.
        </div>
      ) : (
        <>
          {/* Kartu (mobile) */}
          <div className="grid grid-cols-1 sm:hidden gap-2">
            {filtered.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{a.nama}</p>
                    <p className="text-sm text-gray-500">{a.nama_desa || '-'}{a.nama_kelompok ? ' · ' + a.nama_kelompok : ''}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {a.jenis_kelamin && <span className="text-xs bg-gray-100 rounded px-1.5 py-0.5">{a.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>}
                      {a.status && <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">{a.status}</span>}
                      {a.no_hp && <span className="text-xs text-gray-500 inline-flex items-center gap-0.5"><Phone className="h-3 w-3" />{a.no_hp}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(a)} className="p-2 text-gray-500 hover:text-green-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(a)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabel (desktop) */}
          <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Desa</th>
                  <th className="px-4 py-3 font-medium">Kelompok</th>
                  <th className="px-4 py-3 font-medium">L/P</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">No. HP</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{a.nama_desa || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.nama_kelompok || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.jenis_kelamin || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.status || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.no_hp || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-gray-500 hover:text-green-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => remove(a)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Import */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Import Anggota</h2>
              <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Salin dari Excel/Sheets lalu tempel di bawah. Satu baris per anggota, kolom dipisah <b>Tab</b>, koma, atau titik koma:
            </p>
            <code className="block text-xs bg-gray-100 rounded p-2 mb-3 whitespace-pre-wrap">Nama, Desa, Kelompok, L/P, Status, No HP{'\n'}Budi, Cengkareng, Kelompok A, L, SB, 0812xxxx</code>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={8}
              className={inputCls + ' font-mono'} placeholder="Tempel data di sini..." />
            <p className="text-sm text-gray-500 mt-1">{previewCount} baris terbaca. Desa/kelompok baru otomatis dibuat.</p>
            <div className="flex gap-3 mt-4">
              <button onClick={doImport} disabled={importing || previewCount === 0}
                className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium min-h-[44px] hover:bg-green-800 disabled:opacity-50">
                {importing ? 'Mengimpor...' : `Import ${previewCount} Anggota`}
              </button>
              <button onClick={() => setShowImport(false)} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
