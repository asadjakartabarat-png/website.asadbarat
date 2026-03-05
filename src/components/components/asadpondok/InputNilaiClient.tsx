'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const JURUS_LIST = ['Jurus 1A','Jurus 1B','Jurus 2A','Jurus 2B','Jurus 3A','Jurus 3B','Jurus 4A','Jurus 4B','Jurus 5','Jurus 6','Jurus 7'];

interface Peserta { id: number; nama: string; kelas: string; }
interface Teori { id: number; nama_teori: string; urutan: number; }
interface NilaiJurus { id: number; jurus_nama: string; nilai: number; created_at: string; }
interface NilaiTeori { id: number; teori_id: number; nilai: number; created_at: string; }

interface Props { user: { id: number; role: string; }; }

function isEditable(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() <= 15 * 60 * 1000;
}

export default function InputNilaiClient({ user }: Props) {
  const [pesertaList, setPesertaList] = useState<Peserta[]>([]);
  const [teoriList, setTeoriList] = useState<Teori[]>([]);
  const [selectedPeserta, setSelectedPeserta] = useState<Peserta | null>(null);
  const [nilaiJurus, setNilaiJurus] = useState<NilaiJurus[]>([]);
  const [nilaiTeori, setNilaiTeori] = useState<NilaiTeori[]>([]);
  const [jurusForm, setJurusForm] = useState<Record<string, string>>({});
  const [teoriForm, setTeoriForm] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const kelas = user.role === 'penguji_sm_putra' ? 'PUTRA' : user.role === 'penguji_sm_putri' ? 'PUTRI' : undefined;

  useEffect(() => {
    const loadData = async () => {
      const [pRes, tRes] = await Promise.all([
        fetch(`/api/asadpondok/peserta${kelas ? `?kelas=${kelas}` : ''}`),
        fetch('/api/asadpondok/teori'),
      ]);
      const [pData, tData] = await Promise.all([pRes.json(), tRes.json()]);
      setPesertaList(pData.peserta || []);
      setTeoriList(tData.teori || []);
    };
    loadData();
  }, [kelas]);

  const loadNilai = useCallback(async (peserta: Peserta) => {
    setLoading(true);
    const [jRes, tRes] = await Promise.all([
      fetch(`/api/asadpondok/nilai-jurus?peserta_id=${peserta.id}&penguji_id=${user.id}`),
      fetch(`/api/asadpondok/nilai-teori?peserta_id=${peserta.id}&penguji_id=${user.id}`),
    ]);
    const [jData, tData] = await Promise.all([jRes.json(), tRes.json()]);
    const nj: NilaiJurus[] = jData.nilai || [];
    const nt: NilaiTeori[] = tData.nilai || [];
    setNilaiJurus(nj);
    setNilaiTeori(nt);
    const jf: Record<string, string> = {};
    JURUS_LIST.forEach(j => { const found = nj.find(n => n.jurus_nama === j); jf[j] = found ? String(found.nilai) : ''; });
    const tf: Record<number, string> = {};
    teoriList.forEach(t => { const found = nt.find(n => n.teori_id === t.id); tf[t.id] = found ? String(found.nilai) : ''; });
    setJurusForm(jf);
    setTeoriForm(tf);
    setLoading(false);
  }, [user.id, teoriList]);

  const selectPeserta = (p: Peserta) => { setSelectedPeserta(p); loadNilai(p); };

  const handleSaveJurus = async (jurusNama: string) => {
    const nilai = parseFloat(jurusForm[jurusNama]);
    if (isNaN(nilai)) return toast.error('Nilai tidak valid');
    setSaving(true);
    const existing = nilaiJurus.find(n => n.jurus_nama === jurusNama);
    if (existing && !isEditable(existing.created_at)) {
      toast.error('Waktu edit sudah habis (15 menit)');
      setSaving(false);
      return;
    }
    const res = await fetch('/api/asadpondok/nilai-jurus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: selectedPeserta!.id, penguji_id: user.id, jurus_nama: jurusNama, nilai }),
    });
    if (res.ok) { toast.success(`${jurusNama} tersimpan`); loadNilai(selectedPeserta!); }
    else { const d = await res.json(); toast.error(d.error || 'Gagal'); }
    setSaving(false);
  };

  const handleSaveTeori = async (teoriId: number) => {
    const nilai = parseFloat(teoriForm[teoriId]);
    if (isNaN(nilai)) return toast.error('Nilai tidak valid');
    setSaving(true);
    const existing = nilaiTeori.find(n => n.teori_id === teoriId);
    if (existing && !isEditable(existing.created_at)) {
      toast.error('Waktu edit sudah habis (15 menit)');
      setSaving(false);
      return;
    }
    const res = await fetch('/api/asadpondok/nilai-teori', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peserta_id: selectedPeserta!.id, penguji_id: user.id, teori_id: teoriId, nilai }),
    });
    if (res.ok) { toast.success('Nilai teori tersimpan'); loadNilai(selectedPeserta!); }
    else { const d = await res.json(); toast.error(d.error || 'Gagal'); }
    setSaving(false);
  };

  if (!selectedPeserta) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Input Nilai {kelas ? `— ${kelas}` : ''}
        </h2>
        <p className="text-sm text-gray-500 mb-4">Pilih peserta untuk mulai input nilai:</p>
        <div className="grid gap-2">
          {pesertaList.map((p, i) => (
            <button key={p.id} onClick={() => selectPeserta(p)}
              className="flex items-center justify-between bg-white border rounded-lg px-4 py-3 hover:border-green-500 hover:bg-green-50 text-left transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-6">{i + 1}</span>
                <span className="font-medium">{p.nama}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${p.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{p.kelas}</span>
            </button>
          ))}
          {pesertaList.length === 0 && <p className="text-center py-8 text-gray-500">Belum ada peserta</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSelectedPeserta(null)} className="text-green-600 hover:underline text-sm">← Kembali</button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{selectedPeserta.nama}</h2>
          <span className={`text-xs px-2 py-0.5 rounded ${selectedPeserta.kelas === 'PUTRA' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>{selectedPeserta.kelas}</span>
        </div>
      </div>

      {loading ? <div className="text-center py-8 text-gray-500">Memuat nilai...</div> : (
        <div className="space-y-6">
          {/* Nilai Jurus */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Nilai Jurus ({JURUS_LIST.length} jurus)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {JURUS_LIST.map(jurus => {
                const existing = nilaiJurus.find(n => n.jurus_nama === jurus);
                const editable = !existing || isEditable(existing.created_at);
                return (
                  <div key={jurus} className="flex items-center gap-2">
                    <label className="text-sm w-24 shrink-0">{jurus}</label>
                    <input
                      type="number" step="0.01" min="0" max="100"
                      value={jurusForm[jurus] || ''}
                      onChange={e => setJurusForm(f => ({ ...f, [jurus]: e.target.value }))}
                      disabled={!editable || saving}
                      className={`flex-1 border rounded px-2 py-1 text-sm ${!editable ? 'bg-gray-100 text-gray-400' : ''}`}
                      placeholder="0"
                    />
                    <button
                      onClick={() => handleSaveJurus(jurus)}
                      disabled={!editable || saving}
                      className={`text-xs px-2 py-1 rounded ${editable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      {existing ? (editable ? 'Edit' : '🔒') : 'Simpan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nilai Teori */}
          {teoriList.length > 0 && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Nilai Teori ({teoriList.length} item)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teoriList.map(t => {
                  const existing = nilaiTeori.find(n => n.teori_id === t.id);
                  const editable = !existing || isEditable(existing.created_at);
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <label className="text-sm flex-1 shrink-0">{t.nama_teori}</label>
                      <input
                        type="number" step="0.01" min="0" max="100"
                        value={teoriForm[t.id] || ''}
                        onChange={e => setTeoriForm(f => ({ ...f, [t.id]: e.target.value }))}
                        disabled={!editable || saving}
                        className={`w-20 border rounded px-2 py-1 text-sm ${!editable ? 'bg-gray-100 text-gray-400' : ''}`}
                        placeholder="0"
                      />
                      <button
                        onClick={() => handleSaveTeori(t.id)}
                        disabled={!editable || saving}
                        className={`text-xs px-2 py-1 rounded ${editable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                      >
                        {existing ? (editable ? 'Edit' : '🔒') : 'Simpan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
