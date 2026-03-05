import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllPondokUsers, createPondokUser } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const users = await getAllPondokUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { username, password, full_name, role } = await request.json();
  if (!username || !password || !full_name || !role)
    return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
  const user = await createPondokUser({ username, password, full_name, role });
  return NextResponse.json({ user }, { status: 201 });
}
