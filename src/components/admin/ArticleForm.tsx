'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { generateSlug } from '@/lib/utils';
import { Category, Article } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const articleSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  excerpt: z.string().min(1, 'Excerpt harus diisi'),
  content: z.string().min(1, 'Konten harus diisi'),
  category_id: z.string().min(1, 'Kategori harus dipilih'),
  featured_image: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  published_at: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  categories: Category[];
  article?: Article;
}

export default function ArticleForm({ categories, article }: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slug, setSlug] = useState(article?.slug || '');
  const router = useRouter();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
      formData.append('folder', 'asadjakbar');
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Upload gagal');
      setValue('featured_image', data.secure_url);
      toast.success('Gambar berhasil diupload!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Upload gagal');
    } finally {
      setUploading(false);
    }
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      content: article?.content || '',
      category_id: article?.category_id || '',
      featured_image: article?.featured_image || '',
      status: article?.status || 'draft',
      published_at: article?.published_at || '',
      meta_title: article?.meta_title || '',
      meta_description: article?.meta_description || '',
    },
  });

  const watchTitle = watch('title');
  const watchContent = watch('content');

  useEffect(() => {
    if (watchTitle && !article) setSlug(generateSlug(watchTitle));
  }, [watchTitle, article]);

  const onSubmit = async (data: ArticleFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, slug: article?.slug || slug };

      const res = article
        ? await fetch(`/api/articles/${article.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Terjadi kesalahan');

      toast.success(article ? 'Artikel berhasil diupdate!' : 'Artikel berhasil dibuat!');
      router.push('/admin/articles');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Konten Artikel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <Input {...register('title')} placeholder="Masukkan judul artikel" />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="artikel-slug" disabled={!!article} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea {...register('excerpt')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Ringkasan singkat artikel" />
                {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten</label>
                <ReactQuill
                  value={watchContent}
                  onChange={(content) => setValue('content', content)}
                  modules={{ toolbar: [[{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['link', 'image'], ['clean']] }}
                  style={{ height: '300px', marginBottom: '50px' }}
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <Input {...register('meta_title')} placeholder="Meta title untuk SEO" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea {...register('meta_description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Meta description untuk SEO" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Publish</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...register('status')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select {...register('category_id')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <Input {...register('featured_image')} placeholder="https://example.com/image.jpg" className="mb-2" />
                <label className={`w-full flex items-center justify-center px-3 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer text-sm text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? 'Mengupload...' : '📁 Upload dari komputer'}
                </label>
                {watch('featured_image') && (
                  <img src={watch('featured_image')} alt="preview" className="mt-2 w-full h-32 object-cover rounded-md" />
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Menyimpan...' : article ? 'Update' : 'Simpan'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
