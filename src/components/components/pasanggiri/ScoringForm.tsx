'use client';

import { useState } from 'react';
import { Competition, SCORING_CRITERIA } from '@/types/pasanggiri';

interface Props {
  competition: Competition;
  juriName: string;
  onSubmitted: () => void;
}

export default function ScoringForm({ competition, juriName, onSubmitted }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const criteria = SCORING_CRITERIA[competition.kategori];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
  const maxPossibleScore = criteria.reduce((sum, c) => sum + c.max, 0);

  const handleScoreChange = (criteriaName: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setScores(prev => ({ ...prev, [criteriaName]: numValue }));
  };

  const validateScores = () => {
    for (const criterion of criteria) {
      const score = scores[criterion.name] || 0;
      if (score < criterion.min || score > criterion.max) {
        return `${criterion.name} harus antara ${criterion.min}-${criterion.max}`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateScores();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pasanggiri/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competition_id: competition.id,
          juri_name: juriName,
          criteria_scores: scores,
          total_score: totalScore,
        }),
      });

      if (response.ok) {
        onSubmitted();
      } else {
        const data = await response.json();
        setError(data.error || 'Gagal menyimpan nilai');
      }
    } catch {
      setError('Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Penilaian</h2>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <span>🥋</span>
          <span>{competition.desa} - {competition.kategori}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        <div className="space-y-4">
          {criteria.map(criterion => (
            <div key={criterion.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{criterion.name}</h3>
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {criterion.min}-{criterion.max}
                </span>
              </div>
              <input
                type="number"
                min={criterion.min}
                max={criterion.max}
                step="1"
                value={scores[criterion.name] || ''}
                onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                onKeyDown={(e) => { if (e.key === '.' || e.key === ',') e.preventDefault(); }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={`${criterion.min}-${criterion.max}`}
                required
              />
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total Nilai:</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-red-600">{totalScore}</span>
              <span className="text-lg text-gray-500">/{maxPossibleScore}</span>
            </div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${(totalScore / maxPossibleScore) * 100}%` }} />
          </div>
        </div>

        <div className="flex space-x-4">
          <button type="button" onClick={() => setScores({})} className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50" disabled={loading}>
            🔄 Reset
          </button>
          <button
            type="submit"
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
            disabled={loading || Object.keys(scores).length !== criteria.length}
          >
            {loading ? 'Menyimpan...' : '✍️ Input Data'}
          </button>
        </div>
      </form>
    </div>
  );
}
