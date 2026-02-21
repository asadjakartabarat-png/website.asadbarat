import { getPublishedArticles, getFeaturedArticle } from '@/lib/turso/db';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ArticleCard from '@/components/public/ArticleCard';
import HeroSection from '@/components/public/HeroSection';

export default async function HomePage() {
  const [featuredArticle, latestArticles] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(12),
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
