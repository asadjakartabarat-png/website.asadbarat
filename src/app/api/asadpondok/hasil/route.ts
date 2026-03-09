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
  const [hasil, teoriList, pengujiRes] = await Promise.all([
    getPondokHasil(kelas),
    getAllPondokTeori(),
    turso.execute({ sql: `SELECT id, role FROM pondok_users WHERE is_active = 1 AND role IN ('penguji_sm_putra','penguji_sm_putri')`, args: [] }),
  ]);
  const totalTeoriItems = teoriList.length;

  const kelasArr = kelas ? [kelas] : ['PUTRA', 'PUTRI'];
  const statusMap: Record<number, { lengkap: boolean; pengujiDone: number; pengujiTotal: number }> = {};

  for (const k of kelasArr) {
    const roleKelas = k === 'PUTRA' ? 'penguji_sm_putra' : 'penguji_sm_putri';
    const pengujiKelas = pengujiRes.rows.filter(r => r.role === roleKelas).map(r => Number(r.id));
    const pengujiTotal = pengujiKelas.length;

    if (pengujiTotal === 0) {
      hasil.filter((h: any) => h.kelas === k).forEach((h: any) => {
        statusMap[Number(h.id)] = { lengkap: false, pengujiDone: 0, pengujiTotal: 0 };
      });
      continue;
    }

    // Hitung totalJurusItems khusus per kelas (dari penguji kelas ini)
    const jurusDistinctRes = await turso.execute({
      sql: `SELECT COUNT(DISTINCT jurus_nama) as cnt FROM pondok_nilai_jurus WHERE penguji_id IN (${pengujiKelas.join(',')})`,
      args: [],
    });
    const totalJurusItems = Number(jurusDistinctRes.rows[0]?.cnt ?? 0);

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
        const jurusDone = totalJurusItems === 0 || (jurusMap[key] || 0) >= totalJurusItems;
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
    status: statusMap[Number(h.id)] || { lengkap: false, pengujiDone: 0, pengujiTotal: 0 },
  }));

  return NextResponse.json({ hasil: hasilWithStatus });
}
