import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPondokNilaiJurus, getPondokNilaiTeori, getAllPondokPeserta, getAllPondokTeori } from '@/lib/turso/db';
import { turso } from '@/lib/turso/client';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const kelas = request.nextUrl.searchParams.get('kelas') || undefined;

  const [pesertaAll, teoriList, pengujiRes, nilaiJurusAll, nilaiTeoriAll] = await Promise.all([
    getAllPondokPeserta(kelas),
    getAllPondokTeori(),
    turso.execute({ sql: `SELECT id, username, full_name, role FROM pondok_users WHERE is_active = 1 AND role IN ('penguji_sm_putra', 'penguji_sm_putri')`, args: [] }),
    getPondokNilaiJurus(),
    getPondokNilaiTeori(),
  ]);

  const pengujiList = pengujiRes.rows;

  return NextResponse.json({ peserta: pesertaAll, teori: teoriList, penguji: pengujiList, nilaiJurus: nilaiJurusAll, nilaiTeori: nilaiTeoriAll });
}
