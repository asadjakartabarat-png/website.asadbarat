import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('asadpondok_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
