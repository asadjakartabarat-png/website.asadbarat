'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X, ArrowLeft, CalendarDays, MapPin, Users, UserPlus, BarChart3, Save } from 'lucide-react';

interface Desa { id: number; nama_desa: string; }
interface Anggota { id: number; nama: string; desa_id: number | null; nama_desa: string | null; nama_kelompok: string | null; }
interface Kegiatan {
  id: number; nama: string; jenis: string | null; tanggal: string; tempat: string | null; keterangan: string | null;
  hadir_count?: number; total_count?: number;
}
interface Kehadiran { anggota_id: number | null; nama: string; nama_desa: string | null; nama_kelompok: string | null; status: string; is_tamu: number; }
interface RekapRow { nama_desa: string; hadir: number; izin: number; sakit: number; alfa: number; total: number; }
interface Tamu { nama: string; desa: string; kelompok: string; status: string; }

const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
const JENIS_OPTS = ['Musyawarah', 'Penderesan', 'Tashih Sabuk Biru', 'Tatap Muka', 'Pembekalan', 'Latihan Gabungan', 'Lainnya'];
const STATUSES = [
  { key: 'hadir', label: 'H', full: 'Hadir', on: 'bg-green-600 text-white', off: 'text-green-700' },
  { key: 'izin', label: 'I', full: 'Izin', on: 'bg-yellow-500 text-white', off: 'text-yellow-600' },
  { key: 'sakit', label: 'S', full: 'Sakit', on: 'bg-orange-500 text-white', off: 'text-orange-600' },
  { key: 'alfa', label: 'A', full: 'Alfa', on: 'bg-red-500 text-white', off: 'text-red-600' },
];

const emptyForm = { nama: '', jenis: '', tanggal: '', tempat: '', keterangan: '' };

function fmtDate(s: string) {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function KegiatanClient() {
  const [view, setView] = useState<'list' | 'absen'>('list');
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [desa, setDesa] = useState<Desa[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Kegiatan | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Absensi state
  const [active, setActive] = useState<Kegiatan | null>(null);
  const [anggota, setAnggota] = useState<Anggota[]>([]);
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});
  const [tamu, setTamu] = useState<Tamu[]>([]);
  const [rekap, setRekap] = useState<RekapRow[]>([]);
  const [absSearch, setAbsSearch] = useState('');
  const [absDesa, setAbsDesa] = useState('');
  const [tab, setTab] = useState<'absen' | 'rekap'>('absen');
  const [saving, setSaving] = useState(false);

  const loadList = async () => {
    setLoading(true);
    const [k, d] = await Promise.all([
      fetch('/api/absensi/kegiatan').then((r) => r.json()),
      fetch('/api/absensi/desa').then((r) => r.json()),
    ]);
    setKegiatan(k.data || []);
    setDesa(d.data || []);
    setLoading(false);
  };
  useEffect(() => { loadList(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openEdit = (k: Kegiatan) => {
    setEditing(k);
    setForm({ nama: k.nama, jenis: k.jenis || '', tanggal: (k.tanggal || '').slice(0, 10), tempat: k.tempat || '', keterangan: k.keterangan || '' });
    setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitKegiatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama.trim() || !form.tanggal) { toast.error('Nama & tanggal wajib diisi'); return; }
    const payload: Record<string, unknown> = { ...form };
    if (editing) payload.id = editing.id;
    const res = await fetch('/api/absensi/kegiatan', {
      method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { toast.success(editing ? 'Kegiatan diperbarui' : 'Kegiatan dibuat'); setShowForm(false); loadList(); }
    else toast.error('Gagal menyimpan');
  };

  const removeKegiatan = async (k: Kegiatan) => {
    if (!confirm(`Hapus kegiatan "${k.nama}" beserta data kehadirannya?`)) return;
    const res = await fetch('/api/absensi/kegiatan', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: k.id }) });
    if (res.ok) { toast.success('Kegiatan dihapus'); loadList(); } else toast.error('Gagal menghapus');
  };

  const openAbsen = async (k: Kegiatan) => {
    setActive(k); setView('absen'); setTab('absen'); setAbsSearch(''); setAbsDesa('');
    const [detail, ang] = await Promise.all([
      fetch(`/api/absensi/kegiatan?id=${k.id}`).then((r) => r.json()),
      fetch('/api/absensi/anggota').then((r) => r.json()),
    ]);
    setAnggota(ang.data || []);
    const d = detail.data || {};
    setRekap(d.rekap || []);
    const map: Record<number, string> = {};
    const tamuRows: Tamu[] = [];
    (d.kehadiran || []).forEach((h: Kehadiran) => {
      if (h.is_tamu || !h.anggota_id) tamuRows.push({ nama: h.nama, desa: h.nama_desa || '', kelompok: h.nama_kelompok || '', status: h.status });
      else map[h.anggota_id] = h.status;
    });
    setStatusMap(map);
    setTamu(tamuRows);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => { setView('list'); setActive(null); loadList(); };

  const setStatus = (anggotaId: number, status: string) => {
    setStatusMap((p) => ({ ...p, [anggotaId]: p[anggotaId] === status ? '' : status }));
  };

  const setAllVisible = (status: string) => {
    setStatusMap((p) => {
      const next = { ...p };
      absFiltered.forEach((a) => { next[a.id] = status; });
      return next;
    });
  };

  const absFiltered = useMemo(() => {
    return anggota.filter((a) => {
      if (absDesa && String(a.desa_id) !== absDesa) return false;
      if (absSearch && !a.nama.toLowerCase().includes(absSearch.toLowerCase())) return false;
      return true;
    });
  }, [anggota, absSearch, absDesa]);

  const hadirCount = useMemo(() => {
    let n = Object.values(statusMap).filter((s) => s === 'hadir').length;
    n += tamu.filter((t) => t.status === 'hadir').length;
    return n;
  }, [statusMap, tamu]);

  const totalTerisi = useMemo(() => {
    let n = Object.values(statusMap).filter((s) => s).length;
    n += tamu.filter((t) => t.nama.trim() && t.status).length;
    return n;
  }, [statusMap, tamu]);

  const addTamu = () => setTamu((p) => [...p, { nama: '', desa: '', kelompok: '', status: 'hadir' }]);
  const upTamu = (i: number, key: keyof Tamu, val: string) => setTamu((p) => p.map((t, idx) => (idx === i ? { ...t, [key]: val } : t)));
  const rmTamu = (i: number) => setTamu((p) => p.filter((_, idx) => idx !== i));

  const saveAbsen = async () => {
    if (!active) return;
    const records: Array<Record<string, unknown>> = [];
    anggota.forEach((a) => {
      const st = statusMap[a.id];
      if (st) records.push({ anggota_id: a.id, nama: a.nama, nama_desa: a.nama_desa, nama_kelompok: a.nama_kelompok, status: st, is_tamu: 0 });
    });
    tamu.forEach((t) => {
      if (t.nama.trim() && t.status) records.push({ anggota_id: null, nama: t.nama.trim(), nama_desa: t.desa || null, nama_kelompok: t.kelompok || null, status: t.status, is_tamu: 1 });
    });
    setSaving(true);
    const res = await fetch('/api/absensi/kegiatan/kehadiran', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kegiatan_id: active.id, records }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Kehadiran tersimpan');
      const detail = await fetch(`/api/absensi/kegiatan?id=${active.id}`).then((r) => r.json());
      setRekap((detail.data || {}).rekap || []);
    } else toast.error('Gagal menyimpan');
  };

  // ---------- Tampilan absensi ----------
  if (view === 'absen' && active) {
    return (
      <div className="space-y-4 pb-28">
        <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 bg-white/95 backdrop-blur border-b px-4 sm:px-6 lg:px-8 py-3">
          <button onClick={backToList} className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-1"><ArrowLeft className="h-4 w-4 mr-1" /> Kembali</button>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{active.nama}</h1>
              <p className="text-xs text-gray-500">{fmtDate(active.tanggal)}{active.tempat ? ' · ' + active.tempat : ''}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-green-700 leading-none">{hadirCount}</p>
              <p className="text-[11px] text-gray-500">hadir · {totalTerisi} terisi</p>
            </div>
          </div>
        </div>

        {/* Tab */}
        <div className="flex gap-2">
          {(['absen', 'rekap'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium min-h-[44px] ${tab === t ? 'bg-green-700 text-white' : 'bg-white border text-gray-600'}`}>
              {t === 'absen' ? <Users className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              {t === 'absen' ? 'Absen' : 'Rekap'}
            </button>
          ))}
        </div>

        {tab === 'absen' ? (
          <>
            {/* Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input value={absSearch} onChange={(e) => setAbsSearch(e.target.value)} placeholder="Cari nama..." className={inputCls + ' pl-9'} />
              </div>
              <select value={absDesa} onChange={(e) => setAbsDesa(e.target.value)} className={inputCls + ' sm:w-48'}>
                <option value="">Semua Desa</option>
                {desa.map((d) => <option key={d.id} value={d.id}>{d.nama_desa}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-gray-500 self-center">Tandai semua yang tampil:</span>
              {STATUSES.map((s) => (
                <button key={s.key} onClick={() => setAllVisible(s.key)} className="border rounded-full px-3 py-1 hover:bg-gray-50">{s.full}</button>
              ))}
              <button onClick={() => setAllVisible('')} className="border rounded-full px-3 py-1 hover:bg-gray-50 text-gray-500">Kosongkan</button>
            </div>

            {/* Daftar anggota */}
            {anggota.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                Belum ada data anggota. Tambahkan di menu <span className="font-medium">Data Anggota</span> dulu, atau pakai <span className="font-medium">Tambah Tamu</span> di bawah.
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow divide-y">
                {absFiltered.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">{a.nama}</p>
                      <p className="text-xs text-gray-500 truncate">{a.nama_desa || '-'}{a.nama_kelompok ? ' · ' + a.nama_kelompok : ''}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {STATUSES.map((s) => {
                        const on = statusMap[a.id] === s.key;
                        return (
                          <button key={s.key} onClick={() => setStatus(a.id, s.key)}
                            className={`w-9 h-9 rounded-lg text-sm font-bold border ${on ? s.on + ' border-transparent' : 'bg-white ' + s.off + ' border-gray-200'}`}>
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tamu */}
            <div className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-1.5"><UserPlus className="h-4 w-4" /> Peserta Tamu ({tamu.length})</h3>
                <button onClick={addTamu} className="text-green-700 text-sm font-medium flex items-center gap-1"><Plus className="h-4 w-4" /> Tambah</button>
              </div>
              {tamu.length === 0 ? (
                <p className="text-sm text-gray-400">Untuk peserta yang tidak ada di data anggota.</p>
              ) : (
                <div className="space-y-3">
                  {tamu.map((t, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input value={t.nama} onChange={(e) => upTamu(i, 'nama', e.target.value)} placeholder="Nama" className={inputCls} />
                        <button onClick={() => rmTamu(i)} className="p-2 text-gray-400 hover:text-red-600 shrink-0"><Trash2 className="h-5 w-5" /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={t.desa} onChange={(e) => upTamu(i, 'desa', e.target.value)} placeholder="Desa" className={inputCls} />
                        <input value={t.kelompok} onChange={(e) => upTamu(i, 'kelompok', e.target.value)} placeholder="Kelompok" className={inputCls} />
                      </div>
                      <div className="flex gap-1">
                        {STATUSES.map((s) => (
                          <button key={s.key} onClick={() => upTamu(i, 'status', s.key)}
                            className={`flex-1 h-9 rounded-lg text-xs font-bold border ${t.status === s.key ? s.on + ' border-transparent' : 'bg-white ' + s.off + ' border-gray-200'}`}>
                            {s.full}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          // Rekap
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            {rekap.length === 0 ? (
              <p className="p-8 text-center text-gray-500">Belum ada data tersimpan. Isi absen lalu simpan.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Desa</th>
                    <th className="px-3 py-3 font-medium text-center text-green-700">Hadir</th>
                    <th className="px-3 py-3 font-medium text-center text-yellow-600">Izin</th>
                    <th className="px-3 py-3 font-medium text-center text-orange-600">Sakit</th>
                    <th className="px-3 py-3 font-medium text-center text-red-600">Alfa</th>
                    <th className="px-3 py-3 font-medium text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rekap.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.nama_desa}</td>
                      <td className="px-3 py-3 text-center">{r.hadir}</td>
                      <td className="px-3 py-3 text-center">{r.izin}</td>
                      <td className="px-3 py-3 text-center">{r.sakit}</td>
                      <td className="px-3 py-3 text-center">{r.alfa}</td>
                      <td className="px-3 py-3 text-center font-semibold">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">Jumlah</td>
                    <td className="px-3 py-3 text-center">{rekap.reduce((s, r) => s + r.hadir, 0)}</td>
                    <td className="px-3 py-3 text-center">{rekap.reduce((s, r) => s + r.izin, 0)}</td>
                    <td className="px-3 py-3 text-center">{rekap.reduce((s, r) => s + r.sakit, 0)}</td>
                    <td className="px-3 py-3 text-center">{rekap.reduce((s, r) => s + r.alfa, 0)}</td>
                    <td className="px-3 py-3 text-center">{rekap.reduce((s, r) => s + r.total, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}

        {/* Tombol simpan melayang */}
        <div className="fixed bottom-0 left-0 right-0 lg:pl-64 z-30">
          <div className="m-3 sm:mx-6">
            <button onClick={saveAbsen} disabled={saving}
              className="w-full bg-green-700 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg flex items-center justify-center gap-2 hover:bg-green-800 disabled:opacity-60">
              <Save className="h-5 w-5" /> {saving ? 'Menyimpan...' : `Simpan Kehadiran (${totalTerisi})`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Tampilan daftar kegiatan ----------
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absensi Kegiatan</h1>
          <p className="text-sm text-gray-500">{kegiatan.length} kegiatan</p>
        </div>
        <button type="button" onClick={openCreate}
          className="flex items-center gap-1.5 bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px]">
          <Plus className="h-4 w-4" /> Kegiatan Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editing ? 'Edit Kegiatan' : 'Kegiatan Baru'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={submitKegiatan} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan <span className="text-red-500">*</span></label>
              <input value={form.nama} onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value }))} className={inputCls} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
              <select value={form.jenis} onChange={(e) => setForm((p) => ({ ...p, jenis: e.target.value }))} className={inputCls}>
                <option value="">- Pilih -</option>
                {JENIS_OPTS.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm((p) => ({ ...p, tanggal: e.target.value }))} className={inputCls} required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat</label>
              <input value={form.tempat} onChange={(e) => setForm((p) => ({ ...p, tempat: e.target.value }))} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <textarea value={form.keterangan} onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))} rows={2} className={inputCls} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 bg-green-700 text-white py-3 rounded-lg text-sm font-medium min-h-[44px] hover:bg-green-800">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-3 rounded-lg text-sm min-h-[44px]">Batal</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 py-10">Memuat...</p>
      ) : kegiatan.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">Belum ada kegiatan. Klik <span className="font-medium">Kegiatan Baru</span>.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {kegiatan.map((k) => (
            <div key={k.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {k.jenis && <span className="inline-block text-[11px] font-medium bg-green-100 text-green-700 rounded px-2 py-0.5 mb-1">{k.jenis}</span>}
                  <h3 className="font-semibold text-gray-900 leading-snug">{k.nama}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(k)} className="p-1.5 text-gray-400 hover:text-green-700"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => removeKegiatan(k)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {fmtDate(k.tanggal)}</p>
                {k.tempat && <p className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {k.tempat}</p>}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm"><span className="font-bold text-green-700">{k.hadir_count ?? 0}</span><span className="text-gray-400"> hadir / {k.total_count ?? 0} tercatat</span></span>
              </div>
              <button onClick={() => openAbsen(k)}
                className="mt-3 w-full bg-green-50 text-green-700 border border-green-200 py-2.5 rounded-lg text-sm font-medium hover:bg-green-100 min-h-[44px] flex items-center justify-center gap-1.5">
                <Users className="h-4 w-4" /> Kelola Kehadiran
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
