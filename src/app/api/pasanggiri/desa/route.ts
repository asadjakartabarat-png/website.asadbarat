import { NextRequest, NextResponse } from 'next/server';
import { getPasanggiriAllDesa, createPasanggiriDesa, updatePasanggiriDesa, deletePasanggiriDesa } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const desa = await getPasanggiriAllDesa();
    return NextResponse.json(desa.map(d => ({
      id: Number(d.id),
      nama_desa: d.nama_desa,
      created_at: d.created_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data desa' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama_desa } = await request.json();
    if (!nama_desa) return NextResponse.json({ error: 'Nama desa diperlukan' }, { status: 400 });
    await createPasanggiriDesa(nama_desa);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat desa' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, nama_desa } = await request.json();
    if (!id || !nama_desa) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    await updatePasanggiriDesa(Number(id), nama_desa);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate desa' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    await deletePasanggiriDesa(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus desa' }, { status: 500 });
  }
}
