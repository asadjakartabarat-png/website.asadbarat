'use client';

import { useState, useEffect } from 'react';

const JURUS_LIST = ['Jurus 1A','Jurus 1B','Jurus 2A','Jurus 2B','Jurus 3A','Jurus 3B','Jurus 4A','Jurus 4B','Jurus 5','Jurus 6','Jurus 7'];

interface Peserta { id: number; nama: string; kelas: string; }
interface Teori { id: number; nama_teori: string; urutan: number; }
interface Penguji { id: number; username: string; full_name: string; role: string; }
interface NilaiJurus { peserta_id: number; penguji_id: number; jurus_nama: string; nilai: number; }
interface NilaiTeori { peserta_id: number; penguji_id: number; teori_id: number; nilai: number; }

type TabType = 'jurus' | 'teori';

export default function ReviewNilaiClient() {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [teoriList, setTeoriList] = useState<Teori[]>([]);
  const [pengujiList, setPengujiList] = useState<Penguji[]>([]);
  const [nilaiJurus, setNilaiJurus] = useState<NilaiJurus[]>([]);
  const [nilaiTeori, setNilaiTeori] = useState<NilaiTeori[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('PUTRA');
  const [activeTab, setActiveTab] = useState<TabType>('jurus');
  const [selectedPengujiId, setSelectedPengujiId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/asadpondok/review-nilai?kelas=${filterKelas}`);
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

  const getTotalJurusPenguji = (pesertaId: number, pengujiId: number) => {
    const vals = nilaiJurus.filter(n => n.peserta_id === pesertaId && n.penguji_id === pengujiId);
    if (vals.length === 0) return null;
    return vals.reduce((s, n) => s + n.nilai, 0);
  };

  const getTotalTeoriPenguji = (pesertaId: number, pengujiId: number) => {
    const vals = nilaiTeori.filter(n => n.peserta_id === pesertaId && n.penguji_id === pengujiId);
    if (vals.length === 0) return null;
    return vals.reduce((s, n) => s + n.nilai, 0);
  };

  const isJurusLengkap = (pesertaId: number, pengujiId: number) => {
    return JURUS_LIST.every(j => getNilaiJurus(pesertaId, pengujiId, j) !== null);
  };

  const isTeoriLengkap = (pesertaId: number, pengujiId: number) => {
    if (teoriList.length === 0) return true;
    return teoriList.every(t => getNilaiTeori(pesertaId, pengujiId, t.id) !== null);
  };

  const pengujiKelas = pengujiList.filter(p =>
    filterKelas === 'PUTRA' ? p.role === 'penguji_sm_putra' : p.role === 'penguji_sm_putri'
  );

  const displayed = pesertaList.filter(p => p.kelas === filterKelas);

  const activePenguji = pengujiKelas.find(p => p.id === selectedPengujiId) ?? pengujiKelas[0] ?? null;

  const renderStatusBadge = (lengkap: boolean, hasAny: boolean) => {
    if (!hasAny) return <span className="text-gray-300 text-xs">—</span>;
    if (lengkap) return <span className="text-green-600 text-xs font-medium">✅</span>;
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

      {/* Pilih Penguji */}
      {pengujiKelas.length > 0 && (
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
      )}

      {/* Tab Jurus / Teori */}
      <div className="flex gap-1 mb-4 border-b">
        {(['jurus', 'teori'] as TabType[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'jurus' ? '📋 Nilai Jurus' : '📖 Nilai Teori'}
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
          {/* Legenda */}
          <div className="flex gap-4 text-xs mb-3 text-gray-500">
            <span>✅ Lengkap</span>
            <span>⚠️ Belum lengkap</span>
            <span>— Belum ada nilai</span>
          </div>

          {!activePenguji ? null : activeTab === 'jurus' ? (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="text-sm border-collapse min-w-max w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-r w-8">No</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[140px]">Nama</th>
                    {JURUS_LIST.map(j => (
                      <th key={j} className="px-2 py-2 text-xs font-medium text-gray-500 border-b border-r text-center whitespace-nowrap">{j}</th>
                    ))}
                    <th className="px-2 py-2 text-xs font-semibold text-green-700 border-b border-r text-center bg-green-50">Total</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayed.map((p, i) => {
                    const total = getTotalJurusPenguji(p.id, activePenguji.id);
                    const lengkap = isJurusLengkap(p.id, activePenguji.id);
                    const hasAny = nilaiJurus.some(n => n.peserta_id === p.id && n.penguji_id === activePenguji.id);
                    return (
                      <tr key={p.id} className="hover:bg-green-50">
                        <td className="px-3 py-2 text-gray-400 border-r text-center">{i + 1}</td>
                        <td className="px-3 py-2 font-medium border-r whitespace-nowrap">{p.nama}</td>
                        {JURUS_LIST.map(j => {
                          const val = getNilaiJurus(p.id, activePenguji.id, j);
                          return (
                            <td key={j} className="px-2 py-2 border-r text-center">
                              {val !== null ? <span className="font-medium text-gray-800">{val}</span> : <span className="text-gray-300">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 border-r text-center font-bold text-green-700 bg-green-50">
                          {total !== null ? total.toFixed(1) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-2 py-2 text-center">{renderStatusBadge(lengkap, hasAny)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : teoriList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">Belum ada item teori yang dikonfigurasi</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-white">
              <table className="text-sm border-collapse min-w-max w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-r w-8">No</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600 border-b border-r min-w-[140px]">Nama</th>
                    {teoriList.map(t => (
                      <th key={t.id} className="px-2 py-2 text-xs font-medium text-gray-500 border-b border-r text-center min-w-[100px]">{t.nama_teori}</th>
                    ))}
                    <th className="px-2 py-2 text-xs font-semibold text-purple-700 border-b border-r text-center bg-purple-50">Total</th>
                    <th className="px-2 py-2 text-xs font-medium text-gray-500 border-b text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {displayed.map((p, i) => {
                    const total = getTotalTeoriPenguji(p.id, activePenguji.id);
                    const lengkap = isTeoriLengkap(p.id, activePenguji.id);
                    const hasAny = nilaiTeori.some(n => n.peserta_id === p.id && n.penguji_id === activePenguji.id);
                    return (
                      <tr key={p.id} className="hover:bg-purple-50">
                        <td className="px-3 py-2 text-gray-400 border-r text-center">{i + 1}</td>
                        <td className="px-3 py-2 font-medium border-r whitespace-nowrap">{p.nama}</td>
                        {teoriList.map(t => {
                          const val = getNilaiTeori(p.id, activePenguji.id, t.id);
                          return (
                            <td key={t.id} className="px-2 py-2 border-r text-center">
                              {val !== null ? <span className="font-medium text-gray-800">{val}</span> : <span className="text-gray-300">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 border-r text-center font-bold text-purple-700 bg-purple-50">
                          {total !== null ? total.toFixed(1) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-2 py-2 text-center">{renderStatusBadge(lengkap, hasAny)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Ringkasan semua penguji */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pengujiKelas.map(pg => {
              const totalPeserta = displayed.length;
              const jurusSelesai = displayed.filter(p => isJurusLengkap(p.id, pg.id)).length;
              const teoriSelesai = displayed.filter(p => isTeoriLengkap(p.id, pg.id)).length;
              return (
                <div key={pg.id}
                  onClick={() => setSelectedPengujiId(pg.id)}
                  className={`border rounded-lg p-3 text-sm cursor-pointer transition-colors ${
                    activePenguji?.id === pg.id ? 'bg-green-50 border-green-400' : 'bg-gray-50 hover:bg-gray-100'
                  }`}>
                  <p className="font-semibold text-gray-700 truncate">{pg.full_name || pg.username}</p>
                  <p className="text-gray-500 text-xs mt-1">Jurus: <span className={jurusSelesai === totalPeserta ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{jurusSelesai}/{totalPeserta}</span></p>
                  {teoriList.length > 0 && (
                    <p className="text-gray-500 text-xs">Teori: <span className={teoriSelesai === totalPeserta ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{teoriSelesai}/{totalPeserta}</span></p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
