import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Article } from '@/types';
import { formatDateTime } from '@/lib/utils';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ShareButtons from '@/components/public/ShareButtons';
import RelatedArticles from '@/components/public/RelatedArticles';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

async function getArticle(slug: string): Promise<Article | null> {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      categories!articles_category_id_fkey(name, slug),
      users!articles_author_id_fkey(full_name)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    return null;
  }

  return data as unknown as Article;
}

async function getRelatedArticles(categoryId: string, currentId: string): Promise<Article[]> {
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
    .neq('id', currentId)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error) {
    return [];
  }

  return (data || []) as unknown as Article[];
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan',
    };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.featured_image ? [article.featured_image] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category_id, article.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-primary-500">Beranda</Link></li>
              <li>/</li>
              {(article.categories || article.category) && (
                <>
                  <li>
                    <Link 
                      href={`/categories/${(article.categories || article.category)?.slug}`}
                      className="hover:text-primary-500"
                    >
                      {(article.categories || article.category)?.name}
                    </Link>
                  </li>
                  <li>/</li>
                </>
              )}
              <li className="text-gray-900 truncate">{article.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            {(article.categories || article.category) && (
              <Link
                href={`/categories/${(article.categories || article.category)?.slug}`}
                className="inline-block text-primary-500 hover:text-primary-600 font-medium mb-4"
              >
                {(article.categories || article.category)?.name}
              </Link>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-gray-600 space-x-4">
                {(article.users || article.author) && (
                  <span>Oleh {(article.users || article.author)?.full_name}</span>
                )}
                <span>•</span>
                <time>{formatDateTime(article.published_at || article.created_at)}</time>
              </div>
              
              <ShareButtons 
                url={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`}
                title={article.title}
              />
            </div>

            {article.featured_image && (
              <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Share Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Bagikan Artikel</h3>
            <ShareButtons 
              url={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`}
              title={article.title}
            />
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <RelatedArticles articles={relatedArticles} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}