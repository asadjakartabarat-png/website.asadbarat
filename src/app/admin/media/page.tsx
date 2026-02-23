'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Trash2, Copy, Upload, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import toast from 'react-hot-toast';

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export default function MediaPage() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImages(data);
    } catch {
      toast.error('Gagal memuat gambar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!res.ok) throw new Error(data.error?.message);
      toast.success('Gambar berhasil diupload!');
      fetchImages();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Upload gagal');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (public_id: string) => {
    if (!confirm('Hapus gambar ini?')) return;
    try {
      const res = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Gambar dihapus');
      setImages(prev => prev.filter(img => img.public_id !== public_id));
    } catch {
      toast.error('Gagal menghapus gambar');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL disalin!');
  };

  const formatSize = (bytes: number) => (bytes / 1024).toFixed(0) + ' KB';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media</h1>
          <p className="text-gray-600">Kelola file media</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchImages} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <label className={`flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Upload className="w-4 h-4" />
            {uploading ? 'Mengupload...' : 'Upload Gambar'}
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Library ({images.length} gambar)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Memuat gambar...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Belum ada gambar. Upload gambar pertama Anda.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.public_id} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-video relative">
                    <Image src={img.secure_url} alt={img.public_id} fill className="object-cover" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-400 truncate">{img.public_id.split('/').pop()}</p>
                    <p className="text-xs text-gray-400">{formatSize(img.bytes)}</p>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => copyUrl(img.secure_url)} className="p-2 bg-white rounded-lg hover:bg-gray-100" title="Copy URL">
                      <Copy className="w-4 h-4 text-gray-700" />
                    </button>
                    <button onClick={() => handleDelete(img.public_id)} className="p-2 bg-white rounded-lg hover:bg-red-50" title="Hapus">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
