import { NextRequest, NextResponse } from 'next/server';
import { getPublicMusyawarahByToken } from '@/lib/turso/db';

// Endpoint publik tanpa login — dipanggil berulang oleh halaman /notulensi.
// force-dynamic + no-store wajib, kalau tidak Vercel akan menyajikan
// versi cache dan isinya tidak pernah terlihat berubah.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const data = await getPublicMusyawarahByToken(params.token);
  // Token salah ATAU toggle sedang nonaktif → sama-sama 404,
  // supaya tidak bocor informasi bahwa suatu token itu valid.
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: NO_CACHE });
  return NextResponse.json({ data }, { headers: NO_CACHE });
}
