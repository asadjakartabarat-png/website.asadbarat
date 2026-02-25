import { NextRequest, NextResponse } from 'next/server';
import { getPasanggiriEventStatus, upsertPasanggiriEventStatus } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const kelas = request.nextUrl.searchParams.get('kelas') || undefined;
    const data = await getPasanggiriEventStatus(kelas);
    if (kelas) {
      if (!data) return NextResponse.json([]);
      const row = data as any;
      return NextResponse.json([{
        id: Number(row.id),
        kelas: row.kelas,
        is_locked: Boolean(Number(row.is_locked)),
        locked_by: row.locked_by,
        locked_at: row.locked_at,
        updated_at: row.updated_at,
      }]);
    }
    return NextResponse.json((data as any[]).map(row => ({
      id: Number(row.id),
      kelas: row.kelas,
      is_locked: Boolean(Number(row.is_locked)),
      locked_by: row.locked_by,
      locked_at: row.locked_at,
      updated_at: row.updated_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil status event' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { kelas, is_locked, locked_by } = await request.json();
    if (!kelas || is_locked === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    const row = await upsertPasanggiriEventStatus({ kelas, is_locked: is_locked ? 1 : 0, locked_by }) as any;
    return NextResponse.json({
      id: Number(row.id),
      kelas: row.kelas,
      is_locked: Boolean(Number(row.is_locked)),
      locked_by: row.locked_by,
      locked_at: row.locked_at,
      updated_at: row.updated_at,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate status event' }, { status: 500 });
  }
}
