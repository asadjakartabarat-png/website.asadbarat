import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AbsensiLayout from '@/components/absensi/AbsensiLayout';

export default function DashboardPage() {
  const sessionCookie = cookies().get('absensi_session')?.value;
  if (!sessionCookie) redirect('/absensi/login');
  const session = JSON.parse(sessionCookie);

  const menuItems = [
    { role: ['super_admin'], label: 'Kelola User', href: '/absensi/kelola-user', color: 'bg-blue-500' },
    { role: ['super_admin'], label: 'Master Data', href: '/absensi/master-data', color: 'bg-purple-500' },
    { role: ['super_admin', 'koordinator_desa', 'astrida'], label: 'Input Absensi', href: '/absensi/input', color: 'bg-green-500' },
    { role: ['super_admin', 'koordinator_daerah', 'viewer', 'astrida'], label: 'Laporan', href: '/absensi/laporan', color: 'bg-orange-500' },
    { role: ['super_admin', 'viewer'], label: 'Laporan DKI', href: '/absensi/laporan-dki', color: 'bg-red-500' },
  ].filter(m => m.role.includes(session.role));

  return (
    <AbsensiLayout session={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Selamat datang, {session.full_name}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {menuItems.map(item => (
            <a key={item.href} href={item.href}
              className={`${item.color} text-white rounded-xl p-6 text-center font-semibold hover:opacity-90 transition-opacity shadow`}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </AbsensiLayout>
  );
}
