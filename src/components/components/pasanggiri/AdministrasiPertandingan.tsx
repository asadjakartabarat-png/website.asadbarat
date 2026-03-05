'use client';

import { useState, useEffect } from 'react';
import { PasanggiriDesa, GOLONGAN_LIST, KATEGORI_LIST } from '@/types/pasanggiri';
import ModalPeserta from './ModalPeserta';
import PesertaTerdaftarTab from './PesertaTerdaftarTab';

interface Props {
  userRole: string;
  userId: string;
}

export default function AdministrasiPertandingan({ userRole, userId }: Props) {
  const [activeTab, setActiveTab] = useState<'PUTRA' | 'PUTRI' | 'PESERTA'>('PUTRA');
  const [selectedKategori, setSelectedKategori] = useState('PERORANGAN');
  const [eventStatus, setEventStatus] = useState<any>(null);
  const [undianData, setUndianData] = useState<any[]>([]);
  const [desaList, setDesaList] = useState<PasanggiriDesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUndian, setSelectedUndian] = useState<any>(null);
  const [addDesaModal, setAddDesaModal] = useState<{ kategori: string; golongan: string } | null>(null);
  const [selectedDesaId, setSelectedDesaId] = useState('');

  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  const canEdit = isAdmin && !eventStatus?.is_locked;

  useEffect(() => {
    fetchData();
    fetch('/api/pasanggiri/desa').then(r => r.json()).then(setDesaList);
  }, [activeTab]);

  const fetchData = async () => {
    if (activeTab === 'PESERTA') { setLoading(false); return; }
    setLoading(true);
    try {
      const [statusRes, undianRes] = await Promise.all([
        fetch(`/api/pasanggiri/event-status?kelas=${activeTab}`),
        fetch(`/api/pasanggiri/undian?kelas=${activeTab}`),
      ]);
      const statusData = await statusRes.json();
      const undianDataRes = await undianRes.json();
      setEventStatus(statusData[0] || { kelas: activeTab, is_locked: false });
      setUndianData(undianDataRes);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleLockEvent = async () => {
    if (!confirm(`${eventStatus?.is_locked ? 'Unlock' : 'Lock'} event ${activeTab}?`)) return;
    try {
      await fetch('/api/pasanggiri/event-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelas: activeTab, is_locked: !eventStatus?.is_locked, locked_by: userId }),
      });
      fetchData();
    } catch (error) { console.error(error); }
  };

  const handleAddDesa = (kategori: string, golongan: string) => {
    const existingDesas = undianData.filter(u => u.kategori === kategori && u.golongan === golongan).map(u => u.desa || u.nama_desa);
    const availableDesas = desaList.filter(d => !existingDesas.includes(d.nama_desa));
    if (availableDesas.length === 0) { alert('Semua desa sudah ditambahkan!'); return; }
    setSelectedDesaId('');
    setAddDesaModal({ kategori, golongan });
  };

  const handleConfirmAddDesa = async () => {
    if (!addDesaModal || !selectedDesaId) return;
    const { kategori, golongan } = addDesaModal;
    const selectedDesa = desaList.find(d => String(d.id) === selectedDesaId);
    if (!selectedDesa) return;

    const nextUrutan = Math.max(0, ...undianData.filter(u => u.kategori === kategori && u.golongan === golongan).map(u => u.urutan)) + 1;
    setAddDesaModal(null);
    try {
      const pesertaRes = await fetch('/api/pasanggiri/peserta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_peserta: selectedDesa.nama_desa, desa_id: selectedDesa.id, kategori, golongan, kelas: activeTab }),
      });
      const peserta = await pesertaRes.json();
      await fetch('/api/pasanggiri/undian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peserta_id: peserta.id, kategori, golongan, kelas: activeTab, urutan: nextUrutan }),
      });
      fetchData();
    } catch (error) { console.error(error); alert('Error: Terjadi kesalahan'); }
  };

  const handleDeleteUndian = async (id: string) => {
    if (!confirm('Hapus desa dari undian?')) return;
    try {
      await fetch(`/api/pasanggiri/undian?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) { console.error(error); }
  };

  const getUndianByKategoriGolongan = (kategori: string, golongan: string) =>
    undianData.filter(u => u.kategori === kategori && u.golongan === golongan).sort((a, b) => a.urutan - b.urutan);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Administrasi Pertandingan</h2>
          {isAdmin && activeTab !== 'PESERTA' && (
            <button onClick={handleLockEvent} className={`px-4 py-2 rounded font-semibold ${eventStatus?.is_locked ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
              {eventStatus?.is_locked ? '🔓 Unlock Event' : '🔒 Lock Event'}
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {(['PUTRA', 'PUTRI', 'PESERTA'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded font-semibold ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {tab === 'PESERTA' ? '📋 Peserta Terdaftar' : tab}
            </button>
          ))}
        </div>

        {activeTab !== 'PESERTA' && (
          <div className={`p-4 rounded ${eventStatus?.is_locked ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'}`}>
            <p className="font-semibold text-gray-900">Status Event: {eventStatus?.is_locked ? '🔴 EVENT BERJALAN (LOCKED)' : '🟢 BELUM DIMULAI'}</p>
            {eventStatus?.is_locked && <p className="text-sm text-gray-600 mt-1">⚠️ Data tidak dapat diubah selama event berjalan</p>}
          </div>
        )}
      </div>

      {activeTab === 'PESERTA' && (
        <div className="space-y-4">
          <PesertaTerdaftarTab kelas="PUTRA" isLocked={eventStatus?.is_locked || false} canEdit={canEdit} onUpdate={fetchData} />
          <div className="border-t-4 border-gray-300 my-8"></div>
          <PesertaTerdaftarTab kelas="PUTRI" isLocked={eventStatus?.is_locked || false} canEdit={canEdit} onUpdate={fetchData} />
        </div>
      )}

      {activeTab !== 'PESERTA' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Kategori:</h3>
            <div className="flex gap-2 flex-wrap">
              {KATEGORI_LIST.map(k => (
                <button key={k} onClick={() => setSelectedKategori(k)} className={`px-4 py-2 rounded-lg font-medium text-sm ${selectedKategori === k ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {GOLONGAN_LIST.map(golongan => {
              const undianList = getUndianByKategoriGolongan(selectedKategori, golongan);
              return (
                <div key={`${selectedKategori}-${golongan}`} className="card">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">📋 {selectedKategori} ({golongan})</h3>
                  {undianList.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-3">Belum ada peserta</p>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {undianList.map(undian => (
                        <div key={undian.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900">{undian.urutan}.</span>
                            <button onClick={() => { setSelectedUndian(undian); setModalOpen(true); }} className="text-red-600 hover:underline font-semibold">
                              {undian.desa || undian.nama_desa}
                            </button>
                          </div>
                          {canEdit && (
                            <button onClick={() => handleDeleteUndian(undian.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {canEdit && (
                    <button onClick={() => handleAddDesa(selectedKategori, golongan)} className="text-red-600 hover:underline text-sm font-semibold">
                      + Tambah Desa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {addDesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">Tambah Desa</h3>
            <p className="text-sm text-gray-600 mb-2">{addDesaModal.kategori} — {addDesaModal.golongan}</p>
            <select
              value={selectedDesaId}
              onChange={e => setSelectedDesaId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">-- Pilih Desa --</option>
              {desaList
                .filter(d => !undianData.filter(u => u.kategori === addDesaModal.kategori && u.golongan === addDesaModal.golongan).map(u => u.desa || u.nama_desa).includes(d.nama_desa))
                .map(d => <option key={d.id} value={d.id}>{d.nama_desa}</option>)
              }
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddDesaModal(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm">Batal</button>
              <button onClick={handleConfirmAddDesa} disabled={!selectedDesaId} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50">Tambah</button>
            </div>
          </div>
        </div>
      )}

      {selectedUndian && (
        <ModalPeserta
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedUndian(null); }}
          undianId={selectedUndian.id}
          desa={selectedUndian.desa || selectedUndian.nama_desa}
          kategori={selectedUndian.kategori}
          golongan={selectedUndian.golongan}
          kelas={selectedUndian.kelas}
          isLocked={eventStatus?.is_locked || false}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
