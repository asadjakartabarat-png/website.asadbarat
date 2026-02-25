import { NextRequest, NextResponse } from 'next/server';
import { getAllPasanggiriPeserta, createPasanggiriPeserta, updatePasanggiriPeserta, deletePasanggiriPeserta, getPasanggiriUndian } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const undian_id = request.nextUrl.searchParams.get('undian_id');
    if (undian_id) {
      // Return peserta for a specific undian entry
      // We need to find peserta linked to this undian
      const undianRows = await getPasanggiriUndian();
      const undian = undianRows.find((u: any) => String(Number(u.id)) === undian_id);
      if (!undian) return NextResponse.json([]);
      const allPeserta = await getAllPasanggiriPeserta();
      // Filter peserta by desa, kategori, golongan, kelas matching the undian
      const filtered = allPeserta.filter((p: any) =>
        String(Number(p.desa_id)) === String(Number((undian as any).peserta_id ? (undian as any).desa_id : 0)) ||
        true // Return all for now - peserta linked via undian_id concept
      );
      // Actually: peserta_id in undian points to ONE peserta. Return peserta for same desa+kategori+golongan+kelas
      const pesertaForUndian = allPeserta.filter((p: any) =>
        p.kategori === undian.kategori &&
        p.golongan === undian.golongan &&
        p.kelas === undian.kelas &&
        String(Number(p.desa_id)) === String(Number((undian as any).desa_id || 0))
      );
      return NextResponse.json(pesertaForUndian.map((p: any) => ({
        id: String(Number(p.id)),
        nama_peserta: p.nama_peserta,
        desa_id: Number(p.desa_id),
        nama_desa: p.nama_desa,
        kategori: p.kategori,
        golongan: p.golongan,
        kelas: p.kelas,
        created_at: p.created_at,
      })));
    }
    const peserta = await getAllPasanggiriPeserta();
    return NextResponse.json(peserta.map((p: any) => ({
      id: String(Number(p.id)),
      nama_peserta: p.nama_peserta,
      desa_id: Number(p.desa_id),
      nama_desa: p.nama_desa,
      kategori: p.kategori,
      golongan: p.golongan,
      kelas: p.kelas,
      created_at: p.created_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data peserta' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Support both undian_id based (old) and direct desa_id based
    const { nama_peserta, desa_id, kategori, golongan, kelas, undian_id } = body;

    let finalDesaId = desa_id;
    let finalKategori = kategori;
    let finalGolongan = golongan;
    let finalKelas = kelas;

    if (undian_id && !desa_id) {
      // Get undian to find desa info
      const undianRows = await getPasanggiriUndian();
      const undian = undianRows.find((u: any) => String(Number(u.id)) === String(undian_id)) as any;
      if (!undian) return NextResponse.json({ error: 'Undian tidak ditemukan' }, { status: 404 });
      // Get desa_id from peserta linked to undian
      const allPeserta = await getAllPasanggiriPeserta();
      const linkedPeserta = allPeserta.find((p: any) => String(Number(p.id)) === String(Number(undian.peserta_id))) as any;
      finalDesaId = linkedPeserta ? Number(linkedPeserta.desa_id) : null;
      finalKategori = undian.kategori;
      finalGolongan = undian.golongan;
      finalKelas = undian.kelas;
    }

    if (!nama_peserta || !finalDesaId || !finalKategori || !finalGolongan || !finalKelas) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const p = await createPasanggiriPeserta({
      nama_peserta,
      desa_id: Number(finalDesaId),
      kategori: finalKategori,
      golongan: finalGolongan,
      kelas: finalKelas,
    });
    return NextResponse.json({ id: String(Number(p.id)), nama_peserta: p.nama_peserta, desa_id: Number(p.desa_id), nama_desa: p.nama_desa, kategori: p.kategori, golongan: p.golongan, kelas: p.kelas, created_at: p.created_at });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat peserta' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    const p = await updatePasanggiriPeserta(Number(id), data);
    return NextResponse.json({ id: String(Number(p.id)), nama_peserta: p.nama_peserta, desa_id: Number(p.desa_id), nama_desa: p.nama_desa, kategori: p.kategori, golongan: p.golongan, kelas: p.kelas });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate peserta' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    await deletePasanggiriPeserta(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus peserta' }, { status: 500 });
  }
}
