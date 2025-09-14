import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, truncateText } from '@/lib/utils';

interface HeroSectionProps {
  article: Article;
}

export default function HeroSection({ article }: HeroSectionProps) {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-4">
              <span className="inline-block bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Breaking News
              </span>
              {article.category && (
                <Link
                  href={`/categories/${article.category.slug}`}
                  className="inline-block ml-2 text-primary-500 hover:text-primary-600 font-medium"
                >
                  {article.category.name}
                </Link>
              )}
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              <Link href={`/articles/${article.slug}`} className="hover:text-primary-500">
                {article.title}
              </Link>
            </h1>
            
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {truncateText(article.excerpt, 200)}
            </p>
            
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              {article.author && (
                <span>Oleh {article.author.full_name}</span>
              )}
              <span>•</span>
              <span>{formatDate(article.published_at || article.created_at)}</span>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            {article.featured_image ? (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}