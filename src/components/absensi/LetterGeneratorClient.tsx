'use client';

import { useState, CSSProperties } from 'react';
import { Printer, Plus, Trash2 } from 'lucide-react';

// ============================================================
// Daftar jenis surat (template). Tambahkan template baru di sini.
// ============================================================
const LETTER_TEMPLATES = [
  { id: 'undangan_penderesan', label: 'Surat Undangan Penderesan Astrida' },
];

interface PesertaSurat { nama: string; kelompok: string; desa: string; }

const DEFAULT_UNDANGAN = {
  judul_surat: 'SURAT UNDANGAN PENDERESAN ASTRIDA',
  kota_tanggal: 'Jakarta, 5 Juni 2026',
  kepada: 'Bpk Pembina Persinas Asad Desa Se-Padepokan Cengkareng',
  pembuka: 'Dengan segala kerendahan hati, kami mohon kepada Bapak Pembina Asad Desa untuk dapat menghadirkan Alumni Asad Putri Daerah pada:',
  hari_tanggal: 'Minggu, 7 Juni 2026',
  waktu: '09:00 s/d 11:30 WIB',
  tempat: 'GSG Putri',
  acara: 'Penderesan Asad Putri Daerah Padepokan Cengkareng',
  penutup: 'Demikian surat undangan ini kami sampaikan, mengingat pentingnya acara tersebut kami mohon para peserta bisa hadir tepat waktu. Atas perhatiannya kami ucapkan terima kasih. Alhamdulillah Jazakumullohukhoiro.',
  organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
  jabatan_kiri: 'PEMBINA',
  nama_kiri: 'H. Suharyono',
  jabatan_kanan: 'KORDINATOR',
  nama_kanan: 'AHMAD LANGGENG',
  judul_lampiran: 'DAFTAR PESERTA PENDERESAN ASAD PUTRI DAERAH PADEPOKAN CENGKARENG',
  catatan_lampiran: 'NB: SM atau SB yang namanya tidak tercantum supaya tetap bisa hadir',
};

const SALAM_PEMBUKA = 'السلام عليكم ورحمة الله وبركاته';
const SALAM_PENUTUP = 'والسلام عليكم ورحمة الله وبركاته';

const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// Style surat (agar tampil seperti dokumen resmi Times New Roman)
const S: Record<string, CSSProperties> = {
  paper: { fontFamily: '"Times New Roman", Times, serif', color: '#111', padding: '36px 40px', fontSize: 13, lineHeight: 1.5, maxWidth: 794, width: '100%' },
  kopWrap: { textAlign: 'center', marginBottom: 16 },
  kopTitle: { fontSize: 22, fontWeight: 700, letterSpacing: 1, margin: 0, textTransform: 'uppercase' },
  redRule: { height: 3, background: '#c0392b', marginTop: 6 },
  tanggal: { textAlign: 'right', marginBottom: 6 },
  tujuanWrap: { marginBottom: 12 },
  bold: { fontWeight: 700 },
  indent: { marginLeft: 28 },
  salam: { textAlign: 'center', margin: '14px 0', direction: 'rtl', fontSize: 15 },
  para: { textAlign: 'justify', margin: '8px 0' },
  detailTable: { margin: '10px 0 10px 28px', borderCollapse: 'collapse' },
  detailLabel: { width: 120, verticalAlign: 'top', paddingRight: 8 },
  detailColon: { width: 12, verticalAlign: 'top', paddingRight: 6 },
  ttdWrap: { textAlign: 'center', marginTop: 20 },
  ttdRow: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  ttdCol: { textAlign: 'center', width: '45%' },
  ttdSpace: { height: 64 },
  lampiranWrap: { marginTop: 28 },
  lampiranTitle: { textAlign: 'center', fontWeight: 700, fontSize: 14, marginBottom: 12 },
  pesertaTable: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  theadRow: { background: '#1f4e79', color: '#fff' },
  thNo: { border: '1px solid #333', padding: '5px 6px', width: 40, textAlign: 'center' },
  th: { border: '1px solid #333', padding: '5px 6px', textAlign: 'left' },
  tdNo: { border: '1px solid #333', padding: '4px 6px', textAlign: 'center' },
  td: { border: '1px solid #333', padding: '4px 6px' },
  nb: { marginTop: 10, fontWeight: 700, fontSize: 12 },
};

export default function LetterGeneratorClient() {
  const [templateId, setTemplateId] = useState('undangan_penderesan');
  const [form, setForm] = useState({ ...DEFAULT_UNDANGAN });
  const [includeLampiran, setIncludeLampiran] = useState(true);
  const [peserta, setPeserta] = useState<PesertaSurat[]>([{ nama: '', kelompok: '', desa: '' }]);

  const set = (key: keyof typeof DEFAULT_UNDANGAN, val: string) => setForm(p => ({ ...p, [key]: val }));

  const addPeserta = () => setPeserta(p => [...p, { nama: '', kelompok: '', desa: '' }]);
  const removePeserta = (i: number) => setPeserta(p => p.filter((_, idx) => idx !== i));
  const updatePeserta = (i: number, key: keyof PesertaSurat, val: string) =>
    setPeserta(p => p.map((row, idx) => idx === i ? { ...row, [key]: val } : row));

  const handlePrint = () => window.print();

  const pesertaTerisi = peserta.filter(p => p.nama.trim());

  return (
    <div className="space-y-4">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #surat-print, #surat-print * { visibility: visible !important; }
          #surat-print { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          @page { size: A4; margin: 18mm; }
        }
      `}</style>

      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Letter Generator</h1>
          <p className="text-sm text-gray-500">Buat surat resmi dengan cepat lalu cetak / simpan sebagai PDF</p>
        </div>
        <button type="button" onClick={handlePrint}
          className="bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px] flex items-center gap-2">
          <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Cetak / PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============ FORM ============ */}
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
            <div>
              <label className={labelCls}>Jenis Surat</label>
              <select value={templateId} onChange={e => setTemplateId(e.target.value)} className={inputCls}>
                {LETTER_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Judul Surat</label>
              <input value={form.judul_surat} onChange={e => set('judul_surat', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Kota &amp; Tanggal Surat</label>
              <input value={form.kota_tanggal} onChange={e => set('kota_tanggal', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Kepada Yth</label>
              <textarea value={form.kepada} onChange={e => set('kepada', e.target.value)} rows={2} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Kalimat Pembuka</label>
              <textarea value={form.pembuka} onChange={e => set('pembuka', e.target.value)} rows={3} className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className={labelCls}>Hari / Tanggal</label><input value={form.hari_tanggal} onChange={e => set('hari_tanggal', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Waktu</label><input value={form.waktu} onChange={e => set('waktu', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Tempat</label><input value={form.tempat} onChange={e => set('tempat', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Acara</label><input value={form.acara} onChange={e => set('acara', e.target.value)} className={inputCls} /></div>
            </div>
            <div>
              <label className={labelCls}>Kalimat Penutup</label>
              <textarea value={form.penutup} onChange={e => set('penutup', e.target.value)} rows={3} className={inputCls} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Tanda Tangan</h3>
            <div>
              <label className={labelCls}>Nama Organisasi</label>
              <input value={form.organisasi} onChange={e => set('organisasi', e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Jabatan (Kiri)</label><input value={form.jabatan_kiri} onChange={e => set('jabatan_kiri', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Jabatan (Kanan)</label><input value={form.jabatan_kanan} onChange={e => set('jabatan_kanan', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Nama (Kiri)</label><input value={form.nama_kiri} onChange={e => set('nama_kiri', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Nama (Kanan)</label><input value={form.nama_kanan} onChange={e => set('nama_kanan', e.target.value)} className={inputCls} /></div>
            </div>
          </div>

          {/* Lampiran daftar peserta */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
            <label className="flex items-center gap-2 font-semibold text-gray-800">
              <input type="checkbox" checked={includeLampiran} onChange={e => setIncludeLampiran(e.target.checked)} className="h-4 w-4 accent-green-700" />
              Sertakan Lampiran Daftar Peserta
            </label>
            {includeLampiran && (
              <>
                <div>
                  <label className={labelCls}>Judul Lampiran</label>
                  <input value={form.judul_lampiran} onChange={e => set('judul_lampiran', e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Daftar Peserta</label>
                    <button type="button" onClick={addPeserta} className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline"><Plus className="h-4 w-4" /> Tambah</button>
                  </div>
                  {peserta.map((row, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-xs text-gray-400 w-5 pt-2.5 text-right">{i + 1}</span>
                      <input value={row.nama} onChange={e => updatePeserta(i, 'nama', e.target.value)} placeholder="Nama" className={inputCls} />
                      <input value={row.kelompok} onChange={e => updatePeserta(i, 'kelompok', e.target.value)} placeholder="Kelompok" className={inputCls} />
                      <input value={row.desa} onChange={e => updatePeserta(i, 'desa', e.target.value)} placeholder="Desa" className={inputCls} />
                      <button type="button" onClick={() => removePeserta(i)} disabled={peserta.length === 1}
                        className="border border-red-300 text-red-600 rounded-lg px-3 py-2.5 disabled:opacity-40" aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelCls}>Catatan Lampiran</label>
                  <input value={form.catatan_lampiran} onChange={e => set('catatan_lampiran', e.target.value)} className={inputCls} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ============ PREVIEW ============ */}
        <div className="lg:sticky lg:top-20 self-start overflow-x-auto">
          <p className="text-xs text-gray-400 mb-2 no-print">Preview surat</p>
          <div id="surat-print" className="bg-white shadow rounded-lg mx-auto" style={S.paper}>
            {/* Kop / Judul */}
            <div style={S.kopWrap}>
              <h1 style={S.kopTitle}>{form.judul_surat}</h1>
              <div style={S.redRule} />
            </div>

            {/* Tanggal & tujuan */}
            <div style={S.tanggal}>{form.kota_tanggal}</div>
            <div style={S.tujuanWrap}>
              <div>Kepada Yth,</div>
              <div style={S.bold}>{form.kepada}</div>
              <div>Di-</div>
              <div style={S.indent}>tempat</div>
            </div>

            <div style={S.salam}>{SALAM_PEMBUKA}</div>

            <p style={S.para}>Dengan hormat,</p>
            <p style={S.para}>{form.pembuka}</p>

            {/* Detail acara */}
            <table style={S.detailTable}>
              <tbody>
                <tr><td style={S.detailLabel}>Hari / tanggal</td><td style={S.detailColon}>:</td><td>{form.hari_tanggal}</td></tr>
                <tr><td style={S.detailLabel}>Waktu</td><td style={S.detailColon}>:</td><td>{form.waktu}</td></tr>
                <tr><td style={S.detailLabel}>Tempat</td><td style={S.detailColon}>:</td><td>{form.tempat}</td></tr>
                <tr><td style={S.detailLabel}>Acara</td><td style={S.detailColon}>:</td><td style={S.bold}>{form.acara}</td></tr>
              </tbody>
            </table>

            <p style={S.para}>{form.penutup}</p>

            <div style={S.salam}>{SALAM_PENUTUP}</div>

            {/* Tanda tangan */}
            <div style={S.ttdWrap}>
              <div>Hormat kami,</div>
              <div style={S.bold}>{form.organisasi}</div>
            </div>
            <div style={S.ttdRow}>
              <div style={S.ttdCol}>
                <div>{form.jabatan_kiri}</div>
                <div style={S.ttdSpace} />
                <div style={S.bold}>{form.nama_kiri}</div>
              </div>
              <div style={S.ttdCol}>
                <div>{form.jabatan_kanan}</div>
                <div style={S.ttdSpace} />
                <div style={S.bold}>{form.nama_kanan}</div>
              </div>
            </div>

            {/* Lampiran */}
            {includeLampiran && pesertaTerisi.length > 0 && (
              <div className="page-break" style={S.lampiranWrap}>
                <h2 style={S.lampiranTitle}>{form.judul_lampiran}</h2>
                <table style={S.pesertaTable}>
                  <thead>
                    <tr style={S.theadRow}>
                      <th style={S.thNo}>No</th>
                      <th style={S.th}>Nama</th>
                      <th style={S.th}>Kelompok</th>
                      <th style={S.th}>Desa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pesertaTerisi.map((p, i) => (
                      <tr key={i}>
                        <td style={S.tdNo}>{i + 1}</td>
                        <td style={S.td}>{p.nama}</td>
                        <td style={S.td}>{p.kelompok}</td>
                        <td style={S.td}>{p.desa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {form.catatan_lampiran && <p style={S.nb}>{form.catatan_lampiran}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
