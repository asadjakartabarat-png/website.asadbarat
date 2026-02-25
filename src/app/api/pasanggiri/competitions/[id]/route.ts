import { NextRequest, NextResponse } from 'next/server';
import { updatePasanggiriCompetitionStatus } from '@/lib/turso/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json();
    if (!status) return NextResponse.json({ error: 'Status diperlukan' }, { status: 400 });
    const row = await updatePasanggiriCompetitionStatus(Number(params.id), status);
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
    return NextResponse.json({ error: 'Gagal mengupdate status' }, { status: 500 });
  }
}
