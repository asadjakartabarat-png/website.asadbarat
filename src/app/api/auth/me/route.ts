import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserById } from '@/lib/turso/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'beritaku-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    let full_name = payload.full_name as string | undefined;
    let role = payload.role as string;
    if (!full_name) {
      const user = await getUserById(payload.id as string);
      if (user) { full_name = user.full_name; role = user.role; }
    }
    return NextResponse.json({ id: payload.id, email: payload.email, role, full_name });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
