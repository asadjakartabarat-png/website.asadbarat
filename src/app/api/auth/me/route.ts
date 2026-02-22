import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'beritaku-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ id: payload.id, email: payload.email, role: payload.role });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
