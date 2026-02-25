import { NextRequest, NextResponse } from 'next/server';
import { getPasanggiriUserByUsername } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password harus diisi' }, { status: 400 });
    }

    const user = await getPasanggiriUserByUsername(username);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const sessionData = {
      id: Number(user.id),
      username: user.username,
      role: user.role,
      is_active: Boolean(Number(user.is_active)),
    };
    const res = NextResponse.json({ user: sessionData });
    res.cookies.set('pasanggiri_session', JSON.stringify(sessionData), {
      httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
