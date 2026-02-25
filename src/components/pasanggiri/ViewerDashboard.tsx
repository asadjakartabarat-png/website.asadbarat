'use client';

import { useState } from 'react';
import { User } from '@/types/pasanggiri';
import RankingView from './RankingView';

interface Props {
  user: User;
  activeTab?: string;
}

export default function ViewerDashboard({ user, activeTab: externalActiveTab }: Props) {
  const [selectedTab, setSelectedTab] = useState<'putra' | 'putri'>('putra');
  const showResults = !externalActiveTab || externalActiveTab === 'results';
  const showRanking = externalActiveTab === 'ranking';

  return (
    <div className="space-y-6">
      {(showResults || showRanking) && (
        <>
          <div className="flex space-x-4 border-b">
            {(['putra', 'putri'] as const).map(tab => (
              <button key={tab} onClick={() => setSelectedTab(tab)} className={`pb-2 px-1 border-b-2 font-medium text-sm ${selectedTab === tab ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {showRanking ? 'Ranking' : 'Hasil'} {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {showRanking ? 'Ranking' : 'Hasil'} Pertandingan - {selectedTab.toUpperCase()}
              </h2>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Mode Viewer (Read-Only)</div>
            </div>
            <RankingView kelas={selectedTab.toUpperCase() as 'PUTRA' | 'PUTRI'} />
          </div>
        </>
      )}
    </div>
  );
}
