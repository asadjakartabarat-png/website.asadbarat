'use client';

import { useState, useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  undianId: string;
  desa: string;
  kategori: string;
  golongan: string;
  kelas: string;
  isLocked: boolean;
  onUpdate: () => void;
}

export default function ModalPeserta({ isOpen, onClose, undianId, desa, kategori, golongan, kelas, isLocked, onUpdate }: Props) {
  const [peserta, setPeserta] = useState<any[]>([]);
  const [namaPeserta, setNamaPeserta] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && undianId) fetchPeserta();
    const handleKeyDown = (e: KeyboardEvent) => { if (isOpen && !e.ctrlKey && !e.altKey && !e.metaKey) e.stopPropagation(); };
    if (isOpen) document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, undianId]);

  const fetchPeserta = async () => {
    try {
      const res = await fetch(`/api/pasanggiri/peserta?undian_id=${undianId}`);
      const data = await res.json();
      setPeserta(data);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPeserta.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        await fetch('/api/pasanggiri/peserta', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, nama_peserta: namaPeserta }) });
        setEditingId(null);
      } else {
        await fetch('/api/pasanggiri/peserta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ undian_id: undianId, nama_peserta: namaPeserta }) });
      }
      setNamaPeserta('');
      fetchPeserta();
      onUpdate();
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus peserta ini?')) return;
    try {
      await fetch(`/api/pasanggiri/peserta?id=${id}`, { method: 'DELETE' });
      fetchPeserta();
      onUpdate();
    } catch (error) { console.error(error); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose} onKeyDown={e => e.stopPropagation()}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Data Peserta - {desa}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="mb-4 text-sm text-gray-600">
          <p>Kategori: <span className="font-semibold">{kategori} ({golongan}) - {kelas}</span></p>
        </div>

        {!isLocked && (
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Nama Peserta:</label>
            <div className="flex gap-2">
              <input type="text" value={namaPeserta} onChange={e => setNamaPeserta(e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Masukkan nama peserta" disabled={loading} />
              <button type="submit" disabled={loading || !namaPeserta.trim()} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50">
                {editingId ? 'Update' : '+ Tambah'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setNamaPeserta(''); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Batal</button>
              )}
            </div>
          </form>
        )}

        <div className="border-t border-gray-300 pt-4">
          <h4 className="font-semibold mb-3 text-gray-900">Daftar Peserta: ({peserta.length})</h4>
          {peserta.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada peserta</p>
          ) : (
            <div className="space-y-2">
              {peserta.map((p, idx) => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-900">{idx + 1}. {p.nama_peserta}</span>
                  {!isLocked && (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(p.id); setNamaPeserta(p.nama_peserta); }} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">Tutup</button>
        </div>
      </div>
    </div>
  );
}
