import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface CategorySectionProps {
  title: string;
  slug: string;
  articles: Article[];
}

export default function CategorySection({ title, slug, articles }: CategorySectionProps) {
  if (articles.length === 0) return null;
  const [featured, ...rest] = articles;

  return (
    <section className="py-8 border-t">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-red-600 pl-3">{title}</h2>
        <Link href={`/categories/${slug}`} className="text-sm text-red-600 font-semibold hover:underline">
          Lihat Semua →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured kiri */}
        <div className="lg:col-span-2">
          <Link href={`/articles/${featured.slug}`} className="block group">
            <div className="relative aspect-video overflow-hidden rounded-lg">
              {featured.featured_image ? (
                <Image src={featured.featured_image} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block bg-red-600 text-white text-xs font-bold uppercase px-2 py-0.5 mb-2">{title}</span>
                <h3 className="text-white font-bold text-lg leading-tight group-hover:underline">{featured.title}</h3>
                <p className="text-gray-300 text-xs mt-1">{formatDate(featured.published_at || featured.created_at)}</p>
              </div>
            </div>
          </Link>
        </div>

        {/* List kanan */}
        <div className="flex flex-col gap-4">
          {rest.slice(0, 4).map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`} className="flex gap-3 group">
              <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded">
                {article.featured_image ? (
                  <Image src={article.featured_image} alt={article.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1">{formatDate(article.published_at || article.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
