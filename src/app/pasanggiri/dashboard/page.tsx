'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/pasanggiri';
import Sidebar from '@/components/pasanggiri/Sidebar';

const SirkulatorDashboard = lazy(() => import('@/components/pasanggiri/SirkulatorDashboard'));
const JuriDashboard = lazy(() => import('@/components/pasanggiri/JuriDashboard'));
const SuperAdminDashboard = lazy(() => import('@/components/pasanggiri/SuperAdminDashboard'));
const AdminDashboard = lazy(() => import('@/components/pasanggiri/AdminDashboard'));
const KoordinatorDashboard = lazy(() => import('@/components/pasanggiri/KoordinatorDashboard'));
const ViewerDashboard = lazy(() => import('@/components/pasanggiri/ViewerDashboard'));

function getDefaultTab(role: string) {
  if (role === 'SUPER_ADMIN') return 'users';
  if (role === 'ADMIN') return 'overview';
  if (role.includes('KOORDINATOR')) return 'overview';
  if (role.includes('SIRKULATOR')) return 'control';
  if (role.includes('JURI')) return 'scoring';
  if (role === 'VIEWER') return 'results';
  return 'users';
}

export default function PasanggiriDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/pasanggiri/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) { setUser(data.user); setActiveTab(getDefaultTab(data.user.role)); }
        else router.push('/pasanggiri/login');
      })
      .catch(() => router.push('/pasanggiri/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/pasanggiri/auth/logout', { method: 'POST' });
    router.push('/pasanggiri/login');
  };

  const renderDashboard = () => {
    if (!user) return null;
    return (
      <Suspense fallback={<div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>}>
        {user.role === 'SUPER_ADMIN' && <SuperAdminDashboard user={user} activeTab={activeTab} />}
        {user.role === 'ADMIN' && <AdminDashboard user={user} activeTab={activeTab} />}
        {(user.role === 'KOORDINATOR_PUTRA' || user.role === 'KOORDINATOR_PUTRI') && <KoordinatorDashboard user={user} activeTab={activeTab} />}
        {(user.role === 'SIRKULATOR_PUTRA' || user.role === 'SIRKULATOR_PUTRI') && <SirkulatorDashboard user={user} activeTab={activeTab} />}
        {(user.role === 'JURI_PUTRA' || user.role === 'JURI_PUTRI') && <JuriDashboard user={user} activeTab={activeTab} />}
        {user.role === 'VIEWER' && <ViewerDashboard user={user} activeTab={activeTab} />}
      </Suspense>
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:flex">
        <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
        <div className="flex-1 ml-64"><main className="p-6">{renderDashboard()}</main></div>
      </div>
      <div className="lg:hidden">
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100"><span className="text-xl">☰</span></button>
              <div><h1 className="font-bold text-lg text-gray-900">PASANGGIRI</h1><p className="text-xs text-gray-500">{user.username}</p></div>
            </div>
            <button onClick={handleLogout} className="text-red-600 text-sm font-medium">Keluar</button>
          </div>
        </header>
        <main className="p-4">{renderDashboard()}</main>
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar user={user} activeTab={activeTab} onTabChange={tab => { setActiveTab(tab); setSidebarOpen(false); }} onLogout={handleLogout} />
          </div>
        </div>
      )}
    </div>
  );
}
