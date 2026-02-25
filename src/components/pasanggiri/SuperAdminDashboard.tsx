'use client';

import { useState, useEffect } from 'react';
import { User, ActivityLog, PasanggiriDesa, GOLONGAN_LIST, KATEGORI_LIST } from '@/types/pasanggiri';
import ResultsView from './ResultsView';
import RankingView from './RankingView';
import JuaraUmumGabungan from './JuaraUmumGabungan';
import AdministrasiPertandingan from './AdministrasiPertandingan';

interface Props {
  user: User;
  activeTab?: string;
}

export default function SuperAdminDashboard({ user, activeTab = 'users' }: Props) {
  const [competitionSubTab, setCompetitionSubTab] = useState<'putra' | 'putri' | 'juara_umum'>('putra');
  const [competitionView, setCompetitionView] = useState<'control' | 'results'>('control');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [desaList, setDesaList] = useState<PasanggiriDesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingCompetition, setCreatingCompetition] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ username: '', role: '', password: '' });
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'JURI_PUTRA' });
  const [newDesaName, setNewDesaName] = useState('');

  useEffect(() => {
    fetchUsers(); fetchLogs(); fetchCompetitions();
    fetchDesa();
  }, []);

  const fetchDesa = () => fetch('/api/pasanggiri/desa').then(r => r.json()).then(setDesaList).catch(console.error);
  const fetchUsers = () => fetch('/api/pasanggiri/users').then(r => r.json()).then(setUsers).catch(console.error);
  const fetchLogs = () => fetch('/api/pasanggiri/activity-logs?limit=100').then(r => r.json()).then(setLogs).catch(console.error);
  const fetchCompetitions = () => fetch('/api/pasanggiri/competitions').then(r => r.json()).then(setCompetitions).catch(console.error);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message); setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const logActivity = (action: string, details: string) =>
    fetch('/api/pasanggiri/activity-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: user.id, username: user.username, action, details }) });

  const createUser = async () => {
    if (!newUser.username || !newUser.password) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pasanggiri/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
      if (res.ok) {
        const created = await res.json();
        setUsers([created, ...users]);
        setNewUser({ username: '', password: '', role: 'JURI_PUTRA' });
        setShowCreateUser(false);
        await logActivity('CREATE_USER', `Membuat user baru: ${created.username} (${created.role})`);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const updateUser = async () => {
    if (!editingUser || !editForm.username || !editForm.role) return;
    setLoading(true);
    try {
      const updateData: any = { id: editingUser.id, username: editForm.username, role: editForm.role };
      if (editForm.password) updateData.password = editForm.password;
      const res = await fetch('/api/pasanggiri/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === editingUser.id ? updated : u));
        setEditingUser(null); setEditForm({ username: '', role: '', password: '' });
        await logActivity('UPDATE_USER', `Mengupdate user: ${updated.username} (${updated.role})`);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Yakin ingin menghapus user ${username}?`)) return;
    try {
      const res = await fetch(`/api/pasanggiri/users?id=${userId}`, { method: 'DELETE' });
      if (res.ok) { setUsers(users.filter(u => u.id !== userId)); await logActivity('DELETE_USER', `Menghapus user: ${username}`); }
    } catch (error) { console.error(error); }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/pasanggiri/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: userId, is_active: !currentStatus }) });
      if (res.ok) { const updated = await res.json(); setUsers(users.map(u => u.id === userId ? updated : u)); }
    } catch (error) { console.error(error); }
  };

  const createCompetition = async (desa: PasanggiriDesa, golongan: string, kategori: string, kelas: string) => {
    const key = `${desa.nama_desa}-${golongan}-${kategori}-${kelas}`;
    const existing = competitions.find(c => c.desa === desa.nama_desa && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas);
    if (existing) { showToast(`⚠️ Sesi ${desa.nama_desa} - ${kategori} sudah ada`, 'info'); return; }
    setCreatingCompetition(key);
    try {
      const res = await fetch('/api/pasanggiri/competitions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ desa_id: desa.id, kelas, golongan, kategori }) });
      if (res.ok) {
        const newComp = await res.json();
        setCompetitions([newComp, ...competitions]);
        showToast(`✅ Sesi ${desa.nama_desa} - ${kategori} berhasil dibuat!`, 'success');
        await logActivity('CREATE_COMPETITION', `Membuat sesi: ${desa.nama_desa} - ${kategori} (${kelas})`);
      } else { showToast(`❌ Gagal membuat sesi`, 'error'); }
    } catch { showToast(`❌ Gagal membuat sesi`, 'error'); }
    finally { setCreatingCompetition(null); }
  };

  const isCompetitionCreated = (desaNama: string, golongan: string, kategori: string, kelas: string) =>
    competitions.some(c => c.desa === desaNama && c.golongan === golongan && c.kategori === kategori && c.kelas === kelas);

  const toggleCompetitionStatus = async (competition: any) => {
    const newStatus = competition.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/pasanggiri/competitions/${competition.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) {
        setCompetitions(competitions.map(c => c.id === competition.id ? { ...c, status: newStatus } : c));
        await logActivity('TOGGLE_COMPETITION_STATUS', `${newStatus === 'ACTIVE' ? 'Mengaktifkan' : 'Menyelesaikan'} sesi: ${competition.desa} - ${competition.kategori}`);
      }
    } catch (error) { console.error(error); }
  };

  const deleteCompetition = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus sesi ${name}?`)) return;
    try {
      const res = await fetch(`/api/pasanggiri/competitions?id=${id}`, { method: 'DELETE' });
      if (res.ok) { setCompetitions(competitions.filter(c => c.id !== id)); await logActivity('DELETE_COMPETITION', `Menghapus sesi: ${name}`); }
    } catch (error) { console.error(error); }
  };

  const addDesa = async () => {
    const nama = newDesaName.trim();
    if (!nama) return;
    try {
      const res = await fetch('/api/pasanggiri/desa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama_desa: nama }) });
      if (res.ok) { setNewDesaName(''); fetchDesa(); }
      else { const err = await res.json(); alert(err.error || 'Gagal menambah desa'); }
    } catch (error) { console.error(error); }
  };

  const deleteDesa = async (id: number, nama: string) => {
    if (!confirm(`Hapus desa "${nama}"?`)) return;
    try {
      const res = await fetch(`/api/pasanggiri/desa?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchDesa();
    } catch (error) { console.error(error); }
  };

  const ROLES = ['JURI_PUTRA', 'JURI_PUTRI', 'SIRKULATOR_PUTRA', 'SIRKULATOR_PUTRI', 'KOORDINATOR_PUTRA', 'KOORDINATOR_PUTRI', 'ADMIN', 'VIEWER'];

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium ${toastType === 'success' ? 'bg-green-500' : toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          {toastMessage}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Manajemen User</h2>
            <button onClick={() => setShowCreateUser(true)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Tambah User</button>
          </div>

          {showCreateUser && (
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Buat User Baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="border rounded px-3 py-2" />
                <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="border rounded px-3 py-2" />
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="border rounded px-3 py-2">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="flex space-x-2 mt-4">
                <button onClick={createUser} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">Buat</button>
                <button onClick={() => setShowCreateUser(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Batal</button>
              </div>
            </div>
          )}

          {editingUser && (
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Edit User: {editingUser.username}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Username" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="border rounded px-3 py-2" />
                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="border rounded px-3 py-2">
                  {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                </select>
                <input type="password" placeholder="Password Baru (opsional)" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="border rounded px-3 py-2" />
              </div>
              <div className="flex space-x-2 mt-4">
                <button onClick={updateUser} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">Update</button>
                <button onClick={() => { setEditingUser(null); setEditForm({ username: '', role: '', password: '' }); }} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Batal</button>
              </div>
            </div>
          )}

          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-gray-900">Username</th>
                    <th className="text-left py-2 text-gray-900">Role</th>
                    <th className="text-left py-2 text-gray-900">Status</th>
                    <th className="text-left py-2 text-gray-900">Dibuat</th>
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
                      <td className="py-2 text-gray-900">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="py-2">
                        <div className="flex space-x-1">
                          <button onClick={() => { setEditingUser(u); setEditForm({ username: u.username, role: u.role, password: '' }); }} className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs px-2 py-1 rounded">Edit</button>
                          <button onClick={() => toggleUserStatus(u.id, u.is_active)} className={`text-xs px-2 py-1 rounded ${u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                            {u.is_active ? 'Off' : 'On'}
                          </button>
                          <button onClick={() => deleteUser(u.id, u.username)} className="bg-red-100 text-red-700 hover:bg-red-200 text-xs px-2 py-1 rounded">Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Kontrol Pertandingan</h2>
          <div className="flex space-x-4 border-b">
            {(['putra', 'putri', 'juara_umum'] as const).map(tab => (
              <button key={tab} onClick={() => setCompetitionSubTab(tab)} className={`pb-2 px-1 border-b-2 font-medium text-sm ${competitionSubTab === tab ? (tab === 'putra' ? 'border-blue-500 text-blue-600' : tab === 'putri' ? 'border-pink-500 text-pink-600' : 'border-yellow-500 text-yellow-600') : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab === 'juara_umum' ? '🏆 JUARA UMUM' : `KELAS ${tab.toUpperCase()}`}
              </button>
            ))}
          </div>

          <div className="flex space-x-4 border-b">
            {competitionSubTab !== 'juara_umum' && (
              <button onClick={() => setCompetitionView('control')} className={`pb-2 px-1 border-b-2 font-medium text-sm ${competitionView === 'control' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                Kontrol Pertandingan
              </button>
            )}
            <button onClick={() => setCompetitionView('results')} className={`pb-2 px-1 border-b-2 font-medium text-sm ${competitionView === 'results' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              Hasil Pertandingan
            </button>
          </div>

          {competitionView === 'control' && competitionSubTab !== 'juara_umum' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Buat Sesi Pertandingan Baru - {competitionSubTab.toUpperCase()}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {desaList.map(desa => (
                    <div key={desa.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{desa.nama_desa}</h4>
                      {GOLONGAN_LIST.map(golongan => (
                        <div key={golongan} className="mb-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">{golongan}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {KATEGORI_LIST.map(kategori => {
                              const isCreated = isCompetitionCreated(desa.nama_desa, golongan, kategori, competitionSubTab.toUpperCase());
                              const isCreating = creatingCompetition === `${desa.nama_desa}-${golongan}-${kategori}-${competitionSubTab.toUpperCase()}`;
                              return (
                                <button key={kategori} onClick={() => createCompetition(desa, golongan, kategori, competitionSubTab.toUpperCase())} disabled={isCreated || isCreating}
                                  className={`text-xs px-2 py-1 rounded font-medium ${isCreated ? 'bg-green-100 text-green-800 cursor-not-allowed' : isCreating ? 'bg-yellow-100 text-yellow-800 cursor-wait' : 'bg-red-100 hover:bg-red-200 text-red-700'}`}>
                                  {isCreated ? '✅ CREATED' : isCreating ? '⏳...' : kategori}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Sesi {competitionSubTab.toUpperCase()} - Override Control</h3>
                {competitions.filter(c => c.kelas === competitionSubTab.toUpperCase()).length === 0 ? (
                  <p className="text-gray-500">Belum ada sesi pertandingan untuk kelas {competitionSubTab.toUpperCase()}</p>
                ) : (
                  <div className="space-y-3">
                    {competitions.filter(c => c.kelas === competitionSubTab.toUpperCase()).map(competition => (
                      <div key={competition.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{competition.desa} - {competition.kategori}</p>
                          <p className="text-sm text-gray-600">{competition.golongan} {competition.kelas}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${competition.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{competition.status}</span>
                          <button onClick={() => toggleCompetitionStatus(competition)} className="border border-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-50">
                            {competition.status === 'ACTIVE' ? 'Selesai' : 'Aktifkan'}
                          </button>
                          <button onClick={() => deleteCompetition(competition.id, `${competition.desa} - ${competition.kategori}`)} className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded text-xs">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {competitionView === 'results' && (
            <div>
              {competitionSubTab === 'juara_umum' ? (
                <JuaraUmumGabungan />
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ranking & Hasil - {competitionSubTab.toUpperCase()}</h3>
                  <RankingView kelas={competitionSubTab.toUpperCase() as 'PUTRA' | 'PUTRI'} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'details' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Detail Penilaian</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><h3 className="text-lg font-medium mb-4">Detail Penilaian PUTRA</h3><ResultsView kelas="PUTRA" /></div>
            <div><h3 className="text-lg font-medium mb-4">Detail Penilaian PUTRI</h3><ResultsView kelas="PUTRI" /></div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Log Aktivitas</h2>
          <div className="card">
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.action}</p>
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

      {activeTab === 'system' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Statistik Sistem</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Total User:</span><span className="font-medium">{users.length}</span></div>
                <div className="flex justify-between"><span>User Aktif:</span><span className="font-medium text-green-600">{users.filter(u => u.is_active).length}</span></div>
                <div className="flex justify-between"><span>Total Log:</span><span className="font-medium">{logs.length}</span></div>
                <div className="flex justify-between"><span>Sistem:</span><span className="font-medium text-blue-600">Online</span></div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Manajemen Desa</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Nama desa baru..."
                  value={newDesaName}
                  onChange={e => setNewDesaName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && newDesaName.trim() && addDesa()}
                  className="border rounded px-3 py-2 flex-1 text-sm"
                />
                <button
                  onClick={addDesa}
                  disabled={!newDesaName.trim()}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >Tambah</button>
              </div>
              <div className="space-y-2">
                {desaList.map(d => (
                  <div key={d.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-gray-900">{d.nama_desa}</span>
                    <button onClick={() => deleteDesa(d.id, d.nama_desa)} className="text-red-600 hover:text-red-800 text-xs">Hapus</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'administrasi' && <AdministrasiPertandingan userRole={user.role} userId={user.id} />}
    </div>
  );
}
