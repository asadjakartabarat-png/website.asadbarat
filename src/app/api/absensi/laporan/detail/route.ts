import { NextRequest, NextResponse } from 'next/server';
import { getLaporanDetailDesa } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const desa = searchParams.get('desa') || '';
  const bulan = Number(searchParams.get('bulan'));
  const tahun = Number(searchParams.get('tahun'));
  const data = await getLaporanDetailDesa(desa, bulan, tahun);
  const mapped = data.map((r: any) => ({
    kelompok: r.nama_kelompok,
    target_putra: Number(r.target_putra),
    hadir_putra: Number(r.hadir_putra),
    target_putri: Number(r.target_putri),
    hadir_putri: Number(r.hadir_putri),
    total_target: Number(r.target_putra) + Number(r.target_putri),
    total_hadir: Number(r.hadir_putra) + Number(r.hadir_putri),
  }));
  return NextResponse.json({ data: mapped });
}
