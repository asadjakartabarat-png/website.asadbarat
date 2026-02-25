import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';
import KelolaUserClient from '@/components/absensi/KelolaUserClient';

export default function KelolaUserPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);
  if (session.role !== 'super_admin') redirect('/absensi/dashboard');

  return (
    <AbsensiLayout session={session}>
      <KelolaUserClient />
    </AbsensiLayout>
  );
}
