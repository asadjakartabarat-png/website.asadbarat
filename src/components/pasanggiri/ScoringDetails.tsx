'use client';

import { useState } from 'react';
import { getScoringDetails } from '@/lib/pasanggiri/scoring';
import { Kategori } from '@/types/pasanggiri';
import ScoreBreakdownModal from './ScoreBreakdownModal';

interface Props {
  scores: any[];
  showDetails?: boolean;
  kategori?: Kategori;
}

export default function ScoringDetails({ scores, showDetails = false, kategori }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<any>(null);

  if (scores.length === 0) {
    return <div className="text-gray-500 text-sm">Belum ada penilaian</div>;
  }

  const details = getScoringDetails(scores);

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <span className="font-bold text-lg text-red-600">Nilai Final: {details.finalScore}</span>
          <span className="text-sm text-gray-600">({scores.length} juri)</span>
        </div>

        {showDetails && (
          <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
            <div className="font-medium text-gray-700">{details.method}</div>
            {details.usedScores.length > 0 && (
              <div>
                <span className="text-green-700 font-medium">Nilai yang dipakai: </span>
                <span className="text-green-600">{details.usedScores.join(', ')} = {details.finalScore}</span>
              </div>
            )}
            {details.discardedScores.length > 0 && (
              <div>
                <span className="text-red-700 font-medium">Nilai yang dibuang: </span>
                <span className="text-red-600">{details.discardedScores.join(', ')}</span>
              </div>
            )}
            <div className="text-xs mt-3 space-y-1">
              <div className="font-medium text-gray-700 mb-2">Detail Nilai Juri:</div>
              {(() => {
                const juriScores = scores.map(s => ({ juri: s.juri_name, score: s.total_score }));
                juriScores.sort((a, b) => a.score - b.score);
                return juriScores.map((item, index) => {
                  const isLowest = index === 0;
                  const isHighest = index === juriScores.length - 1;
                  const isDiscarded = (juriScores.length >= 4 && (isLowest || isHighest)) || (juriScores.length === 4 && isHighest);
                  const fullScore = scores.find(s => s.juri_name === item.juri);
                  return (
                    <div key={index} className={isDiscarded ? 'text-red-600' : 'text-green-600'}>
                      {isDiscarded ? '🔴' : '🟢'} {item.juri}:{' '}
                      {kategori ? (
                        <button onClick={() => { setSelectedScore(fullScore); setModalOpen(true); }} className="underline hover:no-underline font-medium">
                          {item.score} 🔍
                        </button>
                      ) : (
                        <span className="font-medium">{item.score}</span>
                      )}
                      {isLowest && juriScores.length >= 5 && ' (dibuang - terendah)'}
                      {isHighest && juriScores.length >= 4 && ' (dibuang - tertinggi)'}
                      {!isDiscarded && ' (dipakai)'}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      {kategori && (
        <ScoreBreakdownModal isOpen={modalOpen} onClose={() => setModalOpen(false)} score={selectedScore} kategori={kategori} />
      )}
    </>
  );
}
