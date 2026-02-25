import { NextRequest, NextResponse } from 'next/server';
import { getAllPasanggiriCompetitions, createPasanggiriCompetition, deletePasanggiriCompetition } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const kelas = request.nextUrl.searchParams.get('kelas') || undefined;
    const rows = await getAllPasanggiriCompetitions({ status, kelas });
    return NextResponse.json(rows.map(r => ({
      id: String(Number(r.id)),
      desa: r.nama_desa,
      desa_id: Number(r.desa_id),
      kelas: r.kelas,
      kategori: r.kategori,
      golongan: r.golongan,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data kompetisi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { desa_id, kelas, golongan, kategori } = await request.json();
    if (!desa_id || !kelas || !golongan || !kategori) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    const row = await createPasanggiriCompetition({ desa_id: Number(desa_id), kelas, kategori, golongan });
    return NextResponse.json({
      id: String(Number(row.id)),
      desa: row.nama_desa,
      desa_id: Number(row.desa_id),
      kelas: row.kelas,
      kategori: row.kategori,
      golongan: row.golongan,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat kompetisi' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    await deletePasanggiriCompetition(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kompetisi' }, { status: 500 });
  }
}
