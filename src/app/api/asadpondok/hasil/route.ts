import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPondokHasil, getAllPondokTeori } from '@/lib/turso/db';
import { turso } from '@/lib/turso/client';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const kelas = request.nextUrl.searchParams.get('kelas') || undefined;
  const [hasil, teoriList, assignmentRes] = await Promise.all([
    getPondokHasil(kelas),
    getAllPondokTeori(),
    turso.execute({ sql: `SELECT a.peserta_id, a.penguji_id, u.full_name FROM pondok_assignment a JOIN pondok_users u ON a.penguji_id = u.id`, args: [] }),
  ]);
  const totalTeoriItems = teoriList.length;

  // Map assignment
  const assignmentMap: Record<number, string> = {};
  assignmentRes.rows.forEach((r: any) => {
    assignmentMap[Number(r.peserta_id)] = r.full_name as string;
  });

  const TOTAL_JURUS = 11;

  // Ambil jumlah jurus & teori per (peserta, penguji) dari assignment
  const [jurusCountRes, teoriCountRes] = await Promise.all([
    turso.execute({
      sql: `SELECT nj.peserta_id, nj.penguji_id, COUNT(DISTINCT nj.jurus_nama) as cnt
            FROM pondok_nilai_jurus nj
            JOIN pondok_assignment a ON a.peserta_id = nj.peserta_id AND a.penguji_id = nj.penguji_id
            GROUP BY nj.peserta_id, nj.penguji_id`,
      args: [],
    }),
    totalTeoriItems > 0 ? turso.execute({
      sql: `SELECT nt.peserta_id, nt.penguji_id, COUNT(*) as cnt
            FROM pondok_nilai_teori nt
            JOIN pondok_assignment a ON a.peserta_id = nt.peserta_id AND a.penguji_id = nt.penguji_id
            GROUP BY nt.peserta_id, nt.penguji_id`,
      args: [],
    }) : Promise.resolve({ rows: [] }),
  ]);

  const jurusMap: Record<string, number> = {};
  jurusCountRes.rows.forEach((r: any) => { jurusMap[`${r.peserta_id}_${r.penguji_id}`] = Number(r.cnt); });
  const teoriMap: Record<string, number> = {};
  teoriCountRes.rows.forEach((r: any) => { teoriMap[`${r.peserta_id}_${r.penguji_id}`] = Number(r.cnt); });

  // assignmentRes sudah di-fetch di atas, buat map peserta_id -> penguji_id
  const pengujiAssignedMap: Record<number, number> = {};
  assignmentRes.rows.forEach((r: any) => {
    pengujiAssignedMap[Number(r.peserta_id)] = Number(r.penguji_id);
  });

  const statusMap: Record<number, { lengkap: boolean; pengujiDone: number; pengujiTotal: number }> = {};
  hasil.forEach((h: any) => {
    const pid = Number(h.id);
    const pengujiId = pengujiAssignedMap[pid];
    if (!pengujiId) {
      statusMap[pid] = { lengkap: false, pengujiDone: 0, pengujiTotal: 1 };
      return;
    }
    const key = `${pid}_${pengujiId}`;
    const jurusDone = (jurusMap[key] || 0) >= TOTAL_JURUS;
    const teoriDone = totalTeoriItems === 0 || (teoriMap[key] || 0) >= totalTeoriItems;
    const lengkap = jurusDone && teoriDone;
    statusMap[pid] = { lengkap, pengujiDone: lengkap ? 1 : 0, pengujiTotal: 1 };
  });

  const hasilWithStatus = hasil.map((h: any) => ({
    ...h,
    total_nilai: Number(h.total_nilai),
    total_jurus: Number(h.total_jurus),
    total_teori: Number(h.total_teori),
    penguji_nama: assignmentMap[Number(h.id)] || null,
    status: statusMap[Number(h.id)] || { lengkap: false, pengujiDone: 0, pengujiTotal: 0 },
  }));

  return NextResponse.json({ hasil: hasilWithStatus });
}
