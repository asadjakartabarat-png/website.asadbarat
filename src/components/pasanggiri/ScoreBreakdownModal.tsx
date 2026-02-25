'use client';

import { useEffect } from 'react';
import { SCORING_CRITERIA, Kategori } from '@/types/pasanggiri';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  score: {
    juri_name: string;
    total_score: number;
    criteria_scores: Record<string, number>;
  } | null;
  kategori: Kategori;
}

export default function ScoreBreakdownModal({ isOpen, onClose, score, kategori }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !score) return null;

  const criteria = SCORING_CRITERIA[kategori];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sm:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detail Penilaian</h3>
          <p className="text-sm text-gray-600 mt-1">{score.juri_name}</p>
          <p className="text-2xl font-bold text-red-600 mt-2">Total: {score.total_score}</p>
        </div>
        <div className="px-6 py-4 space-y-4">
          {criteria.map((criterion) => {
            const value = score.criteria_scores[criterion.name] || 0;
            const percentage = ((value - criterion.min) / (criterion.max - criterion.min)) * 100;
            return (
              <div key={criterion.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{criterion.name}</span>
                  <span className="text-lg font-bold text-red-600">{value}</span>
                </div>
                <p className="text-xs text-gray-500">(dari range {criterion.min}-{criterion.max})</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-6 py-4 border-t">
          <button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
