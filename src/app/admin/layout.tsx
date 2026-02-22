'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Image,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const allNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'editor', 'writer'] },
  { name: 'Artikel', href: '/admin/articles', icon: FileText, roles: ['super_admin', 'editor', 'writer'] },
  { name: 'Kategori', href: '/admin/categories', icon: FolderOpen, roles: ['super_admin', 'editor'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['super_admin'] },
  { name: 'Media', href: '/admin/media', icon: Image, roles: ['super_admin', 'editor', 'writer'] },
];

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/articles': 'Artikel',
  '/admin/articles/new': 'Tambah Artikel',
  '/admin/categories': 'Kategori',
  '/admin/categories/new': 'Tambah Kategori',
  '/admin/users': 'Users',
  '/admin/media': 'Media',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('writer');
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.role) setUserRole(d.role); }).catch(() => {});
  }, []);

  const navigation = allNavigation.filter(item => item.roles.includes(userRole));

  if (pathname === '/admin/login') return <>{children}</>;

  const pageTitle = pageTitles[pathname] || (pathname.includes('/edit') ? 'Edit' : 'Admin');

  return (
    <div className="min-h-screen bg-gray-100 flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#7f1d1d' }}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-red-900">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AJ</span>
            </div>
            <span className="text-white font-bold text-lg">Asad Jakbar</span>
          </Link>
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-red-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-red-300 group-hover:text-white'}`} />
                {item.name}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-red-900">
          <div className="flex items-center px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">A</span>
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin Asad Jakbar</p>
              <p className="text-red-300 text-xs">Super Admin</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-red-200 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs text-gray-400">Admin Panel</p>
                <h2 className="text-sm font-semibold text-gray-800">{pageTitle}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center space-x-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Lihat Website</span>
              </Link>
              <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: '#991b1b' }}>
                  A
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">Admin</p>
                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
