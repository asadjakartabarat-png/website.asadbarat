'use client';

import { useState, useEffect } from 'react';

interface HasilItem {
  id: number; nama: string; kelas: string;
  total_jurus: number; total_teori: number; total_nilai: number;
  status: { lengkap: boolean; pengujiDone: number; pengujiTotal: number };
  penguji_nama?: string;
}

function fmt(n: number) { return n % 1 === 0 ? n : n.toFixed(1); }

function buildPrintHtml(putra: HasilItem[], putri: HasilItem[]) {
  const tableRows = (list: HasilItem[]) => list.map((h, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${h.nama}</td>
      <td>${h.penguji_nama || '-'}</td>
      <td>${fmt(h.total_jurus)}</td>
      <td>${fmt(h.total_teori)}</td>
      <td><strong>${fmt(h.total_nilai)}</strong></td>
      <td>${h.status.pengujiTotal === 0 ? '-' : h.status.lengkap ? 'LENGKAP' : 'Proses'}</td>
    </tr>`).join('');

  const table = (title: string, list: HasilItem[]) => `
    <h2>${title}</h2>
    <table>
      <thead><tr><th>Rank</th><th>Nama</th><th>Penguji</th><th>Jurus</th><th>Teori</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${tableRows(list)}</tbody>
    </table>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Hasil Penilaian Asad Pondok</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
      h1 { text-align: center; font-size: 16px; margin-bottom: 4px; }
      h2 { font-size: 13px; margin: 20px 0 6px; color: #166534; }
      p.sub { text-align: center; font-size: 11px; color: #555; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
      th { background: #f3f4f6; }
      td:nth-child(4), td:nth-child(5), td:nth-child(6) { text-align: right; }
      @media print { body { margin: 10mm; } }
    </style>
  </head><body>
    <h1>Hasil Penilaian Asad Pondok</h1>
    <p class="sub">Persinas Asad Jakarta Barat</p>
    ${table('PUTRA', putra)}
    ${table('PUTRI', putri)}
  </body></html>`;
}

export default function HasilPenilaianClient() {
  const [putra, setPutra] = useState<HasilItem[]>([]);
  const [putri, setPutri] = useState<HasilItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('PUTRA');
  const [printing, setPrinting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [resPutra, resPutri] = await Promise.all([
      fetch('/api/asadpondok/hasil?kelas=PUTRA'),
      fetch('/api/asadpondok/hasil?kelas=PUTRI'),
    ]);
    const [dataPutra, dataPutri] = await Promise.all([resPutra.json(), resPutri.json()]);
    setPutra((dataPutra.hasil || []).sort((a: HasilItem, b: HasilItem) => b.total_nilai - a.total_nilai));
    setPutri((dataPutri.hasil || []).sort((a: HasilItem, b: HasilItem) => b.total_nilai - a.total_nilai));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePrint = async () => {
    setPrinting(true);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(buildPrintHtml(putra, putri));
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); setPrinting(false); }, 300);
    } else {
      setPrinting(false);
    }
  };

  const displayed = filterKelas === 'PUTRA' ? putra : putri;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Hasil Penilaian</h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} disabled={printing || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            🖨️ {printing ? 'Menyiapkan...' : 'Print PDF'}
          </button>
          <button onClick={load} className="text-sm text-green-600 hover:underline">🔄 Refresh</button>
        </div>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Penguji</th>
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
                  <td className="px-4 py-3 text-gray-600 text-xs">{h.penguji_nama || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(h.total_jurus)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(h.total_teori)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{fmt(h.total_nilai)}</td>
                  <td className="px-4 py-3 text-center">
                    {h.status.pengujiTotal === 0 ? (
                      <span className="text-gray-400 text-xs">-</span>
                    ) : h.status.lengkap ? (
                      <span className="text-green-600 text-xs font-medium">✅ LENGKAP</span>
                    ) : (
                      <span className="text-amber-600 text-xs">⏳ Proses</span>
                    )}
                  </td>
                </tr>
              ))}
              {displayed.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Belum ada data penilaian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
