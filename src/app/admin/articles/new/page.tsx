import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Category } from '@/types';
import ArticleForm from '@/components/admin/ArticleForm';

async function getCategories(): Promise<Category[]> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export default async function NewArticlePage() {
  const categories = await getCategories();

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