import { NextRequest, NextResponse } from 'next/server';
import { getAllKelompok, createKelompok, updateKelompok, deleteKelompok } from '@/lib/turso/db';

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const desaId = req.nextUrl.searchParams.get('desa_id');
  const kelompok = await getAllKelompok(desaId ? Number(desaId) : undefined);
  return NextResponse.json({ data: kelompok });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await createKelompok(body);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  await updateKelompok(id, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || session.role !== 'super_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteKelompok(id);
  return NextResponse.json({ success: true });
}
