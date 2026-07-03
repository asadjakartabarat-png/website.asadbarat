import { NextRequest, NextResponse } from 'next/server';
import { saveKehadiran } from '@/lib/turso/absensiPadepokan';

const ALLOWED = ['super_admin', 'koordinator_daerah', 'astrida'];

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await saveKehadiran(Number(body.kegiatan_id), body.records ?? []);
  return NextResponse.json({ success: true });
}
