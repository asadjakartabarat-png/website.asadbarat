'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Kelompok { id: number; nama_kelompok: string; target_putra: number; target_putri: number; nama_desa: string; desa_id: number; }
interface AbsensiRow { kelompok_id: number; hadir_putra: number; hadir_putri: number; }

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function InputAbsensiClient({ session }: { session: any }) {
  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [kelompok, setKelompok] = useState<Kelompok[]>([]);
  const [absensi, setAbsensi] = useState<Record<number, AbsensiRow>>({});
  const [saving, setSaving] = useState<number | null>(null);

  const loadKelompok = async () => {
    const params = session.role === 'koordinator_desa' && session.desa_id ? `?desa_id=${session.desa_id}` : '';
    const res = await fetch(`/api/absensi/kelompok${params}`);
    const data = await res.json();
    setKelompok(data.data || []);
  };

  const loadAbsensi = async () => {
    const params = session.role === 'koordinator_desa' && session.desa_id
      ? `?bulan=${bulan}&tahun=${tahun}&desa_id=${session.desa_id}`
      : `?bulan=${bulan}&tahun=${tahun}`;
    const res = await fetch(`/api/absensi/data${params}`);
    const data = await res.json();
    const map: Record<number, AbsensiRow> = {};
    (data.data || []).forEach((r: any) => {
      map[Number(r.kelompok_id)] = { kelompok_id: Number(r.kelompok_id), hadir_putra: Number(r.hadir_putra), hadir_putri: Number(r.hadir_putri) };
    });
    setAbsensi(map);
  };

  useEffect(() => { loadKelompok(); }, []);
  useEffect(() => { loadAbsensi(); }, [bulan, tahun]);

  const handleSave = async (k: Kelompok) => {
    setSaving(k.id);
    const row = absensi[k.id] || { kelompok_id: k.id, hadir_putra: 0, hadir_putri: 0 };
    const res = await fetch('/api/absensi/data', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelompok_id: k.id, bulan, tahun, hadir_putra: row.hadir_putra, hadir_putri: row.hadir_putri }),
    });
    if (res.ok) { toast.success(`${k.nama_kelompok} disimpan`); } else { toast.error('Gagal menyimpan'); }
    setSaving(null);
  };

  const setHadir = (k: Kelompok, field: 'hadir_putra' | 'hadir_putri', val: number) => {
    const row = absensi[k.id] || { kelompok_id: k.id, hadir_putra: 0, hadir_putri: 0 };
    setAbsensi(p => ({ ...p, [k.id]: { ...row, [field]: val } }));
  };

  const grouped = kelompok.reduce((acc, k) => {
    if (!acc[k.nama_desa]) acc[k.nama_desa] = [];
    acc[k.nama_desa].push(k);
    return acc;
  }, {} as Record<string, Kelompok[]>);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Input Absensi</h1>

      {/* Filter Periode */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
          <select value={bulan} onChange={e => setBulan(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm min-h-[44px]">
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
          <select value={tahun} onChange={e => setTahun(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm min-h-[44px]">
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {Object.entries(grouped).map(([desaName, kelompokList]) => (
        <div key={desaName} className="bg-white rounded-xl shadow overflow-hidden">
          <div className="bg-green-700 text-white px-4 py-3 font-semibold text-sm">{desaName}</div>

          {/* Mobile: card per kelompok */}
          <div className="md:hidden divide-y">
            {kelompokList.map(k => {
              const row = absensi[k.id] || { kelompok_id: k.id, hadir_putra: 0, hadir_putri: 0 };
              return (
                <div key={k.id} className="p-4 space-y-3">
                  <p className="font-semibold text-gray-800">{k.nama_kelompok}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 font-medium mb-1">Putra (Target: {k.target_putra})</p>
                      <input type="number" inputMode="numeric" min="0" max={k.target_putra}
                        value={row.hadir_putra}
                        onChange={e => setHadir(k, 'hadir_putra', Number(e.target.value))}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div className="bg-pink-50 rounded-lg p-3">
                      <p className="text-xs text-pink-600 font-medium mb-1">Putri (Target: {k.target_putri})</p>
                      <input type="number" inputMode="numeric" min="0" max={k.target_putri}
                        value={row.hadir_putri}
                        onChange={e => setHadir(k, 'hadir_putri', Number(e.target.value))}
                        className="w-full border border-pink-200 rounded-lg px-3 py-2 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-pink-400" />
                    </div>
                  </div>
                  <button onClick={() => handleSave(k)} disabled={saving === k.id}
                    className="w-full bg-green-700 text-white py-3 rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-50 min-h-[44px]">
                    {saving === k.id ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop: tabel */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">Kelompok</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Target Putra</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Hadir Putra</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Target Putri</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Hadir Putri</th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {kelompokList.map(k => {
                const row = absensi[k.id] || { kelompok_id: k.id, hadir_putra: 0, hadir_putri: 0 };
                return (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{k.nama_kelompok}</td>
                    <td className="px-4 py-2 text-center text-gray-500">{k.target_putra}</td>
                    <td className="px-4 py-2 text-center">
                      <input type="number" min="0" max={k.target_putra} value={row.hadir_putra}
                        onChange={e => setHadir(k, 'hadir_putra', Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-center text-sm" />
                    </td>
                    <td className="px-4 py-2 text-center text-gray-500">{k.target_putri}</td>
                    <td className="px-4 py-2 text-center">
                      <input type="number" min="0" max={k.target_putri} value={row.hadir_putri}
                        onChange={e => setHadir(k, 'hadir_putri', Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-center text-sm" />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => handleSave(k)} disabled={saving === k.id}
                        className="bg-green-700 text-white px-3 py-1 rounded text-xs hover:bg-green-800 disabled:opacity-50">
                        {saving === k.id ? '...' : 'Simpan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {kelompok.length === 0 && <p className="text-center text-gray-400 py-12">Belum ada kelompok. Tambahkan di Master Data.</p>}
    </div>
  );
}
