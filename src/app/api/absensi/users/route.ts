import { NextRequest, NextResponse } from 'next/server';
import { getAllAbsensiUsers, createAbsensiUser, updateAbsensiUser, deleteAbsensiUser } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const users = await getAllAbsensiUsers();
  return NextResponse.json({ data: users });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await createAbsensiUser(body);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  await updateAbsensiUser(id, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteAbsensiUser(id);
  return NextResponse.json({ success: true });
}
