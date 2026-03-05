import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllPondokPeserta, createPondokPeserta } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const kelas = request.nextUrl.searchParams.get('kelas') || undefined;
  const peserta = await getAllPondokPeserta(kelas);
  return NextResponse.json({ peserta });
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { nama, kelas } = await request.json();
  if (!nama || !kelas) return NextResponse.json({ error: 'Nama dan kelas wajib diisi' }, { status: 400 });
  const peserta = await createPondokPeserta({ nama, kelas });
  return NextResponse.json({ peserta }, { status: 201 });
}
