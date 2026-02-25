import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';
import LaporanClient from '@/components/absensi/LaporanClient';

const ALLOWED = ['super_admin', 'koordinator_daerah', 'viewer', 'astrida'];

export default function LaporanPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);
  if (!ALLOWED.includes(session.role)) redirect('/absensi/dashboard');

  return (
    <AbsensiLayout session={session}>
      <LaporanClient />
    </AbsensiLayout>
  );
}
