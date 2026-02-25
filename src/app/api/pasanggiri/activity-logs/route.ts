import { NextRequest, NextResponse } from 'next/server';
import { getPasanggiriActivityLogs, createPasanggiriActivityLog } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get('limit') || 50);
    const logs = await getPasanggiriActivityLogs(limit);
    return NextResponse.json(logs.map(l => ({
      ...l,
      id: String(Number(l.id)),
      user_id: String(Number(l.user_id)),
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil log' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, username, action, details } = await request.json();
    if (!user_id || !username || !action) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    await createPasanggiriActivityLog({ user_id: Number(user_id), username, action, details });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan log' }, { status: 500 });
  }
}
