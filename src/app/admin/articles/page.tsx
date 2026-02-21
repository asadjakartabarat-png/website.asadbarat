export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getAllArticlesAdmin } from '@/lib/turso/db';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Edit, Eye } from 'lucide-react';
import DeleteArticleButton from '@/components/admin/DeleteArticleButton';

export default async function ArticlesPage() {
  const articles = await getAllArticlesAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artikel</h1>
          <p className="text-gray-600">Kelola semua artikel berita</p>
        </div>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Artikel
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          {articles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Judul</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Kategori</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Penulis</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{article.excerpt}</div>
                      </td>
                      <td className="py-3 px-4">
                        {article.categories && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {article.categories.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{article.users?.full_name}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          article.status === 'published' ? 'bg-green-100 text-green-800'
                          : article.status === 'draft' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                          {article.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDateTime(article.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {article.status === 'published' && (
                            <Link href={`/articles/${article.slug}`} target="_blank">
                              <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                            </Link>
                          )}
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                          </Link>
                          <DeleteArticleButton articleId={article.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Belum ada artikel</p>
              <Link href="/admin/articles/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Artikel Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
