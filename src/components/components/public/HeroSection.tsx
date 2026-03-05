import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, truncateText } from '@/lib/utils';

interface HeroSectionProps {
  featured: Article;
  secondary: Article[];
}

function ArticleImage({ src, alt, priority = false }: { src?: string; alt: string; priority?: boolean }) {
  if (src) {
    return <Image src={src} alt={alt} fill className="object-cover" priority={priority} />;
  }
  return <div className="w-full h-full bg-gray-200 flex items-center justify-center"><span className="text-gray-400 text-sm">No Image</span></div>;
}

export default function HeroSection({ featured, secondary }: HeroSectionProps) {
  const cat = featured.categories;
  return (
    <section className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
          {/* Featured utama - 2/3 lebar */}
          <div className="lg:col-span-2">
            <Link href={`/articles/${featured.slug}`} className="block group">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <ArticleImage src={featured.featured_image} alt={featured.title} priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {cat && (
                    <span className="inline-block bg-red-600 text-white text-xs font-bold uppercase px-2 py-1 mb-2">
                      {cat.name}
                    </span>
                  )}
                  <h1 className="text-white text-xl lg:text-2xl font-bold leading-tight group-hover:underline">
                    {featured.title}
                  </h1>
                  <p className="text-gray-300 text-sm mt-1">
                    {(featured.users)?.full_name} · {formatDate(featured.published_at || featured.created_at)}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Artikel sekunder - 1/3 lebar */}
          <div className="flex flex-row lg:flex-col gap-4 mt-4 lg:mt-0">
            {secondary.slice(0, 3).map((article) => {
              const sCat = article.categories;
              return (
                <Link key={article.id} href={`/articles/${article.slug}`} className="flex lg:flex-row gap-3 group flex-1 lg:flex-none">
                  <div className="relative w-24 h-16 lg:w-20 lg:h-16 flex-shrink-0 overflow-hidden rounded">
                    <ArticleImage src={article.featured_image} alt={article.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {sCat && (
                      <span className="text-red-600 text-xs font-bold uppercase">{sCat.name}</span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight mt-0.5 line-clamp-2 group-hover:text-red-600">
                      {truncateText(article.title, 80)}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(article.published_at || article.created_at)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}