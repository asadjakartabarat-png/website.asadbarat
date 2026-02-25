import { NextRequest, NextResponse } from 'next/server';
import { getLaporanPerDesa } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const bulan = Number(req.nextUrl.searchParams.get('bulan'));
  const tahun = Number(req.nextUrl.searchParams.get('tahun'));
  const data = await getLaporanPerDesa(bulan, tahun);
  return NextResponse.json({ data });
}
