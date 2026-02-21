export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import { getArticleById, getAllCategories } from '@/lib/turso/db';
import ArticleForm from '@/components/admin/ArticleForm';

interface EditArticlePageProps {
  params: { id: string };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, categories] = await Promise.all([
    getArticleById(params.id),
    getAllCategories(),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Artikel</h1>
        <p className="text-gray-600">Edit artikel berita</p>
      </div>
      <ArticleForm categories={categories} article={article} />
    </div>
  );
}
