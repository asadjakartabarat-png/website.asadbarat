import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';
import LaporanDKIClient from '@/components/absensi/LaporanDKIClient';

const ALLOWED = ['super_admin', 'viewer'];

export default function LaporanDKIPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);
  if (!ALLOWED.includes(session.role)) redirect('/absensi/dashboard');

  return (
    <AbsensiLayout session={session}>
      <LaporanDKIClient />
    </AbsensiLayout>
  );
}
