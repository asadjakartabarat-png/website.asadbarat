'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateSlug } from '@/lib/utils';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori harus diisi'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState(category?.slug || '');
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
    },
  });

  const watchName = watch('name');

  useEffect(() => {
    if (watchName && !category) setSlug(generateSlug(watchName));
  }, [watchName, category]);

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, slug: category?.slug || slug };

      const res = category
        ? await fetch(`/api/categories/${category.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Terjadi kesalahan');

      toast.success(category ? 'Kategori berhasil diupdate!' : 'Kategori berhasil dibuat!');
      router.push('/admin/categories');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Informasi Kategori</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
            <Input {...register('name')} placeholder="Masukkan nama kategori" />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="kategori-slug" disabled={!!category} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Deskripsi kategori (opsional)" />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : category ? 'Update' : 'Simpan'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
