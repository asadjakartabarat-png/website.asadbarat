import { NextRequest, NextResponse } from 'next/server';
import { getAllAnggota, createAnggota, updateAnggota, deleteAnggota, bulkCreateAnggota } from '@/lib/turso/db';

const ALLOWED = ['super_admin', 'koordinator_daerah', 'astrida'];

function getSession(req: NextRequest) {
  const s = req.cookies.get('absensi_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const desaId = req.nextUrl.searchParams.get('desa_id');
  const keyword = req.nextUrl.searchParams.get('q') || undefined;
  const data = await getAllAnggota({ desa_id: desaId ? Number(desaId) : undefined, keyword });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  // Import massal bila ada body.rows
  if (Array.isArray(body.rows)) {
    const count = await bulkCreateAnggota(body.rows);
    return NextResponse.json({ success: true, inserted: count });
  }
  await createAnggota({
    nama: body.nama,
    desa_id: body.desa_id ? Number(body.desa_id) : null,
    kelompok_id: body.kelompok_id ? Number(body.kelompok_id) : null,
    jenis_kelamin: body.jenis_kelamin ?? null,
    status: body.status ?? null,
    no_hp: body.no_hp ?? null,
    aktif: body.aktif ?? 1,
  });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, ...body } = await req.json();
  await updateAnggota(Number(id), {
    nama: body.nama,
    desa_id: body.desa_id ? Number(body.desa_id) : null,
    kelompok_id: body.kelompok_id ? Number(body.kelompok_id) : null,
    jenis_kelamin: body.jenis_kelamin ?? null,
    status: body.status ?? null,
    no_hp: body.no_hp ?? null,
    aktif: body.aktif ?? 1,
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session || !ALLOWED.includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await deleteAnggota(Number(id));
  return NextResponse.json({ success: true });
}
