'use client';

import { useState, useEffect } from 'react';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function statusColor(p: number) {
  if (p >= 90) return 'bg-green-100 text-green-800';
  if (p >= 80) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}
function statusLabel(p: number) { return p >= 90 ? 'Sangat Baik' : p >= 80 ? 'Baik' : 'Perlu Perbaikan'; }

export default function LaporanClient() {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<any[]>([]);
  const [selectedDesa, setSelectedDesa] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/absensi/laporan?bulan=${bulan}&tahun=${tahun}`);
    const json = await res.json();
    setData(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [bulan, tahun]);

  const handleDesaClick = async (desaName: string) => {
    setSelectedDesa(desaName); setModalOpen(true); setDetailLoading(true);
    const res = await fetch(`/api/absensi/laporan/detail?desa=${encodeURIComponent(desaName)}&bulan=${bulan}&tahun=${tahun}`);
    const json = await res.json();
    setDetail(json.data || []);
    setDetailLoading(false);
  };

  const handlePrint = () => window.print();

  const totalTargetPutra = data.reduce((s, r) => s + Number(r.total_target_putra), 0);
  const totalHadirPutra = data.reduce((s, r) => s + Number(r.total_hadir_putra), 0);
  const totalTargetPutri = data.reduce((s, r) => s + Number(r.total_target_putri), 0);
  const totalHadirPutri = data.reduce((s, r) => s + Number(r.total_hadir_putri), 0);
  const pctPutra = totalTargetPutra > 0 ? Math.round((totalHadirPutra / totalTargetPutra) * 1000) / 10 : 0;
  const pctPutri = totalTargetPutri > 0 ? Math.round((totalHadirPutri / totalTargetPutri) * 1000) / 10 : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Kehadiran</h1>
        <button onClick={handlePrint} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Print</button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
          <select value={bulan} onChange={e => setBulan(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
          <select value={tahun} onChange={e => setTahun(Number(e.target.value))} className="border rounded-lg px-3 py-2 text-sm">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[['Total Target Putra', totalTargetPutra], ['Hadir Putra', totalHadirPutra], ['Total Target Putri', totalTargetPutri], ['Hadir Putri', totalHadirPutri]].map(([label, val]) => (
          <div key={label as string} className="bg-white rounded-xl shadow p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{val}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Desa</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Kelompok</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Target Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Hadir Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">% Putra</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Target Putri</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Hadir Putri</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">% Putri</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((r: any, i: number) => {
                const pp = Number(r.total_target_putra) > 0 ? Math.round((Number(r.total_hadir_putra) / Number(r.total_target_putra)) * 1000) / 10 : 0;
                const pq = Number(r.total_target_putri) > 0 ? Math.round((Number(r.total_hadir_putri) / Number(r.total_target_putri)) * 1000) / 10 : 0;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button onClick={() => handleDesaClick(r.nama_desa)} className="text-green-700 hover:underline font-medium">{r.nama_desa}</button>
                    </td>
                    <td className="px-4 py-3 text-center">{Number(r.total_kelompok)}</td>
                    <td className="px-4 py-3 text-center">{Number(r.total_target_putra)}</td>
                    <td className="px-4 py-3 text-center">{Number(r.total_hadir_putra)}</td>
                    <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(pp)}`}>{pp}%</span></td>
                    <td className="px-4 py-3 text-center">{Number(r.total_target_putri)}</td>
                    <td className="px-4 py-3 text-center">{Number(r.total_hadir_putri)}</td>
                    <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(pq)}`}>{pq}%</span></td>
                  </tr>
                );
              })}
            </tbody>
            {data.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 font-bold">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 text-center">{data.reduce((s, r) => s + Number(r.total_kelompok), 0)}</td>
                  <td className="px-4 py-3 text-center">{totalTargetPutra}</td>
                  <td className="px-4 py-3 text-center">{totalHadirPutra}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(pctPutra)}`}>{pctPutra}%</span></td>
                  <td className="px-4 py-3 text-center">{totalTargetPutri}</td>
                  <td className="px-4 py-3 text-center">{totalHadirPutri}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(pctPutri)}`}>{pctPutri}%</span></td>
                </tr>
              </tfoot>
            )}
          </table>
          {data.length === 0 && <p className="text-center text-gray-400 py-8">Belum ada data untuk periode ini</p>}
        </div>
      )}

      {/* Modal Detail */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-bold">Detail {selectedDesa} — {MONTHS[bulan-1]} {tahun}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-4">
              {detailLoading ? <p className="text-center py-8 text-gray-400">Memuat...</p> : (
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-50">
                    <tr>{['Kelompok','Target Putra','Hadir Putra','Target Putri','Hadir Putri','Total Target','Total Hadir','%'].map(h => <th key={h} className="border px-3 py-2 text-center font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {detail.map((d: any, i: number) => {
                      const pct = d.total_target > 0 ? Math.round((d.total_hadir / d.total_target) * 1000) / 10 : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border px-3 py-2 font-medium">{d.kelompok}</td>
                          <td className="border px-3 py-2 text-center">{d.target_putra}</td>
                          <td className="border px-3 py-2 text-center">{d.hadir_putra}</td>
                          <td className="border px-3 py-2 text-center">{d.target_putri}</td>
                          <td className="border px-3 py-2 text-center">{d.hadir_putri}</td>
                          <td className="border px-3 py-2 text-center font-bold">{d.total_target}</td>
                          <td className="border px-3 py-2 text-center font-bold">{d.total_hadir}</td>
                          <td className="border px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${statusColor(pct)}`}>{pct}%</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {detail.length > 0 && (
                    <tfoot className="bg-gray-50 font-bold">
                      <tr>
                        <td className="border px-3 py-2">TOTAL</td>
                        <td className="border px-3 py-2 text-center">{detail.reduce((s, d) => s + d.target_putra, 0)}</td>
                        <td className="border px-3 py-2 text-center">{detail.reduce((s, d) => s + d.hadir_putra, 0)}</td>
                        <td className="border px-3 py-2 text-center">{detail.reduce((s, d) => s + d.target_putri, 0)}</td>
                        <td className="border px-3 py-2 text-center">{detail.reduce((s, d) => s + d.hadir_putri, 0)}</td>
                        <td className="border px-3 py-2 text-center">{detail.reduce((s, d) => s + d.total_target, 0)}</td>
                        <td className="border px-3 py-2 text-center">{detail.reduce((s, d) => s + d.total_hadir, 0)}</td>
                        <td className="border px-3 py-2 text-center">
                          {(() => { const tt = detail.reduce((s, d) => s + d.total_target, 0); const th = detail.reduce((s, d) => s + d.total_hadir, 0); return tt > 0 ? Math.round((th/tt)*1000)/10 : 0; })()}%
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
