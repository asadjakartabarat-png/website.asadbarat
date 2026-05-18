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
    turso.execute({ sql: `SELECT a.peserta_id, u.full_name FROM pondok_assignment a JOIN pondok_users u ON a.penguji_id = u.id`, args: [] }),
  ]);
  const totalTeoriItems = teoriList.length;

  // Map assignment
  const assignmentMap: Record<number, string> = {};
  assignmentRes.rows.forEach((r: any) => {
    assignmentMap[Number(r.peserta_id)] = r.full_name as string;
  });

  const kelasArr = kelas ? [kelas] : ['PUTRA', 'PUTRI'];
  const statusMap: Record<number, { lengkap: boolean; pengujiDone: number; pengujiTotal: number }> = {};

  for (const k of kelasArr) {
    const roleKelas = k === 'PUTRA' ? 'penguji_sm_putra' : 'penguji_sm_putri';
    const pengujiRes = await turso.execute({
      sql: `SELECT id FROM pondok_users WHERE is_active = 1 AND role = ?`,
      args: [roleKelas],
    });
    const pengujiKelas = pengujiRes.rows.map(r => Number(r.id));
    const pengujiTotal = pengujiKelas.length;

    if (pengujiTotal === 0) {
      hasil.filter((h: any) => h.kelas === k).forEach((h: any) => {
        statusMap[Number(h.id)] = { lengkap: false, pengujiDone: 0, pengujiTotal: 0 };
      });
      continue;
    }

    const TOTAL_JURUS = 11;

    const jurusCountRes = await turso.execute({
      sql: `SELECT peserta_id, penguji_id, COUNT(*) as cnt FROM pondok_nilai_jurus
            WHERE penguji_id IN (${pengujiKelas.join(',')})
            GROUP BY peserta_id, penguji_id`,
      args: [],
    });
    const teoriCountRes = totalTeoriItems > 0 ? await turso.execute({
      sql: `SELECT peserta_id, penguji_id, COUNT(*) as cnt FROM pondok_nilai_teori
            WHERE penguji_id IN (${pengujiKelas.join(',')})
            GROUP BY peserta_id, penguji_id`,
      args: [],
    }) : { rows: [] };

    const jurusMap: Record<string, number> = {};
    jurusCountRes.rows.forEach((r: any) => { jurusMap[`${r.peserta_id}_${r.penguji_id}`] = Number(r.cnt); });
    const teoriMap: Record<string, number> = {};
    teoriCountRes.rows.forEach((r: any) => { teoriMap[`${r.peserta_id}_${r.penguji_id}`] = Number(r.cnt); });

    hasil.filter((h: any) => h.kelas === k).forEach((h: any) => {
      const pid = Number(h.id);
      let done = 0;
      for (const pengujiId of pengujiKelas) {
        const key = `${pid}_${pengujiId}`;
        const jurusDone = (jurusMap[key] || 0) >= TOTAL_JURUS;
        const teoriDone = totalTeoriItems === 0 || (teoriMap[key] || 0) >= totalTeoriItems;
        if (jurusDone && teoriDone) done++;
      }
      statusMap[pid] = { lengkap: done === pengujiTotal, pengujiDone: done, pengujiTotal };
    });
  }

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
