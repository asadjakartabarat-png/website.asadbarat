// ============================================================
// DATA ANGGOTA & ABSENSI KEGIATAN (Manajemen Asad Padepokan)
// File mandiri agar tidak perlu mengubah db.ts.
// ============================================================
import { turso } from './client';

// ---------------- DATA ANGGOTA ----------------
export async function getAllAnggota(filter?: { desa_id?: number; keyword?: string; aktif?: number }) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (filter?.desa_id) { where.push('ang.desa_id = ?'); args.push(filter.desa_id); }
  if (filter?.aktif !== undefined) { where.push('ang.aktif = ?'); args.push(filter.aktif); }
  if (filter?.keyword) { where.push('ang.nama LIKE ?'); args.push('%' + filter.keyword + '%'); }
  const sql = `SELECT ang.*, ad.nama_desa, ak.nama_kelompok
               FROM absensi_anggota ang
               LEFT JOIN absensi_desa ad ON ang.desa_id = ad.id
               LEFT JOIN absensi_kelompok ak ON ang.kelompok_id = ak.id
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY ad.nama_desa, ak.nama_kelompok, ang.nama`;
  const result = await turso.execute({ sql, args });
  return result.rows;
}

export async function createAnggota(data: {
  nama: string; desa_id?: number | null; kelompok_id?: number | null;
  jenis_kelamin?: string | null; status?: string | null; no_hp?: string | null; aktif?: number;
}) {
  const now = new Date().toISOString();
  const res = await turso.execute({
    sql: `INSERT INTO absensi_anggota (nama, desa_id, kelompok_id, jenis_kelamin, status, no_hp, aktif, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.nama, data.desa_id ?? null, data.kelompok_id ?? null, data.jenis_kelamin ?? null, data.status ?? null, data.no_hp ?? null, data.aktif ?? 1, now, now],
  });
  return Number(res.lastInsertRowid);
}

export async function updateAnggota(id: number, data: {
  nama: string; desa_id?: number | null; kelompok_id?: number | null;
  jenis_kelamin?: string | null; status?: string | null; no_hp?: string | null; aktif?: number;
}) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `UPDATE absensi_anggota SET nama=?, desa_id=?, kelompok_id=?, jenis_kelamin=?, status=?, no_hp=?, aktif=?, updated_at=? WHERE id=?`,
    args: [data.nama, data.desa_id ?? null, data.kelompok_id ?? null, data.jenis_kelamin ?? null, data.status ?? null, data.no_hp ?? null, data.aktif ?? 1, now, id],
  });
}

export async function deleteAnggota(id: number) {
  await turso.execute({ sql: `DELETE FROM absensi_anggota WHERE id = ?`, args: [id] });
}

// cari desa berdasarkan nama, buat baru bila belum ada -> kembalikan id
async function findOrCreateDesa(nama: string): Promise<number | null> {
  const n = nama.trim();
  if (!n) return null;
  const found = await turso.execute({ sql: `SELECT id FROM absensi_desa WHERE lower(nama_desa) = lower(?) LIMIT 1`, args: [n] });
  if (found.rows.length) return Number(found.rows[0].id);
  const now = new Date().toISOString();
  const res = await turso.execute({ sql: `INSERT INTO absensi_desa (nama_desa, created_at) VALUES (?, ?)`, args: [n, now] });
  return Number(res.lastInsertRowid);
}

async function findOrCreateKelompok(desaId: number | null, nama: string): Promise<number | null> {
  const n = nama.trim();
  if (!n || !desaId) return null;
  const found = await turso.execute({ sql: `SELECT id FROM absensi_kelompok WHERE desa_id = ? AND lower(nama_kelompok) = lower(?) LIMIT 1`, args: [desaId, n] });
  if (found.rows.length) return Number(found.rows[0].id);
  const now = new Date().toISOString();
  const res = await turso.execute({ sql: `INSERT INTO absensi_kelompok (desa_id, nama_kelompok, target_putra, target_putri, created_at) VALUES (?, ?, 0, 0, ?)`, args: [desaId, n, now] });
  return Number(res.lastInsertRowid);
}

// Import massal. Tiap baris: { nama, desa, kelompok, jenis_kelamin?, status?, no_hp? }
// desa & kelompok berupa NAMA (teks); otomatis dicocokkan / dibuat di master.
export async function bulkCreateAnggota(rows: Array<{
  nama: string; desa?: string; kelompok?: string; jenis_kelamin?: string; status?: string; no_hp?: string;
}>) {
  let inserted = 0;
  for (const r of rows) {
    if (!r.nama?.trim()) continue;
    const desaId = r.desa ? await findOrCreateDesa(r.desa) : null;
    const kelompokId = r.kelompok ? await findOrCreateKelompok(desaId, r.kelompok) : null;
    await createAnggota({
      nama: r.nama.trim(), desa_id: desaId, kelompok_id: kelompokId,
      jenis_kelamin: r.jenis_kelamin?.trim() || null, status: r.status?.trim() || null, no_hp: r.no_hp?.trim() || null, aktif: 1,
    });
    inserted++;
  }
  return inserted;
}

// ---------------- KEGIATAN ----------------
export async function getAllKegiatan() {
  const result = await turso.execute({
    sql: `SELECT k.*,
            (SELECT COUNT(*) FROM absensi_kegiatan_kehadiran h WHERE h.kegiatan_id = k.id AND h.status = 'hadir') as hadir_count,
            (SELECT COUNT(*) FROM absensi_kegiatan_kehadiran h WHERE h.kegiatan_id = k.id) as total_count
          FROM absensi_kegiatan k
          ORDER BY k.tanggal DESC, k.id DESC`,
    args: [],
  });
  return result.rows;
}

export async function getKegiatanById(id: number) {
  const head = await turso.execute({ sql: `SELECT * FROM absensi_kegiatan WHERE id = ?`, args: [id] });
  if (head.rows.length === 0) return null;
  const kehadiran = await turso.execute({
    sql: `SELECT id, anggota_id, nama, nama_desa, nama_kelompok, status, is_tamu FROM absensi_kegiatan_kehadiran WHERE kegiatan_id = ? ORDER BY nama_desa, nama`,
    args: [id],
  });
  const rekap = await turso.execute({
    sql: `SELECT COALESCE(nama_desa, '(Tanpa Desa)') as nama_desa,
            SUM(CASE WHEN status='hadir' THEN 1 ELSE 0 END) as hadir,
            SUM(CASE WHEN status='izin' THEN 1 ELSE 0 END) as izin,
            SUM(CASE WHEN status='sakit' THEN 1 ELSE 0 END) as sakit,
            SUM(CASE WHEN status='alfa' THEN 1 ELSE 0 END) as alfa,
            COUNT(*) as total
          FROM absensi_kegiatan_kehadiran WHERE kegiatan_id = ?
          GROUP BY nama_desa ORDER BY nama_desa`,
    args: [id],
  });
  return { ...head.rows[0], kehadiran: kehadiran.rows, rekap: rekap.rows };
}

export async function createKegiatan(data: {
  nama: string; jenis?: string | null; tanggal: string; tempat?: string | null; keterangan?: string | null; created_by: number;
}) {
  const now = new Date().toISOString();
  const res = await turso.execute({
    sql: `INSERT INTO absensi_kegiatan (nama, jenis, tanggal, tempat, keterangan, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.nama, data.jenis ?? null, data.tanggal, data.tempat ?? null, data.keterangan ?? null, data.created_by, now, now],
  });
  return Number(res.lastInsertRowid);
}

export async function updateKegiatan(id: number, data: {
  nama: string; jenis?: string | null; tanggal: string; tempat?: string | null; keterangan?: string | null;
}) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `UPDATE absensi_kegiatan SET nama=?, jenis=?, tanggal=?, tempat=?, keterangan=?, updated_at=? WHERE id=?`,
    args: [data.nama, data.jenis ?? null, data.tanggal, data.tempat ?? null, data.keterangan ?? null, now, id],
  });
}

export async function deleteKegiatan(id: number) {
  await turso.execute({ sql: `DELETE FROM absensi_kegiatan_kehadiran WHERE kegiatan_id = ?`, args: [id] });
  await turso.execute({ sql: `DELETE FROM absensi_kegiatan WHERE id = ?`, args: [id] });
}

// Simpan kehadiran: hapus lama untuk kegiatan lalu masukkan yang baru.
export async function saveKehadiran(kegiatanId: number, records: Array<{
  anggota_id?: number | null; nama: string; nama_desa?: string | null; nama_kelompok?: string | null; status: string; is_tamu?: number;
}>) {
  const now = new Date().toISOString();
  await turso.execute({ sql: `DELETE FROM absensi_kegiatan_kehadiran WHERE kegiatan_id = ?`, args: [kegiatanId] });
  for (const r of records) {
    if (!r.nama?.trim() || !r.status) continue;
    await turso.execute({
      sql: `INSERT INTO absensi_kegiatan_kehadiran (kegiatan_id, anggota_id, nama, nama_desa, nama_kelompok, status, is_tamu, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [kegiatanId, r.anggota_id ?? null, r.nama, r.nama_desa ?? null, r.nama_kelompok ?? null, r.status, r.is_tamu ?? 0, now],
    });
  }
}
