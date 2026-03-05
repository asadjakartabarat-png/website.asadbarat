import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllPondokTeori, createPondokTeori } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const teori = await getAllPondokTeori();
  return NextResponse.json({ teori });
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { nama_teori, urutan } = await request.json();
  if (!nama_teori || urutan === undefined)
    return NextResponse.json({ error: 'Nama teori dan urutan wajib diisi' }, { status: 400 });
  const teori = await createPondokTeori({ nama_teori, urutan });
  return NextResponse.json({ teori }, { status: 201 });
}
