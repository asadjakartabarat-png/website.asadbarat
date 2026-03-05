'use client';

import { useState, useEffect } from 'react';
import { PasanggiriDesa } from '@/types/pasanggiri';
import { calculateFinalScore } from '@/lib/pasanggiri/scoring';

interface JuaraUmumGabunganResult {
  desa: string;
  totalPutra: number;
  totalPutri: number;
  totalGabungan: number;
  sesiPutra: number;
  sesiPutri: number;
}

export default function JuaraUmumGabungan() {
  const [results, setResults] = useState<JuaraUmumGabunganResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [competitionsRes, scoresRes, desaRes] = await Promise.all([
          fetch('/api/pasanggiri/competitions?status=COMPLETED'),
          fetch('/api/pasanggiri/scores'),
          fetch('/api/pasanggiri/desa'),
        ]);
        const competitions = await competitionsRes.json();
        const scores = await scoresRes.json();
        const desaList: PasanggiriDesa[] = await desaRes.json();

        const desaResults: Record<string, JuaraUmumGabunganResult> = {};
        desaList.forEach(d => {
          desaResults[d.nama_desa] = { desa: d.nama_desa, totalPutra: 0, totalPutri: 0, totalGabungan: 0, sesiPutra: 0, sesiPutri: 0 };
        });

        const processed = new Set<string>();
        competitions.forEach((comp: any) => {
          if (processed.has(comp.id)) return;
          processed.add(comp.id);
          const competitionScores = scores.filter((s: any) => s.competition_id === comp.id);
          if (competitionScores.length === 0) return;
          const finalScore = calculateFinalScore(competitionScores);
          if (!desaResults[comp.desa] || isNaN(finalScore)) return;
          if (comp.kelas === 'PUTRA') { desaResults[comp.desa].totalPutra += finalScore; desaResults[comp.desa].sesiPutra++; }
          else if (comp.kelas === 'PUTRI') { desaResults[comp.desa].totalPutri += finalScore; desaResults[comp.desa].sesiPutri++; }
        });

        const sorted = Object.values(desaResults)
          .map(r => ({ ...r, totalGabungan: r.totalPutra + r.totalPutri }))
          .filter(r => r.sesiPutra > 0 || r.sesiPutri > 0)
          .sort((a, b) => b.totalGabungan - a.totalGabungan);

        if (!cancelled) setResults(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const exportToPDF = () => {
    const title = 'JUARA UMUM PASANGGIRI JAKARTA BARAT CENGKARENG';
    const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style></head><body><h1>🏆 ${title}</h1><table><thead><tr><th>Rank</th><th>Desa</th><th>Total PUTRA</th><th>Total PUTRI</th><th>TOTAL GABUNGAN</th></tr></thead><tbody>${results.map((r, i) => `<tr><td>${i + 1}${i === 0 ? ' 🥇' : i === 1 ? ' 🥈' : i === 2 ? ' 🥉' : ''}</td><td>${r.desa}</td><td>${r.totalPutra} (${r.sesiPutra} sesi)</td><td>${r.totalPutri} (${r.sesiPutri} sesi)</td><td>${r.totalGabungan}</td></tr>`).join('')}</tbody></table><script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
            🏆 JUARA UMUM PASANGGIRI<br />JAKARTA BARAT CENGKARENG
          </h3>
          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium">
            📄 PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Rank</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Desa</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total PUTRA</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total PUTRI</th>
                <th className="border border-gray-300 px-4 py-2 text-center">TOTAL GABUNGAN</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.desa} className={index < 3 ? 'bg-yellow-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-2 font-bold">
                    {index + 1}{index === 0 && ' 🥇'}{index === 1 && ' 🥈'}{index === 2 && ' 🥉'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{result.desa}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {result.totalPutra}
                    <div className="text-xs text-gray-500">({result.sesiPutra} sesi)</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {result.totalPutri}
                    <div className="text-xs text-gray-500">({result.sesiPutri} sesi)</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold text-red-600 text-lg">{result.totalGabungan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>🏆 <strong>Juara Umum:</strong> Desa dengan total poin gabungan PUTRA + PUTRI tertinggi</p>
          <p>🎯 <strong>Partisipasi:</strong> {results.length} desa berpartisipasi</p>
        </div>
      </div>
    </div>
  );
}
