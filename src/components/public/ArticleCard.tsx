import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { formatDate } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const cat = article.categories;
  const author = article.users;
  return (
    <article className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          {article.featured_image ? (
            <Image src={article.featured_image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        {cat && (
          <Link href={`/categories/${cat.slug}`} className="inline-block text-red-600 text-xs font-bold uppercase tracking-wide mb-2 hover:text-red-700">
            {cat.name}
          </Link>
        )}
        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-3">
          <Link href={`/articles/${article.slug}`} className="hover:text-red-600 transition-colors">
            {article.title}
          </Link>
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          {author && <span>{author.full_name}</span>}
          <span>{formatDate(article.published_at || article.created_at)}</span>
        </div>
      </div>
    </article>
  );
}