import { NextRequest, NextResponse } from 'next/server';
import { getLaporanDKI } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tahun = Number(req.nextUrl.searchParams.get('tahun'));
  const data = await getLaporanDKI(tahun);
  return NextResponse.json({ data });
}
