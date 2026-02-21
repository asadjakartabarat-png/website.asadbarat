import { Suspense } from 'react';
import Link from 'next/link';
import { searchArticles } from '@/lib/turso/db';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ArticleCard from '@/components/public/ArticleCard';

interface SearchPageProps {
  searchParams: { q?: string };
}

async function SearchResultsContent({ query }: { query: string }) {
  const articles = await searchArticles(query);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hasil Pencarian untuk &quot;{query}&quot;
        </h1>
        <p className="text-gray-600">Ditemukan {articles.length} artikel</p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Tidak ada artikel yang ditemukan untuk pencarian &quot;{query}&quot;.
          </p>
          <Link href="/" className="text-primary-500 hover:text-primary-600">
            Kembali ke Beranda
          </Link>
        </div>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-primary-500">Beranda</Link></li>
            <li>/</li>
            <li className="text-gray-900">Pencarian</li>
          </ol>
        </nav>

        {query ? (
          <Suspense fallback={<div>Mencari...</div>}>
            <SearchResultsContent query={query} />
          </Suspense>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Masukkan kata kunci untuk mencari artikel.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
