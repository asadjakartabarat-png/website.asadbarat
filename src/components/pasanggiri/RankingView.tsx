'use client';

import { useState, useEffect } from 'react';
import { GOLONGAN_LIST, KATEGORI_LIST, SCORING_CRITERIA } from '@/types/pasanggiri';
import { calculateFinalScore, calculateMiddle3SumForCriteria, getMiddle3JuriesForCriteria } from '@/lib/pasanggiri/scoring';

interface Props { kelas: 'PUTRA' | 'PUTRI'; }

interface DesaResult {
  desa: string;
  kelas: string;
  categories: Record<string, number>;
  categoryDetails: Record<string, any[]>;
  total_score: number;
  rank?: number;
}

export default function RankingView({ kelas }: Props) {
  const [results, setResults] = useState<DesaResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGolongan, setSelectedGolongan] = useState('ALL');
  const [selectedKategori, setSelectedKategori] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ desa: string; kategori: string; scores: any[] } | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const [competitionsRes, scoresRes] = await Promise.all([
          fetch(`/api/pasanggiri/competitions?kelas=${kelas}&status=COMPLETED`),
          fetch('/api/pasanggiri/scores'),
        ]);
        const competitions = await competitionsRes.json();
        const scores = await scoresRes.json();

        const desaResults: Record<string, DesaResult> = {};

        competitions.forEach((comp: any) => {
          if (selectedGolongan !== 'ALL' && comp.golongan !== selectedGolongan) return;
          if (selectedKategori !== 'ALL' && comp.kategori !== selectedKategori) return;

          const key = comp.desa;
          if (!desaResults[key]) {
            desaResults[key] = { desa: comp.desa, kelas: comp.kelas, categories: {}, categoryDetails: {}, total_score: 0 };
          }

          const competitionScores = scores.filter((s: any) => s.competition_id === comp.id);
          const totalScore = calculateFinalScore(competitionScores);

          if (!desaResults[key].categoryDetails[comp.kategori]) desaResults[key].categoryDetails[comp.kategori] = [];
          desaResults[key].categoryDetails[comp.kategori].push(...competitionScores);

          desaResults[key].categories[comp.kategori] = (desaResults[key].categories[comp.kategori] || 0) + totalScore;
          desaResults[key].total_score += totalScore;
        });

        const sorted = Object.values(desaResults).sort((a, b) => b.total_score - a.total_score);
        let currentRank = 1;
        const ranked = sorted.map((r, i) => {
          if (i > 0 && sorted[i - 1].total_score !== r.total_score) currentRank = i + 1;
          return { ...r, rank: currentRank };
        });
        setResults(ranked);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [kelas, selectedGolongan, selectedKategori]);

  const exportToPDF = () => {
    const title = `Hasil ${selectedKategori === 'ALL' ? 'Semua Kategori' : selectedKategori} - ${kelas}`;
    const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style></head><body><h1>${title}</h1><table><thead><tr><th>Rank</th><th>Desa</th>${selectedKategori === 'ALL' ? KATEGORI_LIST.map(k => `<th>${k}</th>`).join('') : ''}<th>Total</th></tr></thead><tbody>${results.map(r => `<tr><td>${r.rank}</td><td>${r.desa}</td>${selectedKategori === 'ALL' ? KATEGORI_LIST.map(k => `<td>${r.categories[k] || '-'}</td>`).join('') : ''}<td>${r.total_score}</td></tr>`).join('')}</tbody></table><script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Filter Ranking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Kelas</label>
            <input type="text" value={kelas} disabled className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Golongan</label>
            <select value={selectedGolongan} onChange={e => setSelectedGolongan(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="ALL">Semua Golongan</option>
              {GOLONGAN_LIST.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Kategori</label>
            <select value={selectedKategori} onChange={e => setSelectedKategori(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="ALL">Semua Kategori</option>
              {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Export PDF</button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Hasil {selectedKategori === 'ALL' ? 'Semua Kategori' : selectedKategori} - {kelas}
          {selectedGolongan !== 'ALL' && ` - ${selectedGolongan}`}
        </h3>
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Belum ada hasil untuk filter yang dipilih</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-center">Rank</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Desa</th>
                  {selectedKategori === 'ALL' && KATEGORI_LIST.map(k => (
                    <th key={k} className="border border-gray-300 px-4 py-2 text-center">{k}</th>
                  ))}
                  <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => {
                  const isTied = results.filter(r => r.rank === result.rank).length > 1;
                  return (
                    <tr key={result.desa} className="bg-white hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${result.rank === 1 ? 'bg-yellow-500' : result.rank === 2 ? 'bg-gray-400' : result.rank === 3 ? 'bg-orange-600' : 'bg-gray-300 text-gray-700'}`}>
                            {result.rank}
                          </span>
                          {isTied && <span className="text-xs text-red-600 font-semibold">(Bersama)</span>}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">{result.desa}</td>
                      {selectedKategori === 'ALL' && KATEGORI_LIST.map(k => (
                        <td key={k} className="border border-gray-300 px-4 py-2 text-center">
                          {result.categories[k] ? (
                            <button onClick={() => { setModalData({ desa: result.desa, kategori: k, scores: result.categoryDetails[k] || [] }); setModalOpen(true); }} className="text-red-600 hover:underline font-semibold">
                              {result.categories[k]} 🔍
                            </button>
                          ) : '-'}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-2 text-center font-bold text-red-600">{result.total_score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detail Kriteria - {modalData.desa}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Kategori: {modalData.kategori}</h4>
            <p className="text-sm text-gray-600 mb-4">Total Nilai: <span className="font-bold text-red-600">{calculateFinalScore(modalData.scores)}</span></p>
            <div className="space-y-4">
              {SCORING_CRITERIA[modalData.kategori as keyof typeof SCORING_CRITERIA]?.map(criteria => {
                const sum = calculateMiddle3SumForCriteria(modalData.scores, criteria.name);
                return (
                  <div key={criteria.name} className="border border-gray-300 rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-gray-900">{criteria.name}</h5>
                      <span className="text-lg font-bold text-red-600">{sum}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{criteria.description}</p>
                    <div className="text-xs text-gray-500">Range: {criteria.min} - {criteria.max}</div>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="text-gray-600 font-medium">Nilai 3 juri tengah:</div>
                      {getMiddle3JuriesForCriteria(modalData.scores, criteria.name).map((item, idx) => (
                        <div key={idx} className="text-green-600">🟢 {item.juri}: <span className="font-semibold">{item.value}</span> (dipakai)</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setModalOpen(false)} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
