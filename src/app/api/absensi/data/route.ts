import { NextRequest, NextResponse } from 'next/server';
import { getAbsensiData, upsertAbsensiData } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const bulan = Number(searchParams.get('bulan'));
  const tahun = Number(searchParams.get('tahun'));
  const desaId = searchParams.get('desa_id') ? Number(searchParams.get('desa_id')) : undefined;
  const data = await getAbsensiData(bulan, tahun, desaId);
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await upsertAbsensiData({ ...body, input_by: session.id });
  return NextResponse.json({ success: true });
}
