import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Article } from '@/types';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ArticleCard from '@/components/public/ArticleCard';
import HeroSection from '@/components/public/HeroSection';

async function getLatestArticles(): Promise<Article[]> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image, published_at, created_at,
      categories!articles_category_id_fkey(name, slug),
      users!articles_author_id_fkey(full_name)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}

async function getFeaturedArticle(): Promise<Article | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image, published_at, created_at,
      categories!articles_category_id_fkey(name, slug),
      users!articles_author_id_fkey(full_name)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching featured article:', error);
    return null;
  }

  return data;
}

export default async function HomePage() {
  const [featuredArticle, latestArticles] = await Promise.all([
    getFeaturedArticle(),
    getLatestArticles(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {featuredArticle && <HeroSection article={featuredArticle} />}
        
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Berita Terbaru</h2>
          
          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada artikel yang dipublikasikan.</p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}