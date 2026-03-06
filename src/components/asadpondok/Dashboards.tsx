'use client';

import { useRouter } from 'next/navigation';

interface User { id: number; username: string; full_name: string; role: string; }

export function SuperAdminDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Selamat datang, {user.full_name}</h2>
      <p className="text-sm text-gray-500 mb-6">Super Admin — Akses penuh semua fitur</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { tab: 'peserta', icon: '👥', label: 'Peserta Tes', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { tab: 'teori', icon: '📋', label: 'Form Penilaian', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { tab: 'input-nilai', icon: '✏️', label: 'Input Nilai', color: 'bg-green-50 border-green-200 text-green-700' },
          { tab: 'hasil', icon: '🏆', label: 'Hasil Penilaian', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { tab: 'users', icon: '⚙️', label: 'Kelola User', color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map(item => (
          <button key={item.tab} onClick={() => router.push(`/asadpondok/dashboard?tab=${item.tab}`)}
            className={`border rounded-lg p-4 text-center hover:shadow-sm transition-shadow ${item.color}`}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function KordaDashboard({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Selamat datang, {user.full_name}</h2>
      <p className="text-sm text-gray-500 mb-6">Koordinator</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { tab: 'peserta', icon: '👥', label: 'Peserta Tes', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { tab: 'teori', icon: '📋', label: 'Form Penilaian', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { tab: 'hasil', icon: '🏆', label: 'Hasil Penilaian', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        ].map(item => (
          <button key={item.tab} onClick={() => router.push(`/asadpondok/dashboard?tab=${item.tab}`)}
            className={`border rounded-lg p-4 text-center hover:shadow-sm transition-shadow ${item.color}`}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const KeteranganNilai = () => (
  <div className="mt-4 inline-flex gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm">
    <span className="font-semibold text-amber-800">Ket:</span>
    <span className="text-amber-700">Kurang (K) = 5–6</span>
    <span className="text-amber-700">Cukup (C) = 7–8</span>
    <span className="text-amber-700">Baik (B) = 9–10</span>
  </div>
);

export function PengujiDashboard({ user }: { user: User }) {
  const router = useRouter();
  const kelas = user.role === 'penguji_sm_putra' ? 'PUTRA' : 'PUTRI';
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Selamat datang, {user.full_name}</h2>
      <p className="text-sm text-gray-500 mb-6">Penguji {kelas}</p>
      <button onClick={() => router.push('/asadpondok/dashboard?tab=input-nilai')}
        className="w-full sm:w-auto bg-green-600 text-white px-6 py-4 rounded-lg text-center hover:bg-green-700 transition-colors">
        <div className="text-3xl mb-2">✏️</div>
        <div className="font-medium">Mulai Input Nilai {kelas}</div>
        <div className="text-sm text-green-200 mt-1">Klik untuk memilih peserta</div>
      </button>
      <KeteranganNilai />
    </div>
  );
}
