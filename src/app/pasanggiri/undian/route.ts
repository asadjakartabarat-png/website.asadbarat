import { NextRequest, NextResponse } from 'next/server';
import { getPasanggiriUndian, createPasanggiriUndian, updatePasanggiriUndian, deletePasanggiriUndian } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const kelas = request.nextUrl.searchParams.get('kelas') || undefined;
    const kategori = request.nextUrl.searchParams.get('kategori') || undefined;
    const golongan = request.nextUrl.searchParams.get('golongan') || undefined;
    const rows = await getPasanggiriUndian({ kelas, kategori, golongan });
    return NextResponse.json(rows.map((r: any) => ({
      id: String(Number(r.id)),
      peserta_id: Number(r.peserta_id),
      nama_peserta: r.nama_peserta,
      nama_desa: r.nama_desa,
      desa: r.nama_desa,
      kelas: r.kelas,
      kategori: r.kategori,
      golongan: r.golongan,
      urutan: Number(r.urutan),
      created_at: r.created_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data undian' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { peserta_id, kelas, kategori, golongan, urutan } = await request.json();
    if (!peserta_id || !kelas || !kategori || !golongan || urutan === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    const row = await createPasanggiriUndian({ peserta_id: Number(peserta_id), kelas, kategori, golongan, urutan: Number(urutan) });
    return NextResponse.json({ id: String(Number(row.id)), peserta_id: Number(row.peserta_id), nama_peserta: row.nama_peserta, kelas: row.kelas, kategori: row.kategori, golongan: row.golongan, urutan: Number(row.urutan) });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat undian' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, urutan } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    const row = await updatePasanggiriUndian(Number(id), { urutan });
    return NextResponse.json({ id: String(Number(row.id)), urutan: Number(row.urutan) });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate undian' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    await deletePasanggiriUndian(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus undian' }, { status: 500 });
  }
}
