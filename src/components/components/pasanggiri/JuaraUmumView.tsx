'use client';

import { useState, useEffect } from 'react';
import { PasanggiriDesa, GOLONGAN_LIST, KATEGORI_LIST } from '@/types/pasanggiri';
import { calculateFinalScore } from '@/lib/pasanggiri/scoring';

interface Props { kelas: 'PUTRA' | 'PUTRI'; }

interface JuaraUmumResult {
  desa: string;
  totalScore: number;
  completedSessions: number;
  totalSessions: number;
  isComplete: boolean;
  rank?: number;
}

export default function JuaraUmumView({ kelas }: Props) {
  const [results, setResults] = useState<JuaraUmumResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [competitionsRes, scoresRes, desaRes] = await Promise.all([
          fetch(`/api/pasanggiri/competitions?kelas=${kelas}&status=COMPLETED`),
          fetch('/api/pasanggiri/scores'),
          fetch('/api/pasanggiri/desa'),
        ]);
        const competitions = await competitionsRes.json();
        const scores = await scoresRes.json();
        const desaList: PasanggiriDesa[] = await desaRes.json();

        const desaResults: Record<string, JuaraUmumResult> = {};
        desaList.forEach(d => {
          desaResults[d.nama_desa] = {
            desa: d.nama_desa,
            totalScore: 0,
            completedSessions: 0,
            totalSessions: GOLONGAN_LIST.length * KATEGORI_LIST.length,
            isComplete: false,
          };
        });

        const processed = new Set<string>();
        competitions.forEach((comp: any) => {
          if (processed.has(comp.id)) return;
          processed.add(comp.id);
          const competitionScores = scores.filter((s: any) => s.competition_id === comp.id);
          if (competitionScores.length === 0) return;
          const finalScore = calculateFinalScore(competitionScores);
          if (!desaResults[comp.desa] || isNaN(finalScore)) return;
          desaResults[comp.desa].totalScore += finalScore;
          desaResults[comp.desa].completedSessions++;
        });

        const totalSessions = GOLONGAN_LIST.length * KATEGORI_LIST.length;
        const sorted = Object.values(desaResults)
          .filter(r => r.completedSessions > 0)
          .map(r => ({ ...r, isComplete: r.completedSessions === totalSessions }))
          .sort((a, b) => b.totalScore - a.totalScore);

        let currentRank = 1;
        const ranked = sorted.map((r, i) => {
          if (i > 0 && sorted[i - 1].totalScore !== r.totalScore) currentRank = i + 1;
          return { ...r, rank: currentRank };
        });

        if (!cancelled) setResults(ranked);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [kelas]);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">🏆 Juara Umum {kelas}</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Rank</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Desa</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Sesi Selesai</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total Poin</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => {
                const isTied = results.filter(r => r.rank === result.rank).length > 1;
                return (
                  <tr key={result.desa} className={result.isComplete && (result.rank || 0) <= 3 ? 'bg-yellow-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {result.rank}{result.rank === 1 && ' 🥇'}{result.rank === 2 && ' 🥈'}{result.rank === 3 && ' 🥉'}
                        </span>
                        {isTied && <span className="text-xs text-red-600 font-semibold">(Bersama)</span>}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{result.desa}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{result.completedSessions}/{result.totalSessions}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${result.isComplete ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {result.isComplete ? 'LENGKAP' : 'BERPARTISIPASI'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold text-red-600">{result.totalScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>🏆 <strong>Juara Umum {kelas}:</strong> Desa dengan total poin tertinggi</p>
          <p>🎯 <strong>Partisipasi:</strong> {results.length} desa berpartisipasi di kelas {kelas}</p>
        </div>
      </div>
    </div>
  );
}
