import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { turso } from '@/lib/turso/client';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await turso.execute({ sql: `SELECT * FROM pondok_nilai_jurus WHERE id = ?`, args: [Number(params.id)] });
  if (existing.rows.length === 0) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });

  const row = existing.rows[0];
  const createdAt = new Date(row.created_at as string).getTime();
  const now = Date.now();
  if (now - createdAt > 15 * 60 * 1000)
    return NextResponse.json({ error: 'Waktu edit sudah habis (15 menit)' }, { status: 403 });

  if (session.role !== 'superadmin' && session.id !== Number(row.penguji_id))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { nilai } = await request.json();
  const nowStr = new Date().toISOString();
  await turso.execute({ sql: `UPDATE pondok_nilai_jurus SET nilai=?, updated_at=? WHERE id=?`, args: [nilai, nowStr, Number(params.id)] });
  return NextResponse.json({ success: true });
}
