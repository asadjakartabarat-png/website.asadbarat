import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Article, Category } from '@/types';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ArticleCard from '@/components/public/ArticleCard';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

async function getCategoryArticles(categoryId: string): Promise<Article[]> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories!articles_category_id_fkey(name, slug),
      users!articles_author_id_fkey(full_name)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    return {
      title: 'Kategori Tidak Ditemukan',
    };
  }

  return {
    title: `${category.name} - BeritaKu`,
    description: category.description || `Berita terbaru kategori ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    notFound();
  }

  const articles = await getCategoryArticles(category.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-primary-500">Beranda</Link></li>
            <li>/</li>
            <li className="text-gray-900">{category.name}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </header>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada artikel dalam kategori ini.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}