import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { getUserByUsername } from '@/lib/turso/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'beritaku-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const user = await getUserByUsername(username);

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error', detail: String(error) }, { status: 500 });
  }
}
