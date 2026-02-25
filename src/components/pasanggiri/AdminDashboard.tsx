'use client';

import { useState, useEffect } from 'react';
import { User, Competition, ActivityLog } from '@/types/pasanggiri';
import RankingView from './RankingView';
import ResultsView from './ResultsView';
import AdministrasiPertandingan from './AdministrasiPertandingan';

interface Props {
  user: User;
  activeTab?: string;
}

export default function AdminDashboard({ user, activeTab = 'overview' }: Props) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetch('/api/pasanggiri/competitions').then(r => r.json()).then(setCompetitions).catch(console.error);
    fetch('/api/pasanggiri/users').then(r => r.json()).then(data => setUsers(data.filter((u: User) => u.role !== 'SUPER_ADMIN'))).catch(console.error);
    fetch('/api/pasanggiri/activity-logs?limit=50').then(r => r.json()).then(setLogs).catch(console.error);
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/pasanggiri/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, is_active: !currentStatus }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (error) { console.error(error); }
  };

  const activeCompetitions = competitions.filter(c => c.status === 'ACTIVE');
  const completedCompetitions = competitions.filter(c => c.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card"><h3 className="text-lg font-medium text-gray-900">Total User</h3><p className="text-3xl font-bold text-red-600">{users.length}</p></div>
            <div className="card"><h3 className="text-lg font-medium text-gray-900">Sesi Aktif</h3><p className="text-3xl font-bold text-green-600">{activeCompetitions.length}</p></div>
            <div className="card"><h3 className="text-lg font-medium text-gray-900">Sesi Selesai</h3><p className="text-3xl font-bold text-blue-600">{completedCompetitions.length}</p></div>
            <div className="card"><h3 className="text-lg font-medium text-gray-900">Total Sesi</h3><p className="text-3xl font-bold text-gray-600">{competitions.length}</p></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Sesi Aktif</h3>
              {activeCompetitions.length === 0 ? <p className="text-gray-500">Tidak ada sesi aktif</p> : (
                <div className="space-y-2">
                  {activeCompetitions.slice(0, 5).map(comp => (
                    <div key={comp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{comp.desa} - {comp.kategori}</p>
                        <p className="text-sm text-gray-600">{comp.golongan} {comp.kelas}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">AKTIF</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Aktivitas Terbaru</h3>
              <div className="space-y-2">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-600">{log.username} - {new Date(log.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Ranking Pertandingan</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><h3 className="text-lg font-medium mb-4 text-gray-900">Ranking PUTRA</h3><RankingView kelas="PUTRA" /></div>
            <div><h3 className="text-lg font-medium mb-4 text-gray-900">Ranking PUTRI</h3><RankingView kelas="PUTRI" /></div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Detail Penilaian</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><h3 className="text-lg font-medium mb-4 text-gray-900">Detail Penilaian PUTRA</h3><ResultsView kelas="PUTRA" /></div>
            <div><h3 className="text-lg font-medium mb-4 text-gray-900">Detail Penilaian PUTRI</h3><ResultsView kelas="PUTRI" /></div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Manajemen User</h2>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-900">Username</th>
                    <th className="text-left py-2 text-gray-900">Role</th>
                    <th className="text-left py-2 text-gray-900">Status</th>
                    <th className="text-left py-2 text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 text-gray-900">{u.username}</td>
                      <td className="py-2 text-gray-900">{u.role}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-2">
                        <button onClick={() => toggleUserStatus(u.id, u.is_active)} className={`text-xs px-2 py-1 rounded ${u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Log Aktivitas</h2>
          <div className="card">
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.details}</p>
                      <p className="text-xs text-gray-500">oleh: {log.username}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'administrasi' && <AdministrasiPertandingan userRole={user.role} userId={user.id} />}
    </div>
  );
}
