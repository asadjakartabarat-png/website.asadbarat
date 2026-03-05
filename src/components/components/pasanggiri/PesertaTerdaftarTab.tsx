'use client';

import { useState, useEffect } from 'react';
import { KATEGORI_LIST, GOLONGAN_LIST } from '@/types/pasanggiri';

interface Props {
  kelas: 'PUTRA' | 'PUTRI';
  isLocked: boolean;
  canEdit: boolean;
  onUpdate: () => void;
}

interface GroupedData {
  kategori: string;
  golongan: string;
  desas: { id: string; desa: string; count: number }[];
  totalPeserta: number;
}

export default function PesertaTerdaftarTab({ kelas, isLocked, canEdit, onUpdate }: Props) {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [undianData, setUndianData] = useState<any[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedDetail, setSelectedDetail] = useState<any>(null);

  useEffect(() => { fetchData(); }, [kelas]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pasanggiri/undian?kelas=${kelas}`);
      const data = await res.json();
      setUndianData(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const groupedData: GroupedData[] = KATEGORI_LIST.flatMap(kategori =>
    GOLONGAN_LIST.map(golongan => {
      const filtered = undianData.filter(u => u.kategori === kategori && u.golongan === golongan);
      if (filtered.length === 0) return null;
      const desas = filtered.map(u => ({ id: u.id, desa: u.desa || u.nama_desa, count: u.peserta?.length || 0 }));
      return { kategori, golongan, desas, totalPeserta: desas.reduce((s, d) => s + d.count, 0) };
    }).filter(Boolean)
  ).filter(Boolean) as GroupedData[];

  const filteredData = groupedData.filter(g => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.kategori.toLowerCase().includes(q) || g.golongan.toLowerCase().includes(q) || g.desas.some(d => d.desa.toLowerCase().includes(q));
  });

  const totalPeserta = groupedData.reduce((s, g) => s + g.totalPeserta, 0);

  const toggleCategory = (key: string) => {
    const next = new Set(expandedCategories);
    next.has(key) ? next.delete(key) : next.add(key);
    setExpandedCategories(next);
  };

  const handleDelete = async (undianId: string) => {
    if (!confirm('Hapus desa dari undian?')) return;
    try {
      await fetch(`/api/pasanggiri/undian?id=${undianId}`, { method: 'DELETE' });
      fetchData(); onUpdate();
    } catch (error) { console.error(error); }
  };

  const handleViewDetail = async (undianId: string, desa: string) => {
    try {
      const res = await fetch(`/api/pasanggiri/peserta?undian_id=${undianId}`);
      const peserta = await res.json();
      setSelectedDetail({ desa, peserta });
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  if (groupedData.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Peserta Terdaftar</h3>
        <p className="text-gray-600">Belum ada peserta terdaftar untuk kelas {kelas}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card bg-red-600">
        <h2 className="text-2xl font-bold text-white text-center">{kelas === 'PUTRA' ? '👨 KELAS PUTRA' : '👩 KELAS PUTRI'}</h2>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <input type="text" placeholder="🔍 Cari kategori, golongan, atau desa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg" />
          <div className="flex gap-2">
            <button onClick={() => setViewMode('card')} className={`px-4 py-2 rounded font-semibold ${viewMode === 'card' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>📋 Card</button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded font-semibold ${viewMode === 'table' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>📊 Table</button>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm">
          <span className="text-gray-600">📊 <strong>{totalPeserta}</strong> peserta</span>
          <span className="text-gray-600">📋 <strong>{groupedData.length}</strong> kategori</span>
        </div>
      </div>

      {viewMode === 'card' && (
        <div className="space-y-4">
          {filteredData.map(group => {
            const key = `${group.kategori}-${group.golongan}`;
            const isExpanded = expandedCategories.has(key);
            return (
              <div key={key} className="card">
                <button onClick={() => toggleCategory(key)} className="w-full flex justify-between items-center text-left">
                  <h3 className="text-lg font-semibold text-gray-900">📋 {group.kategori} - {group.golongan} <span className="text-sm text-gray-600">({group.totalPeserta} peserta)</span></h3>
                  <span className="text-2xl">{isExpanded ? '▼' : '▶'}</span>
                </button>
                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {group.desas.map((desa, idx) => (
                      <div key={desa.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-gray-900">{idx + 1}. </span>
                            <span className="text-lg font-semibold text-gray-900">🏘️ {desa.desa}</span>
                            <p className="text-sm text-gray-600 mt-1">👤 {desa.count} peserta</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleViewDetail(desa.id, desa.desa)} className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded">👁️ Detail</button>
                            {canEdit && !isLocked && (
                              <button onClick={() => handleDelete(desa.id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">🗑️ Hapus</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'table' && (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 text-gray-900">Kategori</th>
                <th className="text-left py-3 px-4 text-gray-900">Desa</th>
                <th className="text-center py-3 px-4 text-gray-900">Peserta</th>
                <th className="text-center py-3 px-4 text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(group =>
                group.desas.map((desa, idx) => (
                  <tr key={desa.id} className="border-b border-gray-200 hover:bg-gray-50">
                    {idx === 0 && (
                      <td rowSpan={group.desas.length} className="py-3 px-4 font-semibold text-gray-900 align-top">
                        📋 {group.kategori}<br /><span className="text-sm text-gray-600">{group.golongan}</span>
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-900">🏘️ {desa.desa}</td>
                    <td className="py-3 px-4 text-center text-gray-900">👤 {desa.count}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleViewDetail(desa.id, desa.desa)} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded">👁️</button>
                        {canEdit && !isLocked && (
                          <button onClick={() => handleDelete(desa.id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded">🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDetail(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Detail Peserta - {selectedDetail.desa}</h3>
            {selectedDetail.peserta.length === 0 ? (
              <p className="text-gray-600">Belum ada peserta</p>
            ) : (
              <div className="space-y-2">
                {selectedDetail.peserta.map((p: any, idx: number) => (
                  <div key={p.id} className="p-3 bg-gray-50 rounded">
                    <p className="font-semibold text-gray-900">{idx + 1}. {p.nama_peserta}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setSelectedDetail(null)} className="mt-4 w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
