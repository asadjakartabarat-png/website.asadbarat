'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, Settings, UserCheck, BarChart3, FileText, Menu, X, LogOut, Landmark, ClipboardList, Mail, ChevronDown, UserPlus, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface AbsensiLayoutProps {
  children: React.ReactNode;
  session: { id: number; username: string; full_name: string; role: string; desa_id: number | null };
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  koordinator_desa: 'Koordinator Desa',
  koordinator_daerah: 'Koordinator Daerah',
  viewer: 'Viewer',
  astrida: 'Astrida',
};

type NavLink = { name: string; href: string; icon: any };
type NavGroup = { name: string; icon: any; children: NavLink[] };
type NavEntry = NavLink | NavGroup;

const isGroup = (e: NavEntry): e is NavGroup => 'children' in e;

// Menu induk: Manajemen Asad Padepokan
const padepokanGroup: NavGroup = {
  name: 'Manajemen Asad Padepokan',
  icon: Landmark,
  children: [
    { name: 'Data Anggota', href: '/absensi/anggota', icon: UserPlus },
    { name: 'Absensi Kegiatan', href: '/absensi/kegiatan', icon: CalendarCheck },
    { name: 'Notulensi Musyawarah', href: '/absensi/musyawarah', icon: ClipboardList },
    { name: 'Letter Generator', href: '/absensi/letter-generator', icon: Mail },
  ],
};

export default function AbsensiLayout({ children, session }: AbsensiLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavEntry[] = (() => {
    const base: NavEntry[] = [{ name: 'Dashboard', href: '/absensi/dashboard', icon: Home }];
    switch (session.role) {
      case 'super_admin': return [...base,
        { name: 'Kelola User', href: '/absensi/kelola-user', icon: Users },
        { name: 'Master Data', href: '/absensi/master-data', icon: Settings },
        { name: 'Input Absensi', href: '/absensi/input', icon: UserCheck },
        { name: 'Laporan', href: '/absensi/laporan', icon: BarChart3 },
        { name: 'Laporan DKI', href: '/absensi/laporan-dki', icon: FileText },
        padepokanGroup,
      ];
      case 'koordinator_desa': return [...base,
        { name: 'Input Absensi', href: '/absensi/input', icon: UserCheck },
      ];
      case 'koordinator_daerah': return [...base,
        { name: 'Laporan', href: '/absensi/laporan', icon: BarChart3 },
        padepokanGroup,
      ];
      case 'viewer': return [...base,
        { name: 'Laporan', href: '/absensi/laporan', icon: BarChart3 },
        { name: 'Laporan DKI', href: '/absensi/laporan-dki', icon: FileText },
      ];
      case 'astrida': return [...base,
        { name: 'Input Absensi', href: '/absensi/input', icon: UserCheck },
        { name: 'Laporan', href: '/absensi/laporan', icon: BarChart3 },
        padepokanGroup,
      ];
      default: return base;
    }
  })();

  const handleLogout = async () => {
    await fetch('/api/absensi/auth/logout', { method: 'POST' });
    toast.success('Logout berhasil');
    router.push('/absensi/login');
  };

  const linkClass = (active: boolean) =>
    `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700 hover:text-white'
    }`;

  const SidebarContent = () => (
    <>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          if (!isGroup(item)) {
            return (
              <Link key={item.name} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={linkClass(pathname === item.href)}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          }
          const childActive = item.children.some((c) => pathname === c.href);
          const open = openGroups[item.name] ?? childActive;
          return (
            <div key={item.name}>
              <button type="button"
                onClick={() => setOpenGroups((p) => ({ ...p, [item.name]: !open }))}
                className={`w-full ${linkClass(false)} justify-between`}>
                <span className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <div className="mt-1 ml-3 space-y-1 border-l border-green-700 pl-2">
                  {item.children.map((c) => (
                    <Link key={c.name} href={c.href}
                      onClick={() => setSidebarOpen(false)}
                      className={linkClass(pathname === c.href)}>
                      <c.icon className="mr-3 h-4 w-4" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {session.role === 'super_admin' && (
        <div className="px-2 py-3 border-t border-green-700">
          <p className="text-xs text-green-400 font-semibold uppercase px-1 mb-1">Akses Cepat</p>
          <a href="/pasanggiri/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-2 px-3 py-2 text-red-300 hover:bg-green-700 hover:text-white rounded-md text-sm font-medium">
            <span>🥋</span><span>Dashboard Pasanggiri</span>
          </a>
          <a href="/admin/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center space-x-2 px-3 py-2 text-yellow-300 hover:bg-green-700 hover:text-white rounded-md text-sm font-medium">
            <span>📰</span><span>Dashboard Berita</span>
          </a>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-green-800 flex flex-col z-50">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="text-white font-bold">Absensi ASAD</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white"><X className="h-6 w-6" /></button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-green-800">
        <div className="flex h-16 items-center px-4">
          <span className="text-white font-bold text-sm">Absensi Penderesan ASAD</span>
        </div>
        <SidebarContent />
        <div className="p-4 border-t border-green-700">
          <p className="text-white text-sm font-medium truncate">{session.full_name}</p>
          <p className="text-green-300 text-xs">{ROLE_LABELS[session.role]}</p>
          <button onClick={handleLogout} className="mt-2 flex items-center text-green-200 hover:text-white text-sm">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 shadow-sm">
          <button type="button" className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-600 hidden sm:block">{session.full_name}</span>
          <button type="button" onClick={handleLogout} className="flex items-center justify-center text-gray-500 hover:text-gray-700 lg:hidden p-2 min-w-[44px] min-h-[44px]">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
