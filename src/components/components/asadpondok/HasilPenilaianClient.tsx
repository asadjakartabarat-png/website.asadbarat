'use client';

import { useState, useEffect } from 'react';

interface HasilItem {
  id: number; nama: string; kelas: string;
  total_jurus: number; total_teori: number; total_nilai: number;
  status: { lengkap: boolean; pengujiDone: number; pengujiTotal: number };
}

export default function HasilPenilaianClient() {
  const [hasil, setHasil] = useState<HasilItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('PUTRA');

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/asadpondok/hasil?kelas=${filterKelas}`);
    const data = await res.json();
    setHasil(data.hasil || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterKelas]);

  const putra = hasil.filter(h => h.kelas === 'PUTRA').sort((a, b) => b.total_nilai - a.total_nilai);
  const putri = hasil.filter(h => h.kelas === 'PUTRI').sort((a, b) => b.total_nilai - a.total_nilai);
  const displayed = filterKelas === 'PUTRA' ? putra : putri;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Hasil Penilaian</h2>
        <button onClick={load} className="text-sm text-green-600 hover:underline">🔄 Refresh</button>
      </div>

      <div className="flex gap-2 mb-4">
        {['PUTRA', 'PUTRI'].map(k => (
          <button key={k} onClick={() => setFilterKelas(k)}
            className={`px-4 py-2 rounded text-sm font-medium ${filterKelas === k ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'}`}>
            {k}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat...</div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rank</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Jurus</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Teori</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayed.map((h, i) => (
                <tr key={h.id} className={`hover:bg-gray-50 ${i < 3 ? 'font-medium' : ''}`}>
                  <td className="px-4 py-3">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-500">{i + 1}</span>}
                  </td>
                  <td className="px-4 py-3">{h.nama}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{h.total_jurus.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{h.total_teori.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{h.total_nilai.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {h.status.pengujiTotal === 0 ? (
                      <span className="text-gray-400 text-xs">-</span>
                    ) : h.status.lengkap ? (
                      <span className="text-green-600 text-xs font-medium">✅ LENGKAP</span>
                    ) : (
                      <span className="text-amber-600 text-xs">⏳ {h.status.pengujiDone}/{h.status.pengujiTotal}</span>
                    )}
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Belum ada data penilaian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
