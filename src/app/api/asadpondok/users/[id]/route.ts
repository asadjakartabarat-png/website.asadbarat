import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updatePondokUser, deletePondokUser } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = await request.json();
  const user = await updatePondokUser(Number(params.id), data);
  return NextResponse.json({ user });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'superadmin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await deletePondokUser(Number(params.id));
  return NextResponse.json({ success: true });
}
