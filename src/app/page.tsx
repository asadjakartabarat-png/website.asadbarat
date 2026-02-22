import { getPublishedArticles, getFeaturedArticle, getArticlesByCategorySlug } from '@/lib/turso/db';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ArticleCard from '@/components/public/ArticleCard';
import HeroSection from '@/components/public/HeroSection';
import CategorySection from '@/components/public/CategorySection';
import NewsletterSection from '@/components/public/NewsletterSection';

export default async function HomePage() {
  const [featuredArticle, latestArticles, politikArticles, teknologiArticles] = await Promise.all([
    getFeaturedArticle(),
    getPublishedArticles(12),
    getArticlesByCategorySlug('politik', 5),
    getArticlesByCategorySlug('teknologi', 5),
  ]);

  // Artikel sekunder hero: exclude featured, ambil 3 berikutnya
  const secondaryArticles = latestArticles
    .filter((a) => a.id !== featuredArticle?.id)
    .slice(0, 3);

  // Grid artikel: exclude featured + secondary
  const excludeIds = new Set([featuredArticle?.id, ...secondaryArticles.map((a) => a.id)]);
  const gridArticles = latestArticles.filter((a) => !excludeIds.has(a.id));

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Header />
      <main>
        {/* Hero Section */}
        {featuredArticle && (
          <HeroSection featured={featuredArticle} secondary={secondaryArticles} />
        )}

        <div className="container mx-auto px-4">
          {/* Grid Artikel Terbaru */}
          <section className="py-8">
            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-red-600 pl-3 mb-6">
              Berita Terbaru
            </h2>
            {gridArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">Belum ada artikel yang dipublikasikan.</p>
            )}
          </section>

          {/* Seksi Kategori Politik */}
          <CategorySection title="Politik" slug="politik" articles={politikArticles} />

          {/* Seksi Kategori Teknologi */}
          <CategorySection title="Teknologi" slug="teknologi" articles={teknologiArticles} />
        </div>

        {/* Newsletter */}
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
