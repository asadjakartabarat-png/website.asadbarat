'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store';
import { User } from '@/types';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Image, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Artikel', href: '/admin/articles', icon: FileText },
  { name: 'Kategori', href: '/admin/categories', icon: FolderOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Media', href: '/admin/media', icon: Image },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser, loading, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Check cookie instead of Supabase auth
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('admin-session='));
      
      if (sessionCookie) {
        // Set dummy user if cookie exists
        setUser({
          id: 'admin-user',
          email: 'admin@asadjakbar.com',
          full_name: 'Admin Asad Jakbar',
          role: 'super_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User);
      } else if (pathname !== '/admin/login') {
        // Redirect to login if no cookie and not on login page
        router.push('/admin/login');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [setUser, setLoading, router, pathname]);

  const handleLogout = () => {
    // Clear cookie instead of Supabase signOut
    document.cookie = 'admin-session=; path=/; max-age=0';
    setUser(null);
    router.push('/admin/login');
    toast.success('Logout berhasil');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return children;
  }

  // Redirect to login if no user and not loading
  if (!loading && !user && pathname !== '/admin/login') {
    router.push('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link href="/admin/dashboard" className="text-xl font-bold text-primary-500">
            Admin Panel
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-6">
          <div className="px-6 mb-6">
            <div className="text-sm text-gray-500">Welcome back,</div>
            <div className="font-medium text-gray-900">{user?.full_name}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>

          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <Link href="/" target="_blank" className="text-sm text-gray-600 hover:text-gray-900">
                Lihat Website
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}