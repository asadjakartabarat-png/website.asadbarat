'use client';

import { useState, useEffect } from 'react';
import { User, Competition, PasanggiriDesa, GOLONGAN_LIST, KATEGORI_LIST } from '@/types/pasanggiri';
import ResultsView from './ResultsView';

interface Props {
  user: User;
  activeTab?: string;
}

export default function SirkulatorDashboard({ user, activeTab = 'control' }: Props) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [desaList, setDesaList] = useState<PasanggiriDesa[]>([]);
  const [creatingCompetition, setCreatingCompetition] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const kelas = user.role === 'SIRKULATOR_PUTRA' ? 'PUTRA' : 'PUTRI';

  useEffect(() => {
    fetch(`/api/pasanggiri/competitions?kelas=${kelas}`).then(r => r.json()).then(setCompetitions).catch(console.error);
    fetch('/api/pasanggiri/desa').then(r => r.json()).then(setDesaList).catch(console.error);
  }, [kelas]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message); setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const createCompetition = async (desa: PasanggiriDesa, golongan: string, kategori: string) => {
    const key = `${desa.nama_desa}-${golongan}-${kategori}-${kelas}`;
    const existing = competitions.find(c => c.desa === desa.nama_desa && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas);
    if (existing) { showToast(`⚠️ Sesi ${desa.nama_desa} - ${kategori} sudah ada`, 'info'); return; }

    setCreatingCompetition(key);
    try {
      const res = await fetch('/api/pasanggiri/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ desa_id: desa.id, kelas, golongan, kategori }),
      });
      if (res.ok) {
        const newComp = await res.json();
        setCompetitions(prev => [...prev, newComp]);
        showToast(`✅ Sesi ${desa.nama_desa} - ${kategori} berhasil dibuat!`, 'success');
      } else {
        showToast(`❌ Gagal membuat sesi`, 'error');
      }
    } catch { showToast(`❌ Gagal membuat sesi`, 'error'); }
    finally { setCreatingCompetition(null); }
  };

  const isCompetitionCreated = (desaNama: string, golongan: string, kategori: string) =>
    competitions.some(c => c.desa === desaNama && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas);

  const toggleCompetitionStatus = async (competition: Competition) => {
    const newStatus = competition.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/pasanggiri/competitions/${competition.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setCompetitions(competitions.map(c => c.id === competition.id ? { ...c, status: newStatus } : c));
    } catch (error) { console.error(error); }
  };

  const deleteCompetition = async (id: string) => {
    if (!confirm('Yakin ingin menghapus sesi ini?')) return;
    try {
      const res = await fetch(`/api/pasanggiri/competitions?id=${id}`, { method: 'DELETE' });
      if (res.ok) setCompetitions(competitions.filter(c => c.id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${toastType === 'success' ? 'bg-green-500' : toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          {toastMessage}
        </div>
      )}

      {activeTab === 'control' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Buat Sesi Pertandingan Baru - {kelas}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {desaList.map(desa => (
                <div key={desa.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium mb-3 text-gray-900">{desa.nama_desa}</h3>
                  {GOLONGAN_LIST.map(golongan => (
                    <div key={golongan} className="mb-3">
                      <p className="text-sm font-medium text-gray-600 mb-2">{golongan}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {KATEGORI_LIST.map(kategori => {
                          const isCreated = isCompetitionCreated(desa.nama_desa, golongan, kategori);
                          const isCreating = creatingCompetition === `${desa.nama_desa}-${golongan}-${kategori}-${kelas}`;
                          return (
                            <button key={kategori} onClick={() => createCompetition(desa, golongan, kategori)} disabled={isCreated || isCreating}
                              className={`text-xs px-2 py-1 rounded font-medium ${isCreated ? 'bg-green-100 text-green-800 cursor-not-allowed' : isCreating ? 'bg-yellow-100 text-yellow-800 cursor-wait' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}>
                              {isCreated ? '✅ CREATED' : isCreating ? '⏳...' : kategori}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Sesi Aktif</h2>
            {competitions.length === 0 ? (
              <p className="text-gray-500">Belum ada sesi pertandingan</p>
            ) : (
              <div className="space-y-3">
                {competitions.map(competition => (
                  <div key={competition.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{competition.desa} - {competition.kategori}</p>
                        <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${competition.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {competition.status}
                        </span>
                        <button onClick={() => toggleCompetitionStatus(competition)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-medium">
                          {competition.status === 'ACTIVE' ? 'Selesai' : 'Aktifkan'}
                        </button>
                        <button onClick={() => deleteCompetition(competition.id)} className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium">Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Hasil Pertandingan - {kelas}</h2>
          <ResultsView kelas={kelas} />
        </div>
      )}
    </div>
  );
}
