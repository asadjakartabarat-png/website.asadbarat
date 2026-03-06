import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { upsertPondokUnlockOverride, getPondokUnlockOverride } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const pesertaId = request.nextUrl.searchParams.get('peserta_id');
  const pengujiId = request.nextUrl.searchParams.get('penguji_id');
  const overrides = await getPondokUnlockOverride(
    pesertaId ? Number(pesertaId) : undefined,
    pengujiId ? Number(pengujiId) : undefined,
  );
  return NextResponse.json({ overrides });
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'superadmin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { peserta_id, penguji_id } = await request.json();
  if (!peserta_id || !penguji_id)
    return NextResponse.json({ error: 'peserta_id dan penguji_id wajib' }, { status: 400 });

  await upsertPondokUnlockOverride({ peserta_id, penguji_id, unlocked_by: session.username });
  return NextResponse.json({ success: true });
}
