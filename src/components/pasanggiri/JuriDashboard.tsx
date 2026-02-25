'use client';

import { useState, useEffect } from 'react';
import { User, Competition, SCORING_CRITERIA } from '@/types/pasanggiri';
import ScoringForm from './ScoringForm';

interface Props {
  user: User;
  activeTab?: string;
}

interface Score {
  id: string;
  competition_id: string;
  juri_name: string;
  criteria_scores: Record<string, number>;
  total_score: number;
  created_at: string;
}

export default function JuriDashboard({ user, activeTab }: Props) {
  const [activeCompetitions, setActiveCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [myScores, setMyScores] = useState<Score[]>([]);
  const [juriTab, setJuriTab] = useState<'aktif' | 'selesai'>('aktif');

  const kelas = user.role === 'JURI_PUTRA' ? 'PUTRA' : 'PUTRI';

  useEffect(() => {
    fetchActiveCompetitions();
    fetchMyScores();
  }, [kelas]);

  const fetchActiveCompetitions = async () => {
    try {
      const res = await fetch(`/api/pasanggiri/competitions?status=ACTIVE&kelas=${kelas}`);
      if (res.ok) setActiveCompetitions(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const fetchMyScores = async () => {
    try {
      const res = await fetch(`/api/pasanggiri/scores?juri_name=${user.username}`);
      if (res.ok) setMyScores(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleScoreSubmitted = () => {
    setSelectedCompetition(null);
    fetchActiveCompetitions();
    fetchMyScores();
  };

  const isCompetitionScored = (id: string) => myScores.some(s => s.competition_id === id);
  const getCompetitionScore = (id: string) => myScores.find(s => s.competition_id === id);

  const unScoredCompetitions = activeCompetitions.filter(c => !isCompetitionScored(c.id));
  const scoredCompetitions = activeCompetitions.filter(c => isCompetitionScored(c.id));

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  if (selectedCompetition) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Penilaian</h2>
            <p className="text-gray-600">{selectedCompetition.desa} - {selectedCompetition.kategori} - {selectedCompetition.golongan} {selectedCompetition.kelas}</p>
          </div>
          <button onClick={() => setSelectedCompetition(null)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">Kembali</button>
        </div>
        <ScoringForm competition={selectedCompetition} juriName={user.username} onSubmitted={handleScoreSubmitted} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(!activeTab || activeTab === 'scoring') && (
        <div className="space-y-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button onClick={() => setJuriTab('aktif')} className={`pb-2 px-1 border-b-2 font-medium text-sm ${juriTab === 'aktif' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Belum Dinilai ({unScoredCompetitions.length})
            </button>
            <button onClick={() => setJuriTab('selesai')} className={`pb-2 px-1 border-b-2 font-medium text-sm ${juriTab === 'selesai' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Sudah Dinilai ({scoredCompetitions.length})
            </button>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              {juriTab === 'aktif' ? 'Pertandingan Belum Dinilai' : 'Pertandingan Sudah Dinilai'} - {kelas}
            </h2>

            {juriTab === 'aktif' ? (
              unScoredCompetitions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Semua pertandingan sudah dinilai</p>
                  <p className="text-sm text-gray-400 mt-2">Atau tunggu SIRKULATOR mengaktifkan sesi baru</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unScoredCompetitions.map(competition => (
                    <div key={competition.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900">{competition.desa}</h3>
                        <p className="text-sm text-gray-600">{competition.kategori}</p>
                        <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Kriteria Penilaian:</p>
                        <div className="space-y-1">
                          {SCORING_CRITERIA[competition.kategori].map(c => (
                            <div key={c.name} className="text-xs text-gray-600">{c.name}: {c.min}-{c.max}</div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => setSelectedCompetition(competition)} className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-sm">
                        Beri Nilai
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              scoredCompetitions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Belum ada pertandingan yang dinilai</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scoredCompetitions.map(competition => {
                    const score = getCompetitionScore(competition.id);
                    return (
                      <div key={competition.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{competition.desa}</h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✅ Selesai</span>
                          </div>
                          <p className="text-sm text-gray-600">{competition.kategori}</p>
                          <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
                        </div>
                        {score && (
                          <div className="mb-3 p-3 bg-white rounded border">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm font-medium text-gray-900">Detail Nilai:</p>
                              <p className="text-lg font-bold text-red-600">{score.total_score}</p>
                            </div>
                            <div className="space-y-1 mb-2">
                              {Object.entries(score.criteria_scores || {}).map(([criteria, value]) => (
                                <div key={criteria} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{criteria}:</span>
                                  <span className="font-medium text-gray-900">{value}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 border-t pt-2">Dinilai: {new Date(score.created_at).toLocaleString('id-ID')}</p>
                          </div>
                        )}
                        <button disabled className="w-full text-sm bg-gray-100 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed">Sudah Dinilai</button>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Riwayat Penilaian - {kelas}</h2>
          {myScores.length === 0 ? (
            <p className="text-gray-500">Belum ada riwayat penilaian</p>
          ) : (
            <div className="space-y-3">
              {myScores.map(score => {
                const competition = activeCompetitions.find(c => c.id === score.competition_id);
                return (
                  <div key={score.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{competition ? `${competition.desa} - ${competition.kategori}` : 'Kompetisi tidak ditemukan'}</p>
                        <p className="text-sm text-gray-600">{competition ? `${competition.golongan} ${competition.kelas}` : ''}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(score.created_at).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{score.total_score}</p>
                        <p className="text-xs text-gray-500">Total Nilai</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
