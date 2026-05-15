'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Peserta { id: number; nama: string; kelas: string; }
interface Penguji { id: number; username: string; full_name: string; role: string; }
interface Assignment {
  id: number;
  peserta_id: number;
  penguji_id: number;
  is_locked: number;
  peserta_nama: string;
  kelas: string;
  penguji_username: string;
  penguji_full_name: string;
}

export default function AssignmentClient() {
  const [activeTab, setActiveTab] = useState<'assignment' | 'monitoring' | 'progress'>('assignment');
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [pengujiList, setPengujiList] = useState<Penguji[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('PUTRA');
  const [saving, setSaving] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [pRes, uRes, aRes] = await Promise.all([
      fetch('/api/asadpondok/peserta'),
      fetch('/api/asadpondok/users'),
      fetch('/api/asadpondok/assignment'),
    ]);
    const [pData, uData, aData] = await Promise.all([pRes.json(), uRes.json(), aRes.json()]);
    setPesertaList(pData.peserta || []);
    setPengujiList((uData.users || []).filter((u: Penguji) =>
      u.role === 'penguji_sm_putra' || u.role === 'penguji_sm_putri'
    ));
    setAssignments(aData.assignments || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAssign = async (pesertaId: number, pengujiId: number) => {
    setSaving(pesertaId);
    const existing = assignments.find(a => a.peserta_id === pesertaId);
    const method = existing ? 'PUT' : 'POST';
    const res = await fetch('/api/asadpondok/assignment', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: pesertaId, penguji_id: pengujiId }),
    });
    if (res.ok) {
      toast.success('Assignment tersimpan');
      await loadData();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Gagal menyimpan');
    }
    setSaving(null);
  };

  const handleDelete = async (pesertaId: number) => {
    if (!confirm('Hapus assignment ini?')) return;
    setSaving(pesertaId);
    const res = await fetch('/api/asadpondok/assignment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: pesertaId }),
    });
    if (res.ok) {
      toast.success('Assignment dihapus');
      await loadData();
    } else {
      const err = await res.json();
      toast.error(err.error || 'Gagal menghapus');
    }
    setSaving(null);
  };

  const displayed = pesertaList.filter(p => p.kelas === filterKelas);
  const pengujiKelas = pengujiList.filter(u =>
    (filterKelas === 'PUTRA' && u.role === 'penguji_sm_putra') ||
    (filterKelas === 'PUTRI' && u.role === 'penguji_sm_putri')
  );

  if (loading) return <div className="text-center py-8 text-gray-500">Memuat data...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Assign Penguji ke Peserta</h2>
        <button onClick={loadData} className="text-sm text-green-600 hover:underline">🔄 Refresh</button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-800">
        ⚠️ <strong>Perhatian:</strong> Assignment akan terkunci otomatis setelah penguji menyelesaikan semua penilaian (11 jurus + teori).
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        {[
          { key: 'assignment', label: '📋 Assignment', icon: '📋' },
          { key: 'monitoring', label: '📊 Monitoring', icon: '📊' },
          { key: 'progress', label: '📈 Progress', icon: '📈' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Kelas */}
      <div className="flex gap-2 mb-4">
        {['PUTRA', 'PUTRI'].map(k => (
          <button
            key={k}
            onClick={() => setFilterKelas(k)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filterKelas === k ? 'bg-green-600 text-white' : 'border hover:bg-gray-50'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'assignment' && (
        <AssignmentTab
          peserta={displayed}
          penguji={pengujiKelas}
          assignments={assignments}
          onAssign={handleAssign}
          onDelete={handleDelete}
          saving={saving}
        />
      )}

      {activeTab === 'monitoring' && (
        <MonitoringTab
          penguji={pengujiKelas}
          assignments={assignments.filter(a => {
            const p = pesertaList.find(ps => ps.id === a.peserta_id);
            return p?.kelas === filterKelas;
          })}
          pesertaList={pesertaList}
        />
      )}

      {activeTab === 'progress' && (
        <ProgressTab
          penguji={pengujiKelas}
          assignments={assignments.filter(a => {
            const p = pesertaList.find(ps => ps.id === a.peserta_id);
            return p?.kelas === filterKelas;
          })}
        />
      )}
    </div>
  );
}

function AssignmentTab({
  peserta,
  penguji,
  assignments,
  onAssign,
  onDelete,
  saving,
}: {
  peserta: Peserta[];
  penguji: Penguji[];
  assignments: Assignment[];
  onAssign: (pesertaId: number, pengujiId: number) => void;
  onDelete: (pesertaId: number) => void;
  saving: number | null;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">No</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Peserta</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Kelas</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Penguji</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {peserta.map((p, i) => {
            const assignment = assignments.find(a => a.peserta_id === p.id);
            const isLocked = assignment?.is_locked === 1;
            const isSaving = saving === p.id;
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.nama}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                    {p.kelas}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isLocked ? (
                    <span className="text-gray-600">{assignment.penguji_full_name}</span>
                  ) : (
                    <select
                      value={assignment?.penguji_id || ''}
                      onChange={e => onAssign(p.id, Number(e.target.value))}
                      disabled={isSaving}
                      className="border rounded px-2 py-1 text-sm w-full max-w-xs disabled:opacity-50"
                    >
                      <option value="">-- Pilih Penguji --</option>
                      {penguji.map(pg => (
                        <option key={pg.id} value={pg.id}>
                          {pg.full_name} ({pg.username})
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {!assignment ? (
                    <span className="text-xs text-gray-400">Belum di-assign</span>
                  ) : isLocked ? (
                    <span className="text-xs text-red-600 font-medium">🔒 Locked</span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">🔓 Baru</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {assignment && !isLocked && (
                    <button
                      onClick={() => onDelete(p.id)}
                      disabled={isSaving}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {peserta.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                Belum ada peserta
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MonitoringTab({
  penguji,
  assignments,
  pesertaList,
}: {
  penguji: Penguji[];
  assignments: Assignment[];
  pesertaList: Peserta[];
}) {
  const stats = penguji.map(pg => {
    const assigned = assignments.filter(a => a.penguji_id === pg.id);
    const locked = assigned.filter(a => a.is_locked === 1).length;
    const unlocked = assigned.length - locked;
    return { penguji: pg, total: assigned.length, locked, unlocked };
  });

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Beban Kerja Penguji</h3>
      {stats.map(s => {
        const percent = s.total > 0 ? (s.locked / s.total) * 100 : 0;
        return (
          <div key={s.penguji.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-medium text-gray-900">{s.penguji.full_name}</div>
                <div className="text-xs text-gray-500">@{s.penguji.username}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{s.total} peserta</div>
                <div className="text-xs text-gray-500">
                  {s.locked} selesai, {s.unlocked} proses
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      {stats.length === 0 && (
        <p className="text-center py-8 text-gray-500">Belum ada penguji</p>
      )}
    </div>
  );
}

function ProgressTab({
  penguji,
  assignments,
}: {
  penguji: Penguji[];
  assignments: Assignment[];
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Detail Progress per Penguji</h3>
      {penguji.map(pg => {
        const assigned = assignments.filter(a => a.penguji_id === pg.id);
        return (
          <div key={pg.id} className="bg-white rounded-lg border p-4">
            <div className="font-medium text-gray-900 mb-3">
              {pg.full_name} <span className="text-xs text-gray-500">(@{pg.username})</span>
            </div>
            {assigned.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada peserta yang di-assign</p>
            ) : (
              <div className="space-y-2">
                {assigned.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm border-l-2 border-gray-300 pl-3 py-1">
                    <span className="text-gray-700">{a.peserta_nama}</span>
                    {a.is_locked === 1 ? (
                      <span className="text-xs text-green-600 font-medium">✅ Selesai</span>
                    ) : (
                      <span className="text-xs text-amber-600">⏳ Proses</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {penguji.length === 0 && (
        <p className="text-center py-8 text-gray-500">Belum ada penguji</p>
      )}
    </div>
  );
}
