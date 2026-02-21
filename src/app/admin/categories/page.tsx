export const dynamic = 'force-dynamic';
import Link from 'next/link'; from '@/lib/turso/db';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Plus, Edit } from 'lucide-react';
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton';

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-gray-600">Kelola kategori berita</p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Slug</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Deskripsi</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                      <td className="py-3 px-4 text-gray-600">{category.slug}</td>
                      <td className="py-3 px-4 text-gray-600">{category.description || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(category.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                          </Link>
                          <DeleteCategoryButton categoryId={category.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Belum ada kategori</p>
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Kategori Pertama
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
