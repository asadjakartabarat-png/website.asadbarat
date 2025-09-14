import { notFound } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Article, Category } from '@/types';
import ArticleForm from '@/components/admin/ArticleForm';

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

async function getArticle(id: string): Promise<Article | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }

  return data;
}

async function getCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    return [];
  }

  return data || [];
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, categories] = await Promise.all([
    getArticle(params.id),
    getCategories()
  ]);

  if (!article) {
    notFound();
  }

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