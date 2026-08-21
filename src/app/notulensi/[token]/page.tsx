import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicMusyawarahByToken } from '@/lib/turso/db';
import NotulensiPublicClient from '@/components/absensi/NotulensiPublicClient';

// Halaman ini di luar /absensi sehingga tidak dicegat middleware login.
// force-dynamic supaya isinya selalu diambil segar dari Turso.
export const dynamic = 'force-dynamic';

// Link bersifat rahasia — jangan sampai terindeks mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function NotulensiPublikPage({ params }: { params: { token: string } }) {
  const row = await getPublicMusyawarahByToken(params.token);
  if (!row) notFound();

  return (
    <NotulensiPublicClient
      token={params.token}
      initial={{
        judul: String(row.judul ?? ''),
        tanggal: String(row.tanggal ?? ''),
        catatan: row.catatan == null ? null : String(row.catatan),
      }}
    />
  );
}
