export const dynamic = 'force-dynamic';
import { getDashboardStats } from '@/lib/turso/db';
import { FileText, Users, FolderOpen, Eye } from 'lucide-react';
import Link from 'next/link';

const statCards = (stats: Awaited<ReturnType<typeof getDashboardStats>>) => [
  {
    label: 'Total Artikel',
    value: stats.totalArticles,
    icon: FileText,
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    href: '/admin/articles',
  },
  {
    label: 'Published',
    value: stats.publishedArticles,
    icon: Eye,
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    text: 'text-emerald-600',
    href: '/admin/articles',
  },
  {
    label: 'Kategori',
    value: stats.totalCategories,
    icon: FolderOpen,
    bg: 'bg-violet-500',
    light: 'bg-violet-50',
    text: 'text-violet-600',
    href: '/admin/categories',
  },
  {
    label: 'Users',
    value: stats.totalUsers,
    icon: Users,
    bg: 'bg-amber-500',
    light: 'bg-amber-50',
    text: 'text-amber-600',
    href: '/admin/users',
  },
];

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const cards = statCards(stats);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Datang 👋</h1>
        <p className="text-gray-500 mt-1">Berikut ringkasan konten website Asad Jakbar.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow"
          >
            <div className={`${card.light} p-3 rounded-xl`}>
              <card.icon className={`w-7 h-7 ${card.text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className="text-4xl font-bold text-gray-900 leading-tight">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: '#991b1b' }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Tulis Artikel Baru
          </Link>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Lihat Website →
          </Link>
        </div>
      </div>
    </div>
  );
}
