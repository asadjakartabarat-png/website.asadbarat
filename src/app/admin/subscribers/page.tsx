'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/subscribers');
    const data = await res.json();
    setSubscribers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus subscriber ini?')) return;
    await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
    setSubscribers(prev => prev.filter(s => s.id !== id));
    toast.success('Subscriber dihapus');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscribers Newsletter</h1>
        <p className="text-gray-600">{subscribers.length} subscriber terdaftar</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Subscriber ({subscribers.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-400">Memuat...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Belum ada subscriber.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {subscribers.map(sub => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                    <p className="text-xs text-gray-400">{formatDate(sub.created_at)}</p>
                  </div>
                  <button onClick={() => handleDelete(sub.id)} title="Hapus"
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
