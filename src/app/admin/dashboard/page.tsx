import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { FileText, Users, FolderOpen, Eye } from 'lucide-react';

async function getDashboardStats() {
  const supabase = createServerSupabaseClient();

  try {
    const [
      { count: totalArticles },
      { count: publishedArticles },
      { count: draftArticles },
      { count: totalCategories },
      { count: totalUsers }
    ] = await Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalArticles: totalArticles || 0,
      publishedArticles: publishedArticles || 0,
      draftArticles: draftArticles || 0,
      totalCategories: totalCategories || 0,
      totalUsers: totalUsers || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalCategories: 0,
      totalUsers: 0
    };
  }
}

async function getRecentArticles() {
  const supabase = createServerSupabaseClient();
  
  const { data } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      status,
      created_at,
      author_id,
      users!articles_author_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function DashboardPage() {
  const [stats, recentArticles] = await Promise.all([
    getDashboardStats(),
    getRecentArticles()
  ]);

  const statCards = [
    {
      title: 'Total Artikel',
      value: stats.totalArticles,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Artikel Published',
      value: stats.publishedArticles,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Draft Artikel',
      value: stats.draftArticles,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Kategori',
      value: stats.totalCategories,
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di admin panel BeritaKu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Artikel Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentArticles.length > 0 ? (
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{article.title}</h3>
                    <p className="text-sm text-gray-600">
                      Oleh {(article as any).users?.full_name || 'Unknown'} • {new Date(article.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    article.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : article.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Belum ada artikel</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}