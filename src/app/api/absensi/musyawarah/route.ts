import { NextRequest, NextResponse } from 'next/server';
import { getAllMusyawarah, getMusyawarahById, createMusyawarah, updateMusyawarah, deleteMusyawarah } from '@/lib/turso/db';

const ALLOWED = ['super_admin', 'koordinator_daerah', 'astrida'];

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const data = await getMusyawarahById(Number(id));
    return NextResponse.json({ data });
  }
  const data = await getAllMusyawarah();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  await createMusyawarah({
    judul: body.judul,
    tanggal: body.tanggal,
    tempat: body.tempat ?? null,
    catatan: body.catatan ?? null,
    created_by: session.id,
    peserta: body.peserta ?? [],
  });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...data } = await req.json();
  await updateMusyawarah(Number(id), {
    judul: data.judul,
    tanggal: data.tanggal,
    tempat: data.tempat ?? null,
    catatan: data.catatan ?? null,
    peserta: data.peserta ?? [],
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteMusyawarah(Number(id));
  return NextResponse.json({ success: true });
}
