'use client';

import { useState, CSSProperties } from 'react';
import { Printer, Plus, Trash2, FileText } from 'lucide-react';
import {
  LETTER_TEMPLATES, LetterTemplate, Kop, PesertaRow, DataRow,
} from '@/lib/absensi/letterTemplates';

// input 16px di mobile supaya Safari/Chrome iOS tidak auto-zoom saat fokus
const inputCls = 'w-full border rounded-lg px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
const cardCls = 'bg-white rounded-xl shadow p-4 sm:p-5 space-y-4';

const SALAM_PEMBUKA = 'السلام عليكم ورحمة الله وبركاته';
const SALAM_PENUTUP = 'والسلام عليكم ورحمة الله وبركاته';

const S: Record<string, CSSProperties> = {
  paper: { fontFamily: '"Times New Roman", Times, serif', color: '#111', padding: '32px 34px', fontSize: 13, lineHeight: 1.5, width: 794, maxWidth: 'none' },
  kopBox: { borderBottom: '4px double #000', paddingBottom: 6, marginBottom: 14, position: 'relative', textAlign: 'center', minHeight: 70 },
  kopLogo: { position: 'absolute', left: 4, top: 0, width: 64, height: 64, objectFit: 'contain' },
  kopB1: { fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.15 },
  kopB2: { fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.15 },
  kopB3: { fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.15, letterSpacing: 1 },
  kopB4: { fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.15 },
  kopAlamat: { fontSize: 10.5, margin: '4px 0 0' },
  kopKontak: { fontSize: 10.5, margin: 0 },
  topBlock: { display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 10 },
  bold: { fontWeight: 700 },
  indent: { marginLeft: 28 },
  salam: { textAlign: 'center', margin: '12px 0', direction: 'rtl', fontSize: 15 },
  para: { textAlign: 'justify', margin: '8px 0', whiteSpace: 'pre-wrap' },
  detailTable: { margin: '10px 0 10px 28px', borderCollapse: 'collapse' },
  detailLabel: { verticalAlign: 'top', paddingRight: 8, whiteSpace: 'nowrap' },
  detailColon: { verticalAlign: 'top', paddingRight: 6 },
  ttdWrap: { textAlign: 'center', marginTop: 18 },
  ttdRow: { display: 'flex', justifyContent: 'space-between', marginTop: 4, gap: 16 },
  ttdCol: { textAlign: 'center', width: '45%' },
  ttdColRight: { textAlign: 'center', width: 280, marginLeft: 'auto' },
  ttdSpace: { height: 60 },
  lampiranWrap: { marginTop: 26 },
  lampiranTitle: { textAlign: 'center', fontWeight: 700, fontSize: 14, marginBottom: 12 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  theadRow: { background: '#1f4e79', color: '#fff' },
  thNo: { border: '1px solid #333', padding: '5px 6px', width: 40, textAlign: 'center' },
  th: { border: '1px solid #333', padding: '5px 6px', textAlign: 'left' },
  tdNo: { border: '1px solid #333', padding: '4px 6px', textAlign: 'center' },
  td: { border: '1px solid #333', padding: '4px 6px' },
  nb: { marginTop: 10, fontWeight: 700, fontSize: 12 },
  mandatTitle: { textAlign: 'center', fontWeight: 700, fontSize: 16, textDecoration: 'underline', marginTop: 6 },
  mandatNomor: { textAlign: 'center', marginBottom: 12 },
  mandatRow: { display: 'flex', gap: 8, margin: '6px 0' },
  mandatLabel: { width: 130, flexShrink: 0, fontWeight: 600 },
  mandatColon: { width: 10, flexShrink: 0 },
  mandatVal: { flex: 1, whiteSpace: 'pre-wrap' },
  memberi: { textAlign: 'center', fontWeight: 700, margin: '12px 0 8px' },
  tembusan: { marginTop: 24, fontSize: 12 },
  tanggalRight: { textAlign: 'right' },
  kepadaUndangan: { marginBottom: 10 },
  kepadaFormal: { marginBottom: 10, whiteSpace: 'pre-wrap' },
  selesai: { marginTop: 8 },
  jabatanMt: { marginTop: 6 },
};

function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }

export default function LetterGeneratorClient() {
  const [templateId, setTemplateId] = useState(LETTER_TEMPLATES[0].id);
  const [kop, setKop] = useState<Kop>(clone(LETTER_TEMPLATES[0].kop));
  const [fields, setFields] = useState<Record<string, string>>(clone(LETTER_TEMPLATES[0].fields));
  const [peserta, setPeserta] = useState<PesertaRow[]>(clone(LETTER_TEMPLATES[0].peserta ?? []));
  const [penerima, setPenerima] = useState<string[]>(clone(LETTER_TEMPLATES[0].penerima ?? []));
  const [dataList, setDataList] = useState<DataRow[]>(clone(LETTER_TEMPLATES[0].dataList ?? []));
  const [showKelompok, setShowKelompok] = useState<boolean>(LETTER_TEMPLATES[0].showKelompok ?? false);
  const [includeLampiran, setIncludeLampiran] = useState<boolean>((LETTER_TEMPLATES[0].peserta?.length ?? 0) > 0);

  const tpl: LetterTemplate = LETTER_TEMPLATES.find(t => t.id === templateId) ?? LETTER_TEMPLATES[0];
  const kind = tpl.kind;

  const applyTemplate = (id: string) => {
    const t = LETTER_TEMPLATES.find(x => x.id === id) ?? LETTER_TEMPLATES[0];
    setTemplateId(id);
    setKop(clone(t.kop));
    setFields(clone(t.fields));
    setPeserta(clone(t.peserta ?? []));
    setPenerima(clone(t.penerima ?? []));
    setDataList(clone(t.dataList ?? []));
    setShowKelompok(t.showKelompok ?? false);
    setIncludeLampiran((t.peserta?.length ?? 0) > 0);
  };

  const f = (k: string) => fields[k] ?? '';
  const setF = (k: string, v: string) => setFields(p => ({ ...p, [k]: v }));
  const setKopF = (k: keyof Kop, v: string) => setKop(p => ({ ...p, [k]: v }));

  // peserta helpers
  const addPeserta = () => setPeserta(p => [...p, { nama: '', kelompok: '', desa: '' }]);
  const rmPeserta = (i: number) => setPeserta(p => p.filter((_, idx) => idx !== i));
  const upPeserta = (i: number, k: keyof PesertaRow, v: string) => setPeserta(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));
  // penerima helpers
  const addPenerima = () => setPenerima(p => [...p, '']);
  const rmPenerima = (i: number) => setPenerima(p => p.filter((_, idx) => idx !== i));
  const upPenerima = (i: number, v: string) => setPenerima(p => p.map((r, idx) => idx === i ? v : r));
  // dataList helpers
  const addData = () => setDataList(p => [...p, { label: '', value: '' }]);
  const rmData = (i: number) => setDataList(p => p.filter((_, idx) => idx !== i));
  const upData = (i: number, k: keyof DataRow, v: string) => setDataList(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const pesertaTerisi = peserta.filter(p => p.nama.trim());
  const penerimaTerisi = penerima.filter(p => p.trim());
  const dataTerisi = dataList.filter(d => d.label.trim() || d.value.trim());

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #surat-print, #surat-print * { visibility: visible !important; }
          #surat-print { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none !important; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          @page { size: A4; margin: 16mm; }
        }
      `}</style>

      <div className="flex flex-wrap gap-3 justify-between items-center no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Letter Generator</h1>
          <p className="text-sm text-gray-500">Pilih jenis surat, sesuaikan isi, lalu cetak / simpan PDF</p>
        </div>
        <button type="button" onClick={() => window.print()}
          className="bg-green-700 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-800 min-h-[44px] flex items-center gap-2">
          <Printer className="h-4 w-4" /> Cetak / PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ================= FORM ================= */}
        <div className="space-y-4 no-print">
          <div className={cardCls}>
            <label className={labelCls}>Jenis Surat</label>
            <select value={templateId} onChange={e => applyTemplate(e.target.value)} className={inputCls}>
              <optgroup label="Surat Undangan">
                {LETTER_TEMPLATES.filter(t => t.kind === 'undangan').map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </optgroup>
              <optgroup label="Surat Mandat">
                {LETTER_TEMPLATES.filter(t => t.kind === 'mandat').map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </optgroup>
              <optgroup label="Surat Formal / Lainnya">
                {LETTER_TEMPLATES.filter(t => t.kind === 'formal').map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Kop surat (kolapsibel) */}
          <details className="bg-white rounded-xl shadow p-4 sm:p-5">
            <summary className="cursor-pointer font-semibold text-gray-800 flex items-center gap-2"><FileText className="h-4 w-4" /> Kop Surat</summary>
            <div className="mt-4 space-y-3">
              <input value={kop.baris1} onChange={e => setKopF('baris1', e.target.value)} className={inputCls} placeholder="Baris 1" />
              <input value={kop.baris2} onChange={e => setKopF('baris2', e.target.value)} className={inputCls} placeholder="Baris 2" />
              <div className="grid grid-cols-2 gap-3">
                <input value={kop.baris3} onChange={e => setKopF('baris3', e.target.value)} className={inputCls} placeholder="Baris 3" />
                <input value={kop.baris4} onChange={e => setKopF('baris4', e.target.value)} className={inputCls} placeholder="Baris 4" />
              </div>
              <input value={kop.alamat} onChange={e => setKopF('alamat', e.target.value)} className={inputCls} placeholder="Alamat" />
              <input value={kop.kontak} onChange={e => setKopF('kontak', e.target.value)} className={inputCls} placeholder="Kontak" />
            </div>
          </details>

          {/* Nomor / Lamp / Hal / Tanggal */}
          {kind !== 'mandat' && (
            <div className={cardCls}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className={labelCls}>Nomor</label><input value={f('nomor')} onChange={e => setF('nomor', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Lampiran</label><input value={f('lampiran')} onChange={e => setF('lampiran', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Hal / Perihal</label><input value={f('hal')} onChange={e => setF('hal', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Kota &amp; Tanggal</label><input value={f('kota_tanggal')} onChange={e => setF('kota_tanggal', e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Kepada Yth</label><textarea value={f('kepada')} onChange={e => setF('kepada', e.target.value)} rows={kind === 'formal' ? 3 : 2} className={inputCls} /></div>
            </div>
          )}

          {/* ---- UNDANGAN ---- */}
          {kind === 'undangan' && (
            <>
              <div className={cardCls}>
                <div><label className={labelCls}>Kalimat Pembuka</label><textarea value={f('pembuka')} onChange={e => setF('pembuka', e.target.value)} rows={4} className={inputCls} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Hari / Tanggal</label><input value={f('hari_tanggal')} onChange={e => setF('hari_tanggal', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Waktu</label><input value={f('waktu')} onChange={e => setF('waktu', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Tempat</label><input value={f('tempat')} onChange={e => setF('tempat', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Acara</label><input value={f('acara')} onChange={e => setF('acara', e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>NB / Catatan (opsional)</label><input value={f('nb')} onChange={e => setF('nb', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Kalimat Penutup</label><textarea value={f('penutup')} onChange={e => setF('penutup', e.target.value)} rows={3} className={inputCls} /></div>
              </div>
              {renderTtdDuaForm()}
              {renderLampiranForm()}
            </>
          )}

          {/* ---- FORMAL ---- */}
          {kind === 'formal' && (
            <>
              <div className={cardCls}>
                <div><label className={labelCls}>Paragraf Pembuka</label><textarea value={f('paragraf1')} onChange={e => setF('paragraf1', e.target.value)} rows={4} className={inputCls} /></div>
                {renderDataForm()}
                <div><label className={labelCls}>Paragraf Lanjutan (opsional)</label><textarea value={f('paragraf2')} onChange={e => setF('paragraf2', e.target.value)} rows={2} className={inputCls} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div><label className={labelCls}>Hari</label><input value={f('hari')} onChange={e => setF('hari', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Tanggal</label><input value={f('tanggal')} onChange={e => setF('tanggal', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Tempat</label><input value={f('tempat_formal')} onChange={e => setF('tempat_formal', e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Paragraf Penutup</label><textarea value={f('paragraf_penutup')} onChange={e => setF('paragraf_penutup', e.target.value)} rows={3} className={inputCls} /></div>
              </div>
              {renderTtdSatuForm()}
            </>
          )}

          {/* ---- MANDAT ---- */}
          {kind === 'mandat' && (
            <>
              <div className={cardCls}>
                <div><label className={labelCls}>Nomor Surat Mandat</label><input value={f('nomor')} onChange={e => setF('nomor', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Pertimbangan</label><textarea value={f('pertimbangan')} onChange={e => setF('pertimbangan', e.target.value)} rows={2} className={inputCls} /></div>
                <div><label className={labelCls}>Dasar</label><textarea value={f('dasar')} onChange={e => setF('dasar', e.target.value)} rows={3} className={inputCls} /></div>
              </div>
              <div className={cardCls}>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Memberi Mandat Kepada</label>
                  <button type="button" onClick={addPenerima} className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline"><Plus className="h-4 w-4" /> Tambah</button>
                </div>
                {penerima.map((nm, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                    <input value={nm} onChange={e => upPenerima(i, e.target.value)} placeholder="Nama penerima mandat" className={inputCls} />
                    <button type="button" onClick={() => rmPenerima(i)} className="border border-red-300 text-red-600 rounded-lg px-3 py-2.5" aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div className={cardCls}>
                <div><label className={labelCls}>Untuk</label><textarea value={f('untuk')} onChange={e => setF('untuk', e.target.value)} rows={5} className={inputCls} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className={labelCls}>Dikeluarkan di</label><input value={f('dikeluarkan_di')} onChange={e => setF('dikeluarkan_di', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Pada tanggal</label><input value={f('pada_tanggal')} onChange={e => setF('pada_tanggal', e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Jabatan Penandatangan</label><input value={f('jabatan_ttd')} onChange={e => setF('jabatan_ttd', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Nama Penandatangan</label><input value={f('nama_ttd')} onChange={e => setF('nama_ttd', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Tembusan</label><input value={f('tembusan')} onChange={e => setF('tembusan', e.target.value)} className={inputCls} /></div>
              </div>
            </>
          )}
        </div>

        {/* ================= PREVIEW ================= */}
        <div className="lg:sticky lg:top-4 self-start">
          <p className="text-xs text-gray-400 mb-2 no-print">Preview surat (geser untuk melihat penuh)</p>
          <div className="overflow-x-auto border rounded-lg bg-gray-100 p-2 sm:p-3">
            <div id="surat-print" className="bg-white shadow mx-auto" style={S.paper}>
              <KopView kop={kop} />
              {kind === 'undangan' && renderUndanganPreview()}
              {kind === 'formal' && renderFormalPreview()}
              {kind === 'mandat' && renderMandatPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---------- FORM sub-renderers ----------
  function renderTtdDuaForm() {
    return (
      <div className={cardCls}>
        <h3 className="font-semibold text-gray-800">Tanda Tangan</h3>
        <div><label className={labelCls}>Nama Organisasi</label><input value={f('organisasi')} onChange={e => setF('organisasi', e.target.value)} className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Jabatan (Kiri)</label><input value={f('jabatan_kiri')} onChange={e => setF('jabatan_kiri', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Jabatan (Kanan)</label><input value={f('jabatan_kanan')} onChange={e => setF('jabatan_kanan', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Nama (Kiri)</label><input value={f('nama_kiri')} onChange={e => setF('nama_kiri', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Nama (Kanan)</label><input value={f('nama_kanan')} onChange={e => setF('nama_kanan', e.target.value)} className={inputCls} /></div>
        </div>
      </div>
    );
  }

  function renderTtdSatuForm() {
    return (
      <div className={cardCls}>
        <h3 className="font-semibold text-gray-800">Tanda Tangan</h3>
        <div><label className={labelCls}>Jabatan Penandatangan</label><input value={f('jabatan_ttd')} onChange={e => setF('jabatan_ttd', e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Nama Penandatangan</label><input value={f('nama_ttd')} onChange={e => setF('nama_ttd', e.target.value)} className={inputCls} /></div>
      </div>
    );
  }

  function renderDataForm() {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Data (Nama / Kelas / dll)</label>
          <button type="button" onClick={addData} className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline"><Plus className="h-4 w-4" /> Tambah</button>
        </div>
        {dataList.map((d, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-[130px_1fr_auto] gap-2">
            <input value={d.label} onChange={e => upData(i, 'label', e.target.value)} placeholder="Label" className={inputCls} />
            <input value={d.value} onChange={e => upData(i, 'value', e.target.value)} placeholder="Isi" className={inputCls} />
            <button type="button" onClick={() => rmData(i)} className="border border-red-300 text-red-600 rounded-lg px-3 py-2.5 justify-self-start" aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    );
  }

  function renderLampiranForm() {
    return (
      <div className={cardCls}>
        <label className="flex items-center gap-2 font-semibold text-gray-800">
          <input type="checkbox" checked={includeLampiran} onChange={e => setIncludeLampiran(e.target.checked)} className="h-4 w-4 accent-green-700" />
          Sertakan Lampiran Daftar Peserta
        </label>
        {includeLampiran && (
          <>
            <div><label className={labelCls}>Judul Lampiran</label><input value={f('judul_lampiran')} onChange={e => setF('judul_lampiran', e.target.value)} className={inputCls} /></div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={showKelompok} onChange={e => setShowKelompok(e.target.checked)} className="h-4 w-4 accent-green-700" />
              Tampilkan kolom Kelompok
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Daftar Peserta</label>
                <button type="button" onClick={addPeserta} className="text-green-700 text-sm font-medium flex items-center gap-1 hover:underline"><Plus className="h-4 w-4" /> Tambah</button>
              </div>
              {peserta.map((row, i) => (
                <div key={i} className={`grid grid-cols-1 gap-2 ${showKelompok ? 'sm:grid-cols-[20px_1fr_1fr_1fr_auto]' : 'sm:grid-cols-[20px_1fr_1fr_auto]'} sm:items-center`}>
                  <span className="hidden sm:block text-xs text-gray-400 text-right">{i + 1}</span>
                  <input value={row.nama} onChange={e => upPeserta(i, 'nama', e.target.value)} placeholder={`${i + 1}. Nama`} className={inputCls} />
                  {showKelompok && <input value={row.kelompok} onChange={e => upPeserta(i, 'kelompok', e.target.value)} placeholder="Kelompok" className={inputCls} />}
                  <input value={row.desa} onChange={e => upPeserta(i, 'desa', e.target.value)} placeholder="Desa" className={inputCls} />
                  <button type="button" onClick={() => rmPeserta(i)} disabled={peserta.length === 1} className="border border-red-300 text-red-600 rounded-lg px-3 py-2.5 disabled:opacity-40 justify-self-start" aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div><label className={labelCls}>Catatan Lampiran</label><input value={f('catatan_lampiran')} onChange={e => setF('catatan_lampiran', e.target.value)} className={inputCls} /></div>
          </>
        )}
      </div>
    );
  }

  // ---------- PREVIEW sub-renderers ----------
  function TopBlock({ withNomor }: { withNomor: boolean }) {
    return (
      <div style={S.topBlock}>
        <div>
          {withNomor && f('nomor') && <div>No&nbsp;&nbsp;&nbsp;: {f('nomor')}</div>}
          {withNomor && f('lampiran') && <div>Lamp&nbsp;: {f('lampiran')}</div>}
          {withNomor && f('hal') && <div>Hal&nbsp;&nbsp;&nbsp;: {f('hal')}</div>}
        </div>
        <div style={S.tanggalRight}>{f('kota_tanggal')}</div>
      </div>
    );
  }

  function KepadaBlock() {
    return (
      <div style={S.kepadaUndangan}>
        <div>Kepada Yth,</div>
        <div style={S.bold}>{f('kepada')}</div>
        <div>Di-</div>
        <div style={S.indent}>tempat</div>
      </div>
    );
  }

  function DetailRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    if (!value) return null;
    return (
      <tr>
        <td style={S.detailLabel}>{label}</td>
        <td style={S.detailColon}>:</td>
        <td style={bold ? S.bold : undefined}>{value}</td>
      </tr>
    );
  }

  function renderUndanganPreview() {
    return (
      <>
        <TopBlock withNomor={!!(f('nomor') || f('lampiran') || (f('hal') && f('hal') !== 'Undangan'))} />
        <KepadaBlock />
        <div style={S.salam}>{SALAM_PEMBUKA}</div>
        <p style={S.para}>Dengan hormat,</p>
        <p style={S.para}>{f('pembuka')}</p>
        <table style={S.detailTable}><tbody>
          <DetailRow label="Hari / tanggal" value={f('hari_tanggal')} />
          <DetailRow label="Waktu" value={f('waktu')} />
          <DetailRow label="Tempat" value={f('tempat')} />
          <DetailRow label="Acara" value={f('acara')} bold />
          <DetailRow label="NB" value={f('nb')} />
        </tbody></table>
        <p style={S.para}>{f('penutup')}</p>
        <div style={S.salam}>{SALAM_PENUTUP}</div>
        <div style={S.ttdWrap}>
          <div>Hormat kami,</div>
          <div style={S.bold}>{f('organisasi')}</div>
        </div>
        <div style={S.ttdRow}>
          <div style={S.ttdCol}><div>{f('jabatan_kiri')}</div><div style={S.ttdSpace} /><div style={S.bold}>{f('nama_kiri')}</div></div>
          <div style={S.ttdCol}><div>{f('jabatan_kanan')}</div><div style={S.ttdSpace} /><div style={S.bold}>{f('nama_kanan')}</div></div>
        </div>
        {includeLampiran && pesertaTerisi.length > 0 && (
          <div className="page-break" style={S.lampiranWrap}>
            <h2 style={S.lampiranTitle}>{f('judul_lampiran')}</h2>
            <table style={S.table}>
              <thead><tr style={S.theadRow}>
                <th style={S.thNo}>No</th>
                <th style={S.th}>Nama</th>
                {showKelompok && <th style={S.th}>Kelompok</th>}
                <th style={S.th}>Desa</th>
              </tr></thead>
              <tbody>
                {pesertaTerisi.map((p, i) => (
                  <tr key={i}>
                    <td style={S.tdNo}>{i + 1}</td>
                    <td style={S.td}>{p.nama}</td>
                    {showKelompok && <td style={S.td}>{p.kelompok}</td>}
                    <td style={S.td}>{p.desa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {f('catatan_lampiran') && <p style={S.nb}>{f('catatan_lampiran')}</p>}
          </div>
        )}
      </>
    );
  }

  function renderFormalPreview() {
    return (
      <>
        <TopBlock withNomor />
        <div style={S.kepadaFormal}>{f('kepada')}</div>
        <p style={S.para}>Dengan hormat,</p>
        <p style={S.para}>{f('paragraf1')}</p>
        {dataTerisi.length > 0 && (
          <table style={S.detailTable}><tbody>
            {dataTerisi.map((d, i) => (
              <tr key={i}><td style={S.detailLabel}>{d.label}</td><td style={S.detailColon}>:</td><td style={S.bold}>{d.value}</td></tr>
            ))}
          </tbody></table>
        )}
        {f('paragraf2') && <p style={S.para}>{f('paragraf2')}</p>}
        {(f('hari') || f('tanggal') || f('tempat_formal')) && (
          <table style={S.detailTable}><tbody>
            <DetailRow label="Hari" value={f('hari')} />
            <DetailRow label="Tanggal" value={f('tanggal')} />
            <DetailRow label="Tempat" value={f('tempat_formal')} />
          </tbody></table>
        )}
        <p style={S.para}>{f('paragraf_penutup')}</p>
        <div style={S.ttdColRight}>
          <div>{f('jabatan_ttd')}</div>
          <div style={S.ttdSpace} />
          <div style={S.bold}>{f('nama_ttd')}</div>
        </div>
      </>
    );
  }

  function renderMandatPreview() {
    return (
      <>
        <div style={S.mandatTitle}>SURAT MANDAT</div>
        <div style={S.mandatNomor}>Nomor : {f('nomor')}</div>
        <div style={S.mandatRow}><div style={S.mandatLabel}>Pertimbangan</div><div style={S.mandatColon}>:</div><div style={S.mandatVal}>{f('pertimbangan')}</div></div>
        <div style={S.mandatRow}><div style={S.mandatLabel}>Dasar</div><div style={S.mandatColon}>:</div><div style={S.mandatVal}>{f('dasar')}</div></div>
        <div style={S.memberi}>MEMBERI MANDAT</div>
        <div style={S.mandatRow}>
          <div style={S.mandatLabel}>Kepada</div><div style={S.mandatColon}>:</div>
          <div style={S.mandatVal}>
            {penerimaTerisi.map((nm, i) => <div key={i}>{i + 1}. {nm}</div>)}
          </div>
        </div>
        <div style={S.mandatRow}><div style={S.mandatLabel}>Untuk</div><div style={S.mandatColon}>:</div><div style={S.mandatVal}>{f('untuk')}</div></div>
        <div style={S.selesai}>Selesai.</div>
        <div style={S.ttdColRight}>
          <div>Dikeluarkan di : {f('dikeluarkan_di')}</div>
          <div>Pada tanggal&nbsp;: {f('pada_tanggal')}</div>
          <div style={S.jabatanMt}>{f('jabatan_ttd')}</div>
          <div style={S.ttdSpace} />
          <div style={S.bold}>{f('nama_ttd')}</div>
        </div>
        {f('tembusan') && <div style={S.tembusan}>Tembusan : {f('tembusan')}</div>}
      </>
    );
  }
}

function KopView({ kop }: { kop: Kop }) {
  return (
    <div style={S.kopBox}>
      {/* Logo opsional dari /public/images/logo.png */}
      <img src="/images/logo.png" alt="" style={S.kopLogo} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      <p style={S.kopB1}>{kop.baris1}</p>
      <p style={S.kopB2}>{kop.baris2}</p>
      <p style={S.kopB3}>{kop.baris3}</p>
      <p style={S.kopB4}>{kop.baris4}</p>
      <p style={S.kopAlamat}>{kop.alamat}</p>
      <p style={S.kopKontak}>{kop.kontak}</p>
    </div>
  );
}
