'use client';

import { useState, useEffect } from 'react';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
function statusColor(p: number) { return p >= 90 ? 'bg-green-100 text-green-800' : p >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'; }
function statusLabel(p: number) { return p >= 90 ? 'Sangat Baik' : p >= 80 ? 'Baik' : 'Perlu Perbaikan'; }

export default function LaporanDKIClient() {
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/absensi/laporan-dki?tahun=${tahun}`).then(r => r.json()).then(j => { setData(j.data || []); setLoading(false); });
  }, [tahun]);

  const avgPutra = data.length ? Math.round(data.reduce((s, r) => s + r.persentase_putra, 0) / data.length * 10) / 10 : 0;
  const avgPutri = data.length ? Math.round(data.reduce((s, r) => s + r.persentase_putri, 0) / data.length * 10) / 10 : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Laporan DKI Jakarta</h1>
        <button onClick={() => window.print()} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Print</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
        <select value={tahun} onChange={e => setTahun(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Rata-rata Putra</p>
          <p className="text-2xl font-bold text-blue-600">{avgPutra}%</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-xs text-gray-500">Rata-rata Putri</p>
          <p className="text-2xl font-bold text-pink-600">{avgPutri}%</p>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Memuat...</div> : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Bulan</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">% Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">% Putri</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Status Putri</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Target Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Hadir Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Target Putri</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Hadir Putri</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((r: any) => (
                <tr key={r.bulan} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.nama_bulan}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">{r.persentase_putra}%</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${statusColor(r.persentase_putra)}`}>{statusLabel(r.persentase_putra)}</span></td>
                  <td className="px-4 py-3 text-center font-bold text-pink-600">{r.persentase_putri}%</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${statusColor(r.persentase_putri)}`}>{statusLabel(r.persentase_putri)}</span></td>
                  <td className="px-4 py-3 text-center">{r.total_target_putra}</td>
                  <td className="px-4 py-3 text-center">{r.total_hadir_putra}</td>
                  <td className="px-4 py-3 text-center">{r.total_target_putri}</td>
                  <td className="px-4 py-3 text-center">{r.total_hadir_putri}</td>
                </tr>
              ))}
            </tbody>
            {data.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 font-bold">
                <tr>
                  <td className="px-4 py-3">RATA-RATA</td>
                  <td className="px-4 py-3 text-center text-blue-600">{avgPutra}%</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${statusColor(avgPutra)}`}>{statusLabel(avgPutra)}</span></td>
                  <td className="px-4 py-3 text-center text-pink-600">{avgPutri}%</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs ${statusColor(avgPutri)}`}>{statusLabel(avgPutri)}</span></td>
                  <td className="px-4 py-3 text-center">{data.reduce((s, r) => s + r.total_target_putra, 0)}</td>
                  <td className="px-4 py-3 text-center">{data.reduce((s, r) => s + r.total_hadir_putra, 0)}</td>
                  <td className="px-4 py-3 text-center">{data.reduce((s, r) => s + r.total_target_putri, 0)}</td>
                  <td className="px-4 py-3 text-center">{data.reduce((s, r) => s + r.total_hadir_putri, 0)}</td>
                </tr>
              </tfoot>
            )}
          </table>
          {data.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada data untuk tahun {tahun}</p>}
        </div>
      )}
    </div>
  );
}
