'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const JURUS_LIST = ['Jurus 1A','Jurus 1B','Jurus 2A','Jurus 2B','Jurus 3A','Jurus 3B','Jurus 4A','Jurus 4B','Jurus 5','Jurus 6','Jurus 7'];

interface Peserta { id: number; nama: string; kelas: string; }
interface Teori { id: number; nama_teori: string; urutan: number; }
type EntryVal = { id: number; nilai: string; created_at: string } | null;
type NilaiMap = Record<number, {
  jurus: Record<string, EntryVal>;
  teori: Record<number, EntryVal>;
  savingJurus: boolean;
  savingTeori: boolean;
}>;
// unlockMap[peserta_id][penguji_id] = unlocked_until ISO string
type UnlockMap = Record<number, Record<number, string>>;

interface Penguji { id: number; username: string; full_name: string; role: string; }
interface Props { user: { id: number; role: string; username?: string }; }

function isEditable(createdAt: string, unlockUntil?: string) {
  if (unlockUntil && new Date(unlockUntil).getTime() > Date.now()) return true;
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
}

export default function InputNilaiClient({ user }: Props) {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [teoriList, setTeoriList] = useState<Teori[]>([]);
  const [nilaiMap, setNilaiMap] = useState<NilaiMap>({});
  const [unlockMap, setUnlockMap] = useState<UnlockMap>({});
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [pengujiList, setPengujiList] = useState<Penguji[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const debounceJurus = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const debounceTeori = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const nilaiMapRef = useRef<NilaiMap>({});
  const unlockMapRef = useRef<UnlockMap>({});

  useEffect(() => { nilaiMapRef.current = nilaiMap; }, [nilaiMap]);
  useEffect(() => { unlockMapRef.current = unlockMap; }, [unlockMap]);

  const kelas = user.role === 'penguji_sm_putra' ? 'PUTRA' : user.role === 'penguji_sm_putri' ? 'PUTRI' : undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/asadpondok/peserta${kelas ? `?kelas=${kelas}` : ''}`),
        fetch('/api/asadpondok/teori'),
      ]);
      const [pData, tData] = await Promise.all([pRes.json(), tRes.json()]);
      const peserta: Peserta[] = pData.peserta || [];
      const teori: Teori[] = tData.teori || [];
      setPesertaList(peserta);
      setTeoriList(teori);

      const allResults = await Promise.all(peserta.map(p => Promise.all([
        fetch(`/api/asadpondok/nilai-jurus?peserta_id=${p.id}&penguji_id=${user.id}`).then(r => r.json()),
        fetch(`/api/asadpondok/nilai-teori?peserta_id=${p.id}&penguji_id=${user.id}`).then(r => r.json()),
      ])));

      const jurusAll: any[] = [];
      const teoriAll: any[] = [];
      allResults.forEach(([jData, ntData], idx) => {
        (jData.nilai || []).forEach((n: any) => jurusAll.push({ ...n, peserta_id: peserta[idx].id }));
        (ntData.nilai || []).forEach((n: any) => teoriAll.push({ ...n, peserta_id: peserta[idx].id }));
      });

      const map: NilaiMap = {};
      peserta.forEach(p => {
        const jurus: Record<string, EntryVal> = {};
        JURUS_LIST.forEach(j => {
          const f = jurusAll.find(n => n.peserta_id === p.id && n.jurus_nama === j);
          jurus[j] = f ? { id: f.id, nilai: String(f.nilai), created_at: f.created_at } : null;
        });
        const teoriRec: Record<number, EntryVal> = {};
        teori.forEach(t => {
          const f = teoriAll.find(n => n.peserta_id === p.id && n.teori_id === t.id);
          teoriRec[t.id] = f ? { id: f.id, nilai: String(f.nilai), created_at: f.created_at } : null;
        });
        map[p.id] = { jurus, teori: teoriRec, savingJurus: false, savingTeori: false };
      });
      setNilaiMap(map);

      // Load unlock overrides (semua, tanpa filter penguji)
      const unlockRes = await fetch('/api/asadpondok/unlock-override');
      const unlockData = await unlockRes.json();
      const uMap: UnlockMap = {};
      (unlockData.overrides || []).forEach((o: any) => {
        if (!uMap[o.peserta_id]) uMap[o.peserta_id] = {};
        uMap[o.peserta_id][o.penguji_id] = o.unlocked_until;
      });
      setUnlockMap(uMap);

      // Load daftar penguji (hanya untuk superadmin)
      if (user.role === 'superadmin') {
        const pRes = await fetch('/api/asadpondok/users');
        const pData = await pRes.json();
        setPengujiList((pData.users || []).filter((u: Penguji) =>
          u.role === 'penguji_sm_putra' || u.role === 'penguji_sm_putri'
        ));
      }

      setLoading(false);
    };
    load();
  }, [kelas, user.id]);

  const handleUnlock = async (pesertaId: number, pengujiId: number) => {
    const key = `${pesertaId}_${pengujiId}`;
    setUnlockingId(key);
    const res = await fetch('/api/asadpondok/unlock-override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: pesertaId, penguji_id: pengujiId }),
    });
    if (res.ok) {
      const unlocked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      setUnlockMap(m => ({ ...m, [pesertaId]: { ...(m[pesertaId] || {}), [pengujiId]: unlocked_until } }));
      toast.success('Nilai dibuka kembali selama 15 menit');
    } else {
      const err = await res.json();
      toast.error(err.error || 'Gagal membuka kunci');
    }
    setUnlockingId(null);
  };

  const updateJurus = (pid: number, j: string, val: string) => {
    setNilaiMap(m => ({ ...m, [pid]: { ...m[pid], jurus: { ...m[pid].jurus, [j]: { ...(m[pid].jurus[j] || { id: 0, created_at: '' }), nilai: val } as EntryVal } } }));
    const key = `${pid}_${j}`;
    clearTimeout(debounceJurus.current[key]);
    debounceJurus.current[key] = setTimeout(async () => {
      const nilai = parseFloat(val);
      if (isNaN(nilai)) return;
      const existing = nilaiMapRef.current[pid]?.jurus[j];
      const unlockUntil = unlockMapRef.current[pid]?.[user.id];
      if (existing?.created_at && !isEditable(existing.created_at, unlockUntil)) return;
      const res = await fetch('/api/asadpondok/nilai-jurus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peserta_id: pid, penguji_id: user.id, jurus_nama: j, nilai }),
      });
      if (res.ok) {
        toast.success('Tersimpan otomatis', { id: `jurus-${key}`, duration: 1500, icon: '✅' });
        const jRes = await fetch(`/api/asadpondok/nilai-jurus?peserta_id=${pid}&penguji_id=${user.id}`).then(r => r.json());
        setNilaiMap(m => {
          const jurusRec = { ...m[pid].jurus };
          JURUS_LIST.forEach(jn => {
            const f = (jRes.nilai || []).find((n: any) => n.jurus_nama === jn);
            if (f) jurusRec[jn] = { id: f.id, nilai: String(f.nilai), created_at: f.created_at };
          });
          return { ...m, [pid]: { ...m[pid], jurus: jurusRec } };
        });
      }
    }, 800);
  };

  const updateTeori = (pid: number, tid: number, val: string) => {
    setNilaiMap(m => ({ ...m, [pid]: { ...m[pid], teori: { ...m[pid].teori, [tid]: { ...(m[pid].teori[tid] || { id: 0, created_at: '' }), nilai: val } as EntryVal } } }));
    const key = `${pid}_${tid}`;
    clearTimeout(debounceTeori.current[key]);
    debounceTeori.current[key] = setTimeout(async () => {
      const nilai = parseFloat(val);
      if (isNaN(nilai)) return;
      // Gunakan ref untuk dapat nilai terbaru (hindari stale closure)
      const existing = nilaiMapRef.current[pid]?.teori[tid];
      const unlockUntil = unlockMapRef.current[pid]?.[user.id];
      if (existing?.created_at && !isEditable(existing.created_at, unlockUntil)) return;
      const res = await fetch('/api/asadpondok/nilai-teori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peserta_id: pid, penguji_id: user.id, teori_id: tid, nilai }),
      });
      if (res.ok) {
        toast.success('Tersimpan otomatis', { id: `teori-${key}`, duration: 1500, icon: '✅' });
        const ntRes = await fetch(`/api/asadpondok/nilai-teori?peserta_id=${pid}&penguji_id=${user.id}`).then(r => r.json());
        setNilaiMap(m => {
          const teoriRec = { ...m[pid].teori };
          teoriList.forEach(t => {
            const f = (ntRes.nilai || []).find((n: any) => n.teori_id === t.id);
            if (f) teoriRec[t.id] = { id: f.id, nilai: String(f.nilai), created_at: f.created_at };
          });
          return { ...m, [pid]: { ...m[pid], teori: teoriRec } };
        });
      }
    }, 800);
  };

  const simpanJurus = async (p: Peserta) => {
    const data = nilaiMap[p.id];
    setNilaiMap(m => ({ ...m, [p.id]: { ...m[p.id], savingJurus: true } }));
    const payloads = JURUS_LIST.map(j => {
      const e = data.jurus[j];
      const nilai = parseFloat(e?.nilai || '');
      if (isNaN(nilai)) return null;
      const unlockUntil = unlockMap[p.id]?.[user.id];
      if (e?.created_at && !isEditable(e.created_at, unlockUntil)) return null;
      return { jurus_nama: j, nilai };
    }).filter(Boolean);
    await Promise.all(payloads.map(p2 => fetch('/api/asadpondok/nilai-jurus', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: p.id, penguji_id: user.id, ...p2 }),
    })));
    const jRes = await fetch(`/api/asadpondok/nilai-jurus?peserta_id=${p.id}&penguji_id=${user.id}`).then(r => r.json());
    const jurusRec: Record<string, EntryVal> = {};
    JURUS_LIST.forEach(j => {
      const f = (jRes.nilai || []).find((n: any) => n.jurus_nama === j);
      jurusRec[j] = f ? { id: f.id, nilai: String(f.nilai), created_at: f.created_at } : null;
    });
    setNilaiMap(m => ({ ...m, [p.id]: { ...m[p.id], jurus: jurusRec, savingJurus: false } }));
    toast.success(`Jurus ${p.nama} tersimpan`);
  };

  const simpanTeori = async (p: Peserta) => {
    const data = nilaiMap[p.id];
    setNilaiMap(m => ({ ...m, [p.id]: { ...m[p.id], savingTeori: true } }));
    const payloads = teoriList.map(t => {
      const e = data.teori[t.id];
      const nilai = parseFloat(e?.nilai || '');
      if (isNaN(nilai)) return null;
      const unlockUntil = unlockMap[p.id]?.[user.id];
      if (e?.created_at && !isEditable(e.created_at, unlockUntil)) return null;
      return { teori_id: t.id, nilai };
    }).filter(Boolean);
    await Promise.all(payloads.map(p2 => fetch('/api/asadpondok/nilai-teori', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: p.id, penguji_id: user.id, ...p2 }),
    })));
    const ntRes = await fetch(`/api/asadpondok/nilai-teori?peserta_id=${p.id}&penguji_id=${user.id}`).then(r => r.json());
    const teoriRec: Record<number, EntryVal> = {};
    teoriList.forEach(t => {
      const f = (ntRes.nilai || []).find((n: any) => n.teori_id === t.id);
      teoriRec[t.id] = f ? { id: f.id, nilai: String(f.nilai), created_at: f.created_at } : null;
    });
    setNilaiMap(m => ({ ...m, [p.id]: { ...m[p.id], teori: teoriRec, savingTeori: false } }));
    toast.success(`Teori ${p.nama} tersimpan`);
  };

  const displayed = filterKelas ? pesertaList.filter(p => p.kelas === filterKelas) : pesertaList;

  if (loading) return <div className="text-center py-8 text-gray-500">Memuat data...</div>;

  const header = (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Input Nilai {kelas ? `— ${kelas}` : ''}</h2>
        {/* Toggle tampilan — hanya muncul di mobile */}
        <div className="flex md:hidden items-center gap-1 border rounded-lg p-0.5 bg-gray-100">
          <button onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'card' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            🃏 Kartu
          </button>
          <button onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
            📊 Tabel
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <span className="font-semibold text-amber-800">Ket:</span>
          <span className="text-amber-700">Kurang (K) = 5–6</span>
          <span className="text-amber-700">Cukup (C) = 7–8</span>
          <span className="text-amber-700">Baik (B) = 9–10</span>
        </div>
      </div>
      {!kelas && (
        <div className="flex gap-2">
          {['', 'PUTRA', 'PUTRI'].map(k => (
            <button key={k} onClick={() => setFilterKelas(k)}
              className={`px-3 py-1 rounded text-sm ${filterKelas === k ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
              {k || 'Semua'}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (displayed.length === 0) return <div>{header}<p className="text-center py-8 text-gray-500">Belum ada peserta</p></div>;

  return (
    <div className="space-y-6">
      {header}

      {/* ══ MOBILE: layout kartu ══ */}
      <div className={`${viewMode === 'card' ? 'md:hidden' : 'hidden'} space-y-4`}>
        {displayed.map((p, i) => {
          const data = nilaiMap[p.id];
          return (
            <div key={p.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Header kartu */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{i + 1}.</span>
                  <span className="font-semibold text-gray-900">{p.nama}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.role === 'superadmin' && pengujiList.map(pg => {
                    const unlockUntil = unlockMap[p.id]?.[pg.id];
                    const hasLockedNilai = JURUS_LIST.some(j => {
                      const e = data?.jurus[j];
                      return e?.created_at && !isEditable(e.created_at, unlockUntil);
                    });
                    if (!hasLockedNilai) return null;
                    const key = `${p.id}_${pg.id}`;
                    return (
                      <button key={pg.id}
                        onClick={() => handleUnlock(p.id, pg.id)}
                        disabled={unlockingId === key}
                        className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300 disabled:opacity-50"
                        title={`Buka kunci nilai ${pg.username}`}
                      >
                        {unlockingId === key ? '...' : `🔓 ${pg.username}`}
                      </button>
                    );
                  })}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {p.kelas}
                  </span>
                </div>
              </div>

              {/* Jurus */}
              <div className="px-4 py-3 border-b">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">📋 Jurus</p>
                <div className="grid grid-cols-2 gap-2">
                  {JURUS_LIST.map(j => {
                    const e = data?.jurus[j];
                    const unlockUntil = unlockMap[p.id]?.[user.id];
                    const locked = e?.created_at ? !isEditable(e.created_at, unlockUntil) : false;
                    return (
                      <div key={j} className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 w-20 shrink-0">{j}</label>
                        <div className="flex-1 relative">
                          <input
                            type="number" inputMode="decimal" step="0.01" min="0" max="100"
                            value={e?.nilai ?? ''}
                            onChange={ev => updateJurus(p.id, j, ev.target.value)}
                            disabled={locked || data?.savingJurus}
                            className={`w-full border rounded-lg px-3 py-2 text-sm text-center ${locked ? 'bg-gray-100 text-gray-400' : 'focus:ring-2 focus:ring-green-400 focus:outline-none'}`}
                            placeholder="0"
                          />
                          {locked && <span className="absolute right-2 top-2 text-xs">🔒</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => simpanJurus(p)} disabled={data?.savingJurus}
                  className="mt-3 w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 active:scale-95 transition-transform">
                  {data?.savingJurus ? 'Menyimpan...' : '💾 Simpan Jurus'}
                </button>
              </div>

              {/* Teori */}
              {teoriList.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">📖 Teori</p>
                  <div className="space-y-2">
                    {teoriList.map(t => {
                      const e = data?.teori[t.id];
                      const unlockUntil = unlockMap[p.id]?.[user.id];
                      const locked = e?.created_at ? !isEditable(e.created_at, unlockUntil) : false;
                      return (
                        <div key={t.id} className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 flex-1">{t.nama_teori}</label>
                          <div className="relative w-24 shrink-0">
                            <input
                              type="number" inputMode="decimal" step="0.01" min="0" max="100"
                              value={e?.nilai ?? ''}
                              onChange={ev => updateTeori(p.id, t.id, ev.target.value)}
                              disabled={locked || data?.savingTeori}
                              className={`w-full border rounded-lg px-3 py-2 text-sm text-center ${locked ? 'bg-gray-100 text-gray-400' : 'focus:ring-2 focus:ring-purple-400 focus:outline-none'}`}
                              placeholder="0"
                            />
                            {locked && <span className="absolute right-2 top-2 text-xs">🔒</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => simpanTeori(p)} disabled={data?.savingTeori}
                    className="mt-3 w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 active:scale-95 transition-transform">
                    {data?.savingTeori ? 'Menyimpan...' : '💾 Simpan Teori'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ DESKTOP: layout tabel ══ */}
      <div className={`${viewMode === 'table' ? 'block' : 'hidden md:block'} space-y-6`}>
        {/* Tabel Jurus */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">📋 Penilaian Jurus</h3>
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="text-sm border-collapse min-w-max">
              <thead className="bg-green-50">
                <tr>
                  <th className="sticky left-0 bg-green-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r w-10">No</th>
                  <th className="sticky left-10 bg-green-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[150px]">Nama</th>
                  {JURUS_LIST.map(j => (
                    <th key={j} className="px-2 py-2 font-medium text-gray-600 border-b border-r whitespace-nowrap text-center">{j}</th>
                  ))}
                  <th className="px-3 py-2 font-medium text-gray-600 border-b text-center">Simpan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayed.map((p, i) => {
                  const data = nilaiMap[p.id];
                  const unlockUntil = unlockMap[p.id]?.[user.id];
                  return (
                    <tr key={p.id} className="hover:bg-green-50">
                      <td className="sticky left-0 bg-white z-10 px-3 py-2 text-gray-400 border-r">{i + 1}</td>
                      <td className="sticky left-10 bg-white z-10 px-3 py-2 font-medium border-r whitespace-nowrap">
                        <div>{p.nama}</div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{p.kelas}</span>
                          {user.role === 'superadmin' && pengujiList.map(pg => {
                            const pgUnlock = unlockMap[p.id]?.[pg.id];
                            const hasLocked = JURUS_LIST.some(j => {
                              const e = data?.jurus[j];
                              return e?.created_at && !isEditable(e.created_at, pgUnlock);
                            });
                            if (!hasLocked) return null;
                            const key = `${p.id}_${pg.id}`;
                            return (
                              <button key={pg.id}
                                onClick={() => handleUnlock(p.id, pg.id)}
                                disabled={unlockingId === key}
                                className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300 disabled:opacity-50"
                                title={`Buka kunci ${pg.username}`}
                              >
                                {unlockingId === key ? '...' : `🔓 ${pg.username}`}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      {JURUS_LIST.map(j => {
                        const e = data?.jurus[j];
                        const locked = e?.created_at ? !isEditable(e.created_at, unlockUntil) : false;
                        return (
                          <td key={j} className="px-1 py-1 border-r text-center">
                            <input type="number" step="0.01" min="0" max="100"
                              value={e?.nilai ?? ''}
                              onChange={ev => updateJurus(p.id, j, ev.target.value)}
                              disabled={locked || data?.savingJurus}
                              className={`w-16 border rounded px-1 py-1 text-center text-sm ${locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-1 focus:ring-green-400 focus:outline-none'}`}
                              placeholder="0"
                            />
                            {locked && <div className="text-xs text-gray-400">🔒</div>}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 text-center">
                        <button onClick={() => simpanJurus(p)} disabled={data?.savingJurus}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 disabled:opacity-50">
                          {data?.savingJurus ? '...' : 'Simpan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Teori */}
        {teoriList.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">📖 Penilaian Teori</h3>
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="text-sm border-collapse min-w-max">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="sticky left-0 bg-purple-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r w-10">No</th>
                    <th className="sticky left-10 bg-purple-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[150px]">Nama</th>
                    {teoriList.map(t => (
                      <th key={t.id} className="px-2 py-2 font-medium text-purple-700 border-b border-r text-center min-w-[120px]">
                        {t.nama_teori}
                      </th>
                    ))}
                    <th className="px-3 py-2 font-medium text-gray-600 border-b text-center">Simpan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayed.map((p, i) => {
                    const data = nilaiMap[p.id];
                    const unlockUntil = unlockMap[p.id]?.[user.id];
                    return (
                      <tr key={p.id} className="hover:bg-purple-50">
                        <td className="sticky left-0 bg-white z-10 px-3 py-2 text-gray-400 border-r">{i + 1}</td>
                        <td className="sticky left-10 bg-white z-10 px-3 py-2 font-medium border-r whitespace-nowrap">
                          <div>{p.nama}</div>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{p.kelas}</span>
                        </td>
                        {teoriList.map(t => {
                          const e = data?.teori[t.id];
                          const locked = e?.created_at ? !isEditable(e.created_at, unlockUntil) : false;
                          return (
                            <td key={t.id} className="px-1 py-1 border-r text-center">
                              <input type="number" step="0.01" min="0" max="100"
                                value={e?.nilai ?? ''}
                                onChange={ev => updateTeori(p.id, t.id, ev.target.value)}
                                disabled={locked || data?.savingTeori}
                                className={`w-16 border rounded px-1 py-1 text-center text-sm ${locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-1 focus:ring-purple-400 focus:outline-none'}`}
                                placeholder="0"
                              />
                              {locked && <div className="text-xs text-gray-400">🔒</div>}
                            </td>
                          );
                        })}
                        <td className="px-2 py-1 text-center">
                          <button onClick={() => simpanTeori(p)} disabled={data?.savingTeori}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded text-xs hover:bg-purple-700 disabled:opacity-50">
                            {data?.savingTeori ? '...' : 'Simpan'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">🔒 = tidak bisa diedit (lewat 15 menit)</p>
    </div>
  );
}
