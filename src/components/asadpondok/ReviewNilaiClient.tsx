'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Peserta { id: number; nama: string; kelas: string; }
interface Teori { id: number; nama_teori: string; urutan: number; }
interface Penguji { id: number; username: string; full_name: string; role: string; }
interface NilaiJurus { peserta_id: number; penguji_id: number; jurus_nama: string; nilai: number; }
interface NilaiTeori { peserta_id: number; penguji_id: number; teori_id: number; nilai: number; }

type TabType = 'jurus' | 'teori';
interface Props { user: { id: number; role: string; } }

export default function ReviewNilaiClient({ user }: Props) {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [teoriList, setTeoriList] = useState<Teori[]>([]);
  const [pengujiList, setPengujiList] = useState<Penguji[]>([]);
  const [nilaiJurus, setNilaiJurus] = useState<NilaiJurus[]>([]);
  const [nilaiTeori, setNilaiTeori] = useState<NilaiTeori[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('PUTRA');
  const [activeTab, setActiveTab] = useState<TabType>('jurus');
  const [selectedPengujiId, setSelectedPengujiId] = useState<number | null>(null);
  const [editingJurus, setEditingJurus] = useState<Record<string, string>>({});
  const [editingTeori, setEditingTeori] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/asadpondok/review-nilai`);
    const data = await res.json();
    setPesertaList(data.peserta || []);
    setTeoriList(data.teori || []);
    setPengujiList(data.penguji || []);
    setNilaiJurus(data.nilaiJurus || []);
    setNilaiTeori(data.nilaiTeori || []);
    setLoading(false);
  };

  useEffect(() => { load(); setSelectedPengujiId(null); }, [filterKelas]);

  const getNilaiJurus = (pesertaId: number, pengujiId: number, jurusNama: string) => {
    const n = nilaiJurus.find(n => n.peserta_id === pesertaId && n.penguji_id === pengujiId && n.jurus_nama === jurusNama);
    return n ? n.nilai : null;
  };

  const getNilaiTeori = (pesertaId: number, pengujiId: number, teoriId: number) => {
    const n = nilaiTeori.find(n => n.peserta_id === pesertaId && n.penguji_id === pengujiId && n.teori_id === teoriId);
    return n ? n.nilai : null;
  };

  const getTotalJurus = (pesertaId: number, pengujiId: number) => {
    const vals = nilaiJurus.filter(n => n.peserta_id === pesertaId && n.penguji_id === pengujiId);
    return vals.length === 0 ? null : vals.reduce((s, n) => s + n.nilai, 0);
  };

  const getTotalTeori = (pesertaId: number, pengujiId: number) => {
    const vals = nilaiTeori.filter(n => n.peserta_id === pesertaId && n.penguji_id === pengujiId);
    return vals.length === 0 ? null : vals.reduce((s, n) => s + n.nilai, 0);
  };

  const jurusHeaders = ['Jurus 1A','Jurus 1B','Jurus 2A','Jurus 2B','Jurus 3A','Jurus 3B','Jurus 4A','Jurus 4B','Jurus 5','Jurus 6','Jurus 7'];

  const isJurusLengkap = (pesertaId: number, pengujiId: number) =>
    jurusHeaders.length > 0 && jurusHeaders.every(j => getNilaiJurus(pesertaId, pengujiId, j) !== null);

  const isTeoriLengkap = (pesertaId: number, pengujiId: number) =>
    teoriList.length === 0 || teoriList.every(t => getNilaiTeori(pesertaId, pengujiId, t.id) !== null);

  const pengujiKelas = pengujiList.filter(p =>
    filterKelas === 'PUTRA' ? p.role === 'penguji_sm_putra' : p.role === 'penguji_sm_putri'
  );

  const displayed = pesertaList.filter(p => p.kelas === filterKelas);

  const activePenguji = pengujiKelas.find(p => p.id === selectedPengujiId) ?? pengujiKelas[0] ?? null;

  const jurusKey = (pesertaId: number, jurusNama: string) => `${pesertaId}_${jurusNama}`;
  const teoriKey = (pesertaId: number, teoriId: number) => `${pesertaId}_${teoriId}`;

  const saveJurus = async (pesertaId: number, pengujiId: number, jurusNama: string, nilai: number) => {
    setSaving(true);
    await fetch('/api/asadpondok/nilai-jurus', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: pesertaId, penguji_id: pengujiId, jurus_nama: jurusNama, nilai }),
    });
    const res = await fetch('/api/asadpondok/review-nilai');
    const data = await res.json();
    setNilaiJurus(data.nilaiJurus || []);
    setSaving(false);
    toast.success('Tersimpan', { duration: 500 });
  };

  const saveTeori = async (pesertaId: number, pengujiId: number, teoriId: number, nilai: number) => {
    setSaving(true);
    await fetch('/api/asadpondok/nilai-teori', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: pesertaId, penguji_id: pengujiId, teori_id: teoriId, nilai }),
    });
    const res = await fetch('/api/asadpondok/review-nilai');
    const data = await res.json();
    setNilaiTeori(data.nilaiTeori || []);
    setSaving(false);
    toast.success('Tersimpan', { duration: 500 });
  };

  const statusBadge = (lengkap: boolean, hasAny: boolean) => {
    if (!hasAny) return <span className="text-gray-300 text-xs">—</span>;
    if (lengkap) return <span className="text-green-600 text-xs">✅</span>;
    return <span className="text-amber-500 text-xs">⚠️</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Review Nilai Penguji</h2>
        <button onClick={load} className="text-sm text-green-600 hover:underline">🔄 Refresh</button>
      </div>

      {/* Filter Kelas */}
      <div className="flex gap-2 mb-4">
        {['PUTRA', 'PUTRI'].map(k => (
          <button key={k} onClick={() => setFilterKelas(k)}
            className={`px-4 py-2 rounded text-sm font-medium ${filterKelas === k ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
            {k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      ) : pengujiKelas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Belum ada penguji {filterKelas} terdaftar</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Belum ada peserta {filterKelas}</div>
      ) : (
        <>
          {/* Dropdown Penguji */}
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Penguji:</label>
            <select
              value={activePenguji?.id ?? ''}
              onChange={e => setSelectedPengujiId(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              {pengujiKelas.map(pg => (
                <option key={pg.id} value={pg.id}>{pg.full_name || pg.username}</option>
              ))}
            </select>
          </div>

          {/* Tab */}
          <div className="flex gap-1 mb-4 border-b">
            {(['jurus', 'teori'] as TabType[]).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t === 'jurus' ? '📋 Nilai Jurus' : '📖 Nilai Teori'}
              </button>
            ))}
          </div>

          {/* Legenda */}
          <div className="flex gap-4 text-xs mb-3 text-gray-500">
            <span>✅ Lengkap</span><span>⚠️ Belum lengkap</span><span>— Belum ada nilai</span>
          </div>

          {!activePenguji ? null : activeTab === 'jurus' ? (
            jurusHeaders.length === 0 ? (
              <div className="text-center py-8 text-gray-400">Belum ada nilai jurus yang diinput</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="text-sm border-collapse min-w-max w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-r w-8">No</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[140px]">Nama</th>
                      {jurusHeaders.map(j => (
                        <th key={j} className="px-2 py-2 text-xs font-medium text-gray-500 border-b border-r text-center whitespace-nowrap">{j}</th>
                      ))}
                      <th className="px-2 py-2 text-xs font-semibold text-green-700 border-b border-r text-center bg-green-50">Total</th>
                      <th className="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayed.map((p, i) => {
                      const total = getTotalJurus(p.id, activePenguji.id);
                      const hasAny = nilaiJurus.some(n => n.peserta_id === p.id && n.penguji_id === activePenguji.id);
                      return (
                        <tr key={p.id} className="hover:bg-green-50">
                          <td className="px-3 py-2 text-gray-400 border-r text-center">{i + 1}</td>
                          <td className="px-3 py-2 font-medium border-r whitespace-nowrap">{p.nama}</td>
                          {jurusHeaders.map(j => {
                            const val = getNilaiJurus(p.id, activePenguji.id, j);
                            const k = jurusKey(p.id, j);
                            const editVal = editingJurus[k];
                            return (
                              <td key={j} className="px-2 py-2 border-r text-center">
                                {editVal !== undefined ? (
                                  <input
                                    type="number" step="0.01" min="0" max="100" autoFocus
                                    value={editVal}
                                    onChange={e => setEditingJurus(m => ({ ...m, [k]: e.target.value }))}
                                    onBlur={async () => {
                                      const n = parseFloat(editVal);
                                      if (!isNaN(n)) await saveJurus(p.id, activePenguji.id, j, n);
                                      setEditingJurus(m => { const x = { ...m }; delete x[k]; return x; });
                                    }}
                                    onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingJurus(m => { const x = { ...m }; delete x[k]; return x; }); }}
                                    className="w-16 border-2 border-green-400 rounded px-1 py-1 text-center text-sm focus:outline-none"
                                    disabled={saving}
                                  />
                                ) : (
                                  <span
                                    onClick={() => setEditingJurus(m => ({ ...m, [k]: val !== null ? String(val) : '' }))}
                                    className="cursor-pointer hover:bg-green-100 px-2 py-1 rounded font-medium text-gray-800"
                                    title="Klik untuk edit"
                                  >
                                    {val !== null ? val : <span className="text-gray-300">—</span>}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-2 py-2 border-r text-center font-bold text-green-700 bg-green-50">
                            {total !== null ? total.toFixed(1) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-2 py-2 text-center">{statusBadge(isJurusLengkap(p.id, activePenguji.id), hasAny)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : teoriList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada item teori yang dikonfigurasi</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="text-sm border-collapse min-w-max w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="sticky left-0 bg-purple-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[160px]">Nama Teori</th>
                    {displayed.map(p => (
                      <th key={p.id} className="px-2 py-2 text-xs font-medium text-gray-600 border-b border-r text-center min-w-[90px] whitespace-nowrap">{p.nama}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teoriList.map(t => (
                    <tr key={t.id} className="hover:bg-purple-50">
                      <td className="sticky left-0 bg-white z-10 px-3 py-2 font-medium text-gray-700 border-r whitespace-nowrap">{t.nama_teori}</td>
                      {displayed.map(p => {
                        const val = getNilaiTeori(p.id, activePenguji.id, t.id);
                        const k = teoriKey(p.id, t.id);
                        const editVal = editingTeori[k];
                        return (
                          <td key={p.id} className="px-2 py-2 border-r text-center">
                            {editVal !== undefined ? (
                              <input
                                type="number" step="0.01" min="0" max="100" autoFocus
                                value={editVal}
                                onChange={e => setEditingTeori(m => ({ ...m, [k]: e.target.value }))}
                                onBlur={async () => {
                                  const n = parseFloat(editVal);
                                  if (!isNaN(n)) await saveTeori(p.id, activePenguji.id, t.id, n);
                                  setEditingTeori(m => { const x = { ...m }; delete x[k]; return x; });
                                }}
                                onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingTeori(m => { const x = { ...m }; delete x[k]; return x; }); }}
                                className="w-16 border-2 border-purple-400 rounded px-1 py-1 text-center text-sm focus:outline-none"
                                disabled={saving}
                              />
                            ) : (
                              <span
                                onClick={() => setEditingTeori(m => ({ ...m, [k]: val !== null ? String(val) : '' }))}
                                className="cursor-pointer hover:bg-purple-100 px-2 py-1 rounded font-medium text-gray-800"
                                title="Klik untuk edit"
                              >
                                {val !== null ? val : <span className="text-gray-300">—</span>}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-purple-50 font-bold">
                    <td className="sticky left-0 bg-purple-50 z-10 px-3 py-2 text-purple-700 border-r">Total</td>
                    {displayed.map(p => {
                      const total = getTotalTeori(p.id, activePenguji.id);
                      return (
                        <td key={p.id} className="px-2 py-2 border-r text-center text-purple-700">
                          {total !== null ? total.toFixed(1) : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white z-10 px-3 py-2 text-gray-500 border-r text-sm">Status</td>
                    {displayed.map(p => {
                      const hasAny = nilaiTeori.some(n => n.peserta_id === p.id && n.penguji_id === activePenguji.id);
                      return (
                        <td key={p.id} className="px-2 py-2 border-r text-center">
                          {statusBadge(isTeoriLengkap(p.id, activePenguji.id), hasAny)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
