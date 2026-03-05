import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { upsertPondokNilaiJurus, getPondokNilaiJurusByPesertaPenguji } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pesertaId = Number(request.nextUrl.searchParams.get('peserta_id'));
  const pengujiId = Number(request.nextUrl.searchParams.get('penguji_id'));
  if (!pesertaId || !pengujiId)
    return NextResponse.json({ error: 'peserta_id dan penguji_id wajib' }, { status: 400 });
  const nilai = await getPondokNilaiJurusByPesertaPenguji(pesertaId, pengujiId);
  return NextResponse.json({ nilai });
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'penguji_sm_putra', 'penguji_sm_putri'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { peserta_id, penguji_id, jurus_nama, nilai } = await request.json();
  if (!peserta_id || !penguji_id || !jurus_nama || nilai === undefined)
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });

  // Penguji hanya bisa input untuk kelas sesuai role
  if (session.role === 'penguji_sm_putra' && session.id !== penguji_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (session.role === 'penguji_sm_putri' && session.id !== penguji_id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await upsertPondokNilaiJurus({ peserta_id, penguji_id, nilai, jurus_nama });
  return NextResponse.json({ nilai: result });
}
