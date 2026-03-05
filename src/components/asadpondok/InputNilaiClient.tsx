'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const JURUS_LIST = ['Jurus 1A','Jurus 1B','Jurus 2A','Jurus 2B','Jurus 3A','Jurus 3B','Jurus 4A','Jurus 4B','Jurus 5','Jurus 6','Jurus 7'];

interface Peserta { id: number; nama: string; kelas: string; }
interface Teori { id: number; nama_teori: string; urutan: number; }

// nilai per peserta: { jurus: {jurusNama: {id,nilai,created_at}}, teori: {teoriId: {id,nilai,created_at}} }
type NilaiMap = Record<number, {
  jurus: Record<string, { id: number; nilai: string; created_at: string } | null>;
  teori: Record<number, { id: number; nilai: string; created_at: string } | null>;
  saving: boolean;
}>;

interface Props { user: { id: number; role: string; }; }

function isEditable(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
}

export default function InputNilaiClient({ user }: Props) {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [teoriList, setTeoriList] = useState<Teori[]>([]);
  const [nilaiMap, setNilaiMap] = useState<NilaiMap>({});
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState<string>('');

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

      // Load semua nilai sekaligus untuk semua peserta
      const map: NilaiMap = {};
      await Promise.all(peserta.map(async (p) => {
        const [jRes, ntRes] = await Promise.all([
          fetch(`/api/asadpondok/nilai-jurus?peserta_id=${p.id}&penguji_id=${user.id}`),
          fetch(`/api/asadpondok/nilai-teori?peserta_id=${p.id}&penguji_id=${user.id}`),
        ]);
        const [jData, ntData] = await Promise.all([jRes.json(), ntRes.json()]);
        const jurusRecord: Record<string, { id: number; nilai: string; created_at: string } | null> = {};
        JURUS_LIST.forEach(j => {
          const found = (jData.nilai || []).find((n: any) => n.jurus_nama === j);
          jurusRecord[j] = found ? { id: found.id, nilai: String(found.nilai), created_at: found.created_at } : null;
        });
        const teoriRecord: Record<number, { id: number; nilai: string; created_at: string } | null> = {};
        teori.forEach(t => {
          const found = (ntData.nilai || []).find((n: any) => n.teori_id === t.id);
          teoriRecord[t.id] = found ? { id: found.id, nilai: String(found.nilai), created_at: found.created_at } : null;
        });
        map[p.id] = { jurus: jurusRecord, teori: teoriRecord, saving: false };
      }));
      setNilaiMap(map);
      setLoading(false);
    };
    load();
  }, [kelas, user.id]);

  const updateJurusValue = (pesertaId: number, jurusNama: string, val: string) => {
    setNilaiMap(m => ({
      ...m,
      [pesertaId]: {
        ...m[pesertaId],
        jurus: { ...m[pesertaId].jurus, [jurusNama]: { ...(m[pesertaId].jurus[jurusNama] || { id: 0, created_at: '' }), nilai: val } as any },
      },
    }));
  };

  const updateTeoriValue = (pesertaId: number, teoriId: number, val: string) => {
    setNilaiMap(m => ({
      ...m,
      [pesertaId]: {
        ...m[pesertaId],
        teori: { ...m[pesertaId].teori, [teoriId]: { ...(m[pesertaId].teori[teoriId] || { id: 0, created_at: '' }), nilai: val } as any },
      },
    }));
  };

  const handleSimpan = async (peserta: Peserta) => {
    const data = nilaiMap[peserta.id];
    if (!data) return;
    setNilaiMap(m => ({ ...m, [peserta.id]: { ...m[peserta.id], saving: true } }));

    const jurusPayloads = JURUS_LIST.map(j => {
      const entry = data.jurus[j];
      const nilai = parseFloat(entry?.nilai || '');
      if (isNaN(nilai)) return null;
      if (entry?.created_at && !isEditable(entry.created_at)) return null; // skip locked
      return { jurus_nama: j, nilai };
    }).filter(Boolean);

    const teoriPayloads = teoriList.map(t => {
      const entry = data.teori[t.id];
      const nilai = parseFloat(entry?.nilai || '');
      if (isNaN(nilai)) return null;
      if (entry?.created_at && !isEditable(entry.created_at)) return null;
      return { teori_id: t.id, nilai };
    }).filter(Boolean);

    try {
      await Promise.all([
        ...jurusPayloads.map(p => fetch('/api/asadpondok/nilai-jurus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peserta_id: peserta.id, penguji_id: user.id, ...p }),
        })),
        ...teoriPayloads.map(p => fetch('/api/asadpondok/nilai-teori', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peserta_id: peserta.id, penguji_id: user.id, ...p }),
        })),
      ]);
      toast.success(`Nilai ${peserta.nama} tersimpan`);

      // Refresh nilai peserta ini
      const [jRes, ntRes] = await Promise.all([
        fetch(`/api/asadpondok/nilai-jurus?peserta_id=${peserta.id}&penguji_id=${user.id}`),
        fetch(`/api/asadpondok/nilai-teori?peserta_id=${peserta.id}&penguji_id=${user.id}`),
      ]);
      const [jData, ntData] = await Promise.all([jRes.json(), ntRes.json()]);
      const jurusRecord: Record<string, { id: number; nilai: string; created_at: string } | null> = {};
      JURUS_LIST.forEach(j => {
        const found = (jData.nilai || []).find((n: any) => n.jurus_nama === j);
        jurusRecord[j] = found ? { id: found.id, nilai: String(found.nilai), created_at: found.created_at } : null;
      });
      const teoriRecord: Record<number, { id: number; nilai: string; created_at: string } | null> = {};
      teoriList.forEach(t => {
        const found = (ntData.nilai || []).find((n: any) => n.teori_id === t.id);
        teoriRecord[t.id] = found ? { id: found.id, nilai: String(found.nilai), created_at: found.created_at } : null;
      });
      setNilaiMap(m => ({ ...m, [peserta.id]: { jurus: jurusRecord, teori: teoriRecord, saving: false } }));
    } catch {
      toast.error('Gagal menyimpan');
      setNilaiMap(m => ({ ...m, [peserta.id]: { ...m[peserta.id], saving: false } }));
    }
  };

  const displayed = filterKelas ? pesertaList.filter(p => p.kelas === filterKelas) : pesertaList;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Input Nilai {kelas ? `— ${kelas}` : ''}</h2>
      </div>

      {!kelas && (
        <div className="flex gap-2 mb-4">
          {['', 'PUTRA', 'PUTRI'].map(k => (
            <button key={k} onClick={() => setFilterKelas(k)}
              className={`px-3 py-1 rounded text-sm ${filterKelas === k ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
              {k || 'Semua'}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      ) : displayed.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Belum ada peserta</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="text-sm border-collapse min-w-max">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r whitespace-nowrap">No</th>
                <th className="sticky left-8 bg-gray-50 z-10 px-3 py-2 text-left font-medium text-gray-600 border-b border-r whitespace-nowrap min-w-[140px]">Nama</th>
                {JURUS_LIST.map(j => (
                  <th key={j} className="px-2 py-2 font-medium text-gray-600 border-b border-r whitespace-nowrap text-center">{j}</th>
                ))}
                {teoriList.map(t => (
                  <th key={t.id} className="px-2 py-2 font-medium text-purple-700 border-b border-r whitespace-nowrap text-center max-w-[100px]">
                    <span className="block truncate max-w-[90px]" title={t.nama_teori}>{t.nama_teori}</span>
                  </th>
                ))}
                <th className="px-3 py-2 font-medium text-gray-600 border-b whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayed.map((p, i) => {
                const data = nilaiMap[p.id];
                const isSaving = data?.saving;
                return (
                  <tr key={p.id} className="hover:bg-green-50">
                    <td className="sticky left-0 bg-white z-10 px-3 py-2 text-gray-400 border-r">{i + 1}</td>
                    <td className="sticky left-8 bg-white z-10 px-3 py-2 font-medium border-r whitespace-nowrap">
                      <div>{p.nama}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{p.kelas}</span>
                    </td>
                    {JURUS_LIST.map(j => {
                      const entry = data?.jurus[j];
                      const locked = entry?.created_at ? !isEditable(entry.created_at) : false;
                      return (
                        <td key={j} className="px-1 py-1 border-r">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            value={entry?.nilai ?? ''}
                            onChange={e => updateJurusValue(p.id, j, e.target.value)}
                            disabled={locked || isSaving}
                            className={`w-16 border rounded px-1 py-1 text-center text-sm ${locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-1 focus:ring-green-400 focus:outline-none'}`}
                            placeholder="0"
                          />
                          {locked && <div className="text-center text-xs text-gray-400">🔒</div>}
                        </td>
                      );
                    })}
                    {teoriList.map(t => {
                      const entry = data?.teori[t.id];
                      const locked = entry?.created_at ? !isEditable(entry.created_at) : false;
                      return (
                        <td key={t.id} className="px-1 py-1 border-r">
                          <input
                            type="number" step="0.01" min="0" max="100"
                            value={entry?.nilai ?? ''}
                            onChange={e => updateTeoriValue(p.id, t.id, e.target.value)}
                            disabled={locked || isSaving}
                            className={`w-16 border rounded px-1 py-1 text-center text-sm ${locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'focus:ring-1 focus:ring-purple-400 focus:outline-none'}`}
                            placeholder="0"
                          />
                          {locked && <div className="text-center text-xs text-gray-400">🔒</div>}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center">
                      <button
                        onClick={() => handleSimpan(p)}
                        disabled={isSaving}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSaving ? '...' : 'Simpan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">* Kolom hijau = Nilai Jurus &nbsp;|&nbsp; Kolom ungu = Nilai Teori &nbsp;|&nbsp; 🔒 = tidak bisa diedit (lewat 15 menit)</p>
    </div>
  );
}
