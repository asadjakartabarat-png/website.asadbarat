import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';
import KegiatanClient from '@/components/absensi/KegiatanClient';

const ALLOWED = ['super_admin', 'koordinator_daerah', 'astrida'];

export default function KegiatanPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);
  if (!ALLOWED.includes(session.role)) redirect('/absensi/dashboard');

  return (
    <AbsensiLayout session={session}>
      <KegiatanClient />
    </AbsensiLayout>
  );
}
