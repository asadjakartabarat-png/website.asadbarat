import { NextRequest, NextResponse } from 'next/server';
import { getAllKegiatan, getKegiatanById, createKegiatan, updateKegiatan, deleteKegiatan } from '@/lib/turso/db';

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
    const data = await getKegiatanById(Number(id));
    return NextResponse.json({ data });
  }
  const data = await getAllKegiatan();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = await createKegiatan({
    nama: body.nama,
    jenis: body.jenis ?? null,
    tanggal: body.tanggal,
    tempat: body.tempat ?? null,
    keterangan: body.keterangan ?? null,
    created_by: session.id,
  });
  return NextResponse.json({ success: true, id });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...body } = await req.json();
  await updateKegiatan(Number(id), {
    nama: body.nama,
    jenis: body.jenis ?? null,
    tanggal: body.tanggal,
    tempat: body.tempat ?? null,
    keterangan: body.keterangan ?? null,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteKegiatan(Number(id));
  return NextResponse.json({ success: true });
}
