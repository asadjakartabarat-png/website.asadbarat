'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User { id: number; username: string; full_name: string; role: string; }

interface NavItem { key: string; label: string; icon: string; }

function getNavItems(role: string): NavItem[] {
  const items: NavItem[] = [{ key: 'dashboard', label: 'Dashboard', icon: '🏠' }];
  if (['superadmin', 'korda'].includes(role)) {
    items.push({ key: 'peserta', label: 'Peserta Tes', icon: '👥' });
    items.push({ key: 'teori', label: 'Form Penilaian', icon: '📋' });
    items.push({ key: 'hasil', label: 'Hasil Penilaian', icon: '🏆' });
  }
  if (['superadmin', 'penguji_sm_putra', 'penguji_sm_putri'].includes(role)) {
    items.push({ key: 'input-nilai', label: 'Input Nilai', icon: '✏️' });
  }
  if (role === 'superadmin') {
    items.push({ key: 'users', label: 'Kelola User', icon: '⚙️' });
  }
  return items;
}

function roleLabel(role: string) {
  const map: Record<string, string> = {
    superadmin: 'Super Admin',
    korda: 'Koordinator',
    penguji_sm_putra: 'Penguji PUTRA',
    penguji_sm_putri: 'Penguji PUTRI',
  };
  return map[role] || role;
}

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

function SidebarContent({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const navItems = getNavItems(user.role);
  return (
    <div className="h-full bg-green-800 text-white flex flex-col w-64">
      <div className="p-4 border-b border-green-700">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🥋</span>
          <div>
            <h1 className="font-bold text-sm leading-tight">ASAD PONDOK</h1>
            <p className="text-xs text-green-300">Penilaian Siswa/i</p>
          </div>
        </div>
        <div className="mt-3 bg-green-700 rounded p-2">
          <p className="text-xs font-medium truncate">{user.full_name}</p>
          <p className="text-xs text-green-300">{roleLabel(user.role)}</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-sm transition-colors ${
              activeTab === item.key ? 'bg-green-600 text-white' : 'text-green-200 hover:bg-green-700'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-green-700">
        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-green-300 hover:text-white hover:bg-green-700 rounded">
          🚪 Keluar
        </button>
      </div>
    </div>
  );
}

interface LayoutProps {
  user: User;
  activeTab: string;
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AsadPondokLayout({ user, activeTab, children, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    router.push(`/asadpondok/dashboard?tab=${tab}`);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop */}
      <div className="hidden lg:flex">
        <div className="fixed left-0 top-0 h-full z-30">
          <SidebarContent user={user} activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />
        </div>
        <div className="flex-1 ml-64">
          <main className="p-6">{children}</main>
        </div>
      </div>
      {/* Mobile */}
      <div className="lg:hidden">
        <header className="bg-green-800 text-white shadow-sm sticky top-0 z-40">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(true)} className="p-1 rounded hover:bg-green-700">
                <span className="text-xl">☰</span>
              </button>
              <div>
                <h1 className="font-bold text-sm">ASAD PONDOK</h1>
                <p className="text-xs text-green-300">{user.full_name}</p>
              </div>
            </div>
            <button onClick={onLogout} className="text-green-300 text-sm">Keluar</button>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <SidebarContent user={user} activeTab={activeTab} onTabChange={handleTabChange} onLogout={onLogout} />
          </div>
        </div>
      )}
    </div>
  );
}
