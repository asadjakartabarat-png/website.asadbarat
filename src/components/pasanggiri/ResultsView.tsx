'use client';

import { useState, useEffect } from 'react';
import { Competition, Score, KATEGORI_LIST } from '@/types/pasanggiri';
import { calculateFinalScore, sortWithTieBreaker } from '@/lib/pasanggiri/scoring';
import ScoringDetails from './ScoringDetails';

interface Props { kelas: 'PUTRA' | 'PUTRI'; }

interface CompetitionResult {
  competition: Competition;
  scores: Score[];
  finalScore: number;
  juriCount: number;
}

export default function ResultsView({ kelas }: Props) {
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState('ALL');
  const [selectedDesa, setSelectedDesa] = useState('ALL');
  const [desaList, setDesaList] = useState<string[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const [competitionsRes, scoresRes] = await Promise.all([
          fetch(`/api/pasanggiri/competitions?kelas=${kelas}`),
          fetch('/api/pasanggiri/scores'),
        ]);
        const competitions = await competitionsRes.json();
        const scores = await scoresRes.json();

        const map = new Map<string, CompetitionResult>();
        competitions.forEach((competition: Competition) => {
          const competitionScores = scores.filter((s: Score) => s.competition_id === competition.id);
          map.set(competition.id, {
            competition,
            scores: competitionScores,
            finalScore: competitionScores.length > 0 ? calculateFinalScore(competitionScores) : 0,
            juriCount: competitionScores.length,
          });
        });

        const arr = Array.from(map.values());
        setResults(arr);
        setDesaList([...new Set(arr.map(r => r.competition.desa))]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [kelas]);

  const filtered = results.filter(r => {
    if (selectedKategori !== 'ALL' && r.competition.kategori !== selectedKategori) return false;
    if (selectedDesa !== 'ALL' && r.competition.desa !== selectedDesa) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, r) => {
    const key = `${r.competition.golongan}-${r.competition.kategori}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, CompetitionResult[]>);

  const ranked: Record<string, (CompetitionResult & { rank: number })[]> = {};
  Object.keys(grouped).forEach(key => {
    const [, kategori] = key.split('-');
    ranked[key] = sortWithTieBreaker(grouped[key], kategori);
  });

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <select value={selectedKategori} onChange={e => setSelectedKategori(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
          <option value="ALL">Semua Kategori</option>
          {KATEGORI_LIST.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={selectedDesa} onChange={e => setSelectedDesa(e.target.value)} className="border border-gray-300 rounded px-3 py-2">
          <option value="ALL">Semua Desa</option>
          {desaList.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-8 text-gray-500">Belum ada hasil pertandingan untuk kelas {kelas}</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(ranked).map(([key, results]) => {
            const [golongan, kategori] = key.split('-');
            return (
              <div key={key} className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">{golongan} - {kategori} ({kelas})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Ranking</th>
                        <th className="text-left py-2">Desa</th>
                        <th className="text-center py-2">Detail Penilaian</th>
                        <th className="text-center py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map(result => {
                        const isTied = results.filter(r => r.rank === result.rank).length > 1;
                        return (
                          <tr key={result.competition.id} className="border-b">
                            <td className="py-2">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${result.rank === 1 ? 'bg-yellow-500' : result.rank === 2 ? 'bg-gray-400' : result.rank === 3 ? 'bg-orange-600' : 'bg-gray-300 text-gray-700'}`}>
                                  {result.rank}
                                </span>
                                {isTied && <span className="text-xs text-red-600 font-semibold">(Bersama)</span>}
                              </div>
                            </td>
                            <td className="py-2 font-medium text-gray-900">{result.competition.desa}</td>
                            <td className="py-2">
                              <ScoringDetails scores={result.scores} showDetails={true} kategori={result.competition.kategori} />
                            </td>
                            <td className="py-2 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${result.competition.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {result.competition.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
