import { NextRequest, NextResponse } from 'next/server';
import { getAllDesa, createDesa, updateDesa, deleteDesa } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const desa = await getAllDesa();
  return NextResponse.json({ data: desa });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { nama_desa } = await req.json();
  await createDesa(nama_desa);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, nama_desa } = await req.json();
  await updateDesa(id, nama_desa);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteDesa(id);
  return NextResponse.json({ success: true });
}
