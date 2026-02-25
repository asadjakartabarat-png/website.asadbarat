import { NextRequest, NextResponse } from 'next/server';
import { getAbsensiUserByUsername } from '@/lib/turso/db';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });

  const user = await getAbsensiUserByUsername(username);
  if (!user || user.password !== password) return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });

  const session = JSON.stringify({ id: user.id, username: user.username, full_name: user.full_name, role: user.role, desa_id: user.desa_id });
  const res = NextResponse.json({ success: true });
  res.cookies.set('absensi_session', session, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
