'use client';

import { CSSProperties } from 'react';
import { KOP_PADEPOKAN } from '@/lib/absensi/letterTemplates';

export interface PrintPeserta { nama: string; fungsi: string; }
export interface MusyawarahPrintData {
  judul: string;
  tanggal: string;
  tempat: string | null;
  catatan: string | null;
  peserta: PrintPeserta[];
}

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Diformat manual (bukan toLocaleDateString) supaya hasilnya konsisten
// antar-browser saat dicetak / disimpan sebagai PDF.
function formatTanggalPanjang(t: string) {
  if (!t) return '-';
  const d = new Date(t.length <= 10 ? t + 'T00:00:00' : t);
  if (isNaN(d.getTime())) return t;
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTanggalCetak(d: Date) {
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} WIB`;
}

// Sama persis dengan gaya kertas surat resmi (Letter Generator) supaya
// semua dokumen cetak ASAD punya identitas visual yang konsisten.
const S: Record<string, CSSProperties> = {
  paper: { fontFamily: '"Times New Roman", Times, serif', color: '#111', padding: '32px 34px', fontSize: 13, lineHeight: 1.5, width: 794, maxWidth: 'none' },
  kopBox: { borderBottom: '4px double #000', paddingBottom: 6, marginBottom: 16, position: 'relative', textAlign: 'center', minHeight: 70 },
  kopLogo: { position: 'absolute', left: 4, top: 0, width: 64, height: 64, objectFit: 'contain' },
  kopB1: { fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.15 },
  kopB2: { fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.15 },
  kopB3: { fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.15, letterSpacing: 1 },
  kopB4: { fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.15 },
  kopAlamat: { fontSize: 10.5, margin: '4px 0 0' },
  kopKontak: { fontSize: 10.5, margin: 0 },
  title: { textAlign: 'center', fontWeight: 700, fontSize: 16, textDecoration: 'underline', margin: '0 0 2px' },
  subtitle: { textAlign: 'center', fontWeight: 700, fontSize: 14, margin: '0 0 14px' },
  infoTable: { margin: '0 0 14px', borderCollapse: 'collapse' },
  infoLabel: { verticalAlign: 'top', paddingRight: 8, whiteSpace: 'nowrap', width: 140 },
  infoColon: { verticalAlign: 'top', paddingRight: 6 },
  infoVal: { fontWeight: 700 },
  sectionTitle: { fontWeight: 700, fontSize: 13, margin: '14px 0 8px', borderBottom: '1px solid #999', paddingBottom: 3 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  theadRow: { background: '#1f4e79', color: '#fff' },
  thNo: { border: '1px solid #333', padding: '5px 6px', width: 40, textAlign: 'center' },
  th: { border: '1px solid #333', padding: '5px 6px', textAlign: 'left' },
  tdNo: { border: '1px solid #333', padding: '4px 6px', textAlign: 'center' },
  td: { border: '1px solid #333', padding: '4px 6px' },
  emptyNote: { fontSize: 12, color: '#666', fontStyle: 'italic', margin: '4px 0' },
  catatanBox: { textAlign: 'justify', whiteSpace: 'pre-wrap', margin: '4px 0 0', fontSize: 13 },
  ttdWrap: { marginTop: 34, display: 'flex', justifyContent: 'flex-end' },
  ttdCol: { textAlign: 'center', width: 230 },
  ttdSpace: { height: 60 },
  ttdName: { fontWeight: 700, textDecoration: 'underline' },
  footerNote: { marginTop: 30, paddingTop: 6, borderTop: '1px solid #ddd', fontSize: 9.5, color: '#888', textAlign: 'right' },
};

export default function MusyawarahPrintView({ data, printedAt }: { data: MusyawarahPrintData; printedAt: Date }) {
  const peserta = data.peserta || [];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #musyawarah-print-area, #musyawarah-print-area * { visibility: visible !important; }
          #musyawarah-print-area { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
          @page { size: A4; margin: 16mm; }
        }
      `}</style>

      {/* Diposisikan di luar layar saat tampilan normal (fixed → kebal dari
          overflow/clip ancestor manapun); dipindah ke (0,0) hanya saat mode
          cetak lewat CSS di atas. */}
      <div id="musyawarah-print-area" style={{ position: 'fixed', left: -99999, top: 0 }}>
        <div style={S.paper}>
          <div style={S.kopBox}>
            <img src="/images/logo.png" alt="" style={S.kopLogo} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <p style={S.kopB1}>{KOP_PADEPOKAN.baris1}</p>
            <p style={S.kopB2}>{KOP_PADEPOKAN.baris2}</p>
            <p style={S.kopB3}>{KOP_PADEPOKAN.baris3}</p>
            <p style={S.kopB4}>{KOP_PADEPOKAN.baris4}</p>
            <p style={S.kopAlamat}>{KOP_PADEPOKAN.alamat}</p>
            <p style={S.kopKontak}>{KOP_PADEPOKAN.kontak}</p>
          </div>

          <p style={S.title}>NOTULENSI MUSYAWARAH</p>
          <p style={S.subtitle}>{data.judul}</p>

          <table style={S.infoTable}><tbody>
            <tr>
              <td style={S.infoLabel}>Hari / Tanggal</td>
              <td style={S.infoColon}>:</td>
              <td style={S.infoVal}>{formatTanggalPanjang(data.tanggal)}</td>
            </tr>
            {data.tempat && (
              <tr>
                <td style={S.infoLabel}>Tempat</td>
                <td style={S.infoColon}>:</td>
                <td style={S.infoVal}>{data.tempat}</td>
              </tr>
            )}
            <tr>
              <td style={S.infoLabel}>Jumlah Peserta Hadir</td>
              <td style={S.infoColon}>:</td>
              <td style={S.infoVal}>{peserta.length} orang</td>
            </tr>
          </tbody></table>

          <h2 style={S.sectionTitle}>DAFTAR PESERTA HADIR</h2>
          {peserta.length > 0 ? (
            <table style={S.table}>
              <thead><tr style={S.theadRow}>
                <th style={S.thNo}>No</th>
                <th style={S.th}>Nama</th>
                <th style={S.th}>Fungsi / Jabatan</th>
              </tr></thead>
              <tbody>
                {peserta.map((p, i) => (
                  <tr key={i}>
                    <td style={S.tdNo}>{i + 1}</td>
                    <td style={S.td}>{p.nama}</td>
                    <td style={S.td}>{p.fungsi || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={S.emptyNote}>Tidak ada peserta tercatat.</p>
          )}

          <h2 style={S.sectionTitle}>HASIL / ISI MUSYAWARAH</h2>
          {data.catatan?.trim() ? (
            <p style={S.catatanBox}>{data.catatan}</p>
          ) : (
            <p style={S.emptyNote}>Catatan musyawarah belum diisi.</p>
          )}

          <div style={S.ttdWrap}>
            <div style={S.ttdCol}>
              <div>Notulis / Sekretaris,</div>
              <div style={S.ttdSpace} />
              <div style={S.ttdName}>(.......................................)</div>
            </div>
          </div>

          <p style={S.footerNote}>Dicetak dari Sistem Informasi ASAD pada {formatTanggalCetak(printedAt)}</p>
        </div>
      </div>
    </>
  );
}
