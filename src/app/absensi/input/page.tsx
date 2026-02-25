import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';
import InputAbsensiClient from '@/components/absensi/InputAbsensiClient';

const ALLOWED = ['super_admin', 'koordinator_desa', 'astrida'];

export default function InputPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);
  if (!ALLOWED.includes(session.role)) redirect('/absensi/dashboard');

  return (
    <AbsensiLayout session={session}>
      <InputAbsensiClient session={session} />
    </AbsensiLayout>
  );
}
