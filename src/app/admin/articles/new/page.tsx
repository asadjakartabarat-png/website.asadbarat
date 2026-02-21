export const dynamic = 'force-dynamic';
import { getAllCategories } from '@/lib/turso/db';
import ArticleForm from '@/components/admin/ArticleForm';

export default async function NewArticlePage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Artikel Baru</h1>
        <p className="text-gray-600">Buat artikel berita baru</p>
      </div>
      <ArticleForm categories={categories} />
    </div>
  );
}
