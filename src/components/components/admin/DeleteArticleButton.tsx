'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteArticleButtonProps {
  articleId: string;
}

export default function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${articleId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      toast.success('Artikel berhasil dihapus!');
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading} className="text-red-600 hover:text-red-700 hover:bg-red-50">
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
