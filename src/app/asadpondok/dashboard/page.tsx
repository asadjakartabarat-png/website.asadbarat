'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AsadPondokLayout from '@/components/asadpondok/AsadPondokLayout';
import { SuperAdminDashboard, KordaDashboard, PengujiDashboard } from '@/components/asadpondok/Dashboards';

const KelolaUserClient = lazy(() => import('@/components/asadpondok/KelolaUserClient'));
const PesertaClient = lazy(() => import('@/components/asadpondok/PesertaClient'));
const FormTeoriClient = lazy(() => import('@/components/asadpondok/FormTeoriClient'));
const InputNilaiClient = lazy(() => import('@/components/asadpondok/InputNilaiClient'));
const HasilPenilaianClient = lazy(() => import('@/components/asadpondok/HasilPenilaianClient'));

interface User { id: number; username: string; full_name: string; role: string; }

function getDefaultTab(role: string) {
  if (['penguji_sm_putra', 'penguji_sm_putri'].includes(role)) return 'input-nilai';
  return 'dashboard';
}

function Spinner() {
  return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
}

export default function AsadPondokDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    fetch('/api/asadpondok/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          if (!searchParams.get('tab')) router.replace(`/asadpondok/dashboard?tab=${getDefaultTab(data.user.role)}`);
        } else {
          router.push('/asadpondok/login');
        }
      })
      .catch(() => router.push('/asadpondok/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/asadpondok/auth/logout', { method: 'POST' });
    router.push('/asadpondok/login');
  };

  const renderContent = () => {
    if (!user) return null;
    const isPenguji = ['penguji_sm_putra', 'penguji_sm_putri'].includes(user.role);

    switch (activeTab) {
      case 'dashboard':
        if (user.role === 'superadmin') return <SuperAdminDashboard user={user} />;
        if (user.role === 'korda') return <KordaDashboard user={user} />;
        return <PengujiDashboard user={user} />;
      case 'users':
        if (user.role !== 'superadmin') return <p className="text-red-500">Akses ditolak</p>;
        return <KelolaUserClient />;
      case 'peserta':
        if (isPenguji) return <p className="text-red-500">Akses ditolak</p>;
        return <PesertaClient />;
      case 'teori':
        if (isPenguji) return <p className="text-red-500">Akses ditolak</p>;
        return <FormTeoriClient />;
      case 'input-nilai':
        if (user.role === 'korda') return <p className="text-red-500">Akses ditolak</p>;
        return <InputNilaiClient user={user} />;
      case 'hasil':
        if (isPenguji) return <p className="text-red-500">Akses ditolak</p>;
        return <HasilPenilaianClient />;
      default:
        return <SuperAdminDashboard user={user} />;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
  if (!user) return null;

  return (
    <AsadPondokLayout user={user} activeTab={activeTab} onLogout={handleLogout}>
      <Suspense fallback={<Spinner />}>
        {renderContent()}
      </Suspense>
    </AsadPondokLayout>
  );
}
