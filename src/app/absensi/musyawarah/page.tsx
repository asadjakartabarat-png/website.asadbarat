import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';
import MusyawarahClient from '@/components/absensi/MusyawarahClient';

const ALLOWED = ['super_admin', 'koordinator_daerah', 'astrida'];

export default function MusyawarahPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);
  if (!ALLOWED.includes(session.role)) redirect('/absensi/dashboard');

  return (
    <AbsensiLayout session={session}>
      <MusyawarahClient />
    </AbsensiLayout>
  );
}
