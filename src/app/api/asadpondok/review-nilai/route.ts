import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPondokNilaiJurus, getPondokNilaiTeori, getAllPondokPeserta, getAllPondokTeori, getAllPondokUsers } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const kelas = request.nextUrl.searchParams.get('kelas') || undefined;

  const [pesertaAll, teoriList, usersAll, nilaiJurusAll, nilaiTeoriAll] = await Promise.all([
    getAllPondokPeserta(kelas),
    getAllPondokTeori(),
    getAllPondokUsers(),
    getPondokNilaiJurus(),
    getPondokNilaiTeori(),
  ]);

  const pengujiList = (usersAll as any[]).filter(u =>
    u.role === 'penguji_sm_putra' || u.role === 'penguji_sm_putri'
  );

  return NextResponse.json({ peserta: pesertaAll, teori: teoriList, penguji: pengujiList, nilaiJurus: nilaiJurusAll, nilaiTeori: nilaiTeoriAll });
}
