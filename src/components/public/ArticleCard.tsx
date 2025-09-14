import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate, truncateText } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/articles/${article.slug}`}>
        <div className="aspect-video relative">
          {article.featured_image ? (
            <Image
              src={article.featured_image}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        {(article.categories || article.category) && (
          <Link
            href={`/categories/${(article.categories || article.category)?.slug}`}
            className="inline-block text-primary-500 hover:text-primary-600 text-sm font-medium mb-2"
          >
            {(article.categories || article.category)?.name}
          </Link>
        )}
        
        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">
          <Link href={`/articles/${article.slug}`} className="hover:text-primary-500">
            {truncateText(article.title, 80)}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 leading-relaxed">
          {truncateText(article.excerpt, 120)}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          {(article.users || article.author) && (
            <span>{(article.users || article.author)?.full_name}</span>
          )}
          <span>{formatDate(article.published_at || article.created_at)}</span>
        </div>
      </div>
    </article>
  );
}