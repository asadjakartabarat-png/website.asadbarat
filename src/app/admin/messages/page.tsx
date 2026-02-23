'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trash2, Mail, MailOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/messages');
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const markRead = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: 'PATCH' });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pesan ini?')) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m.id !== id));
    toast.success('Pesan dihapus');
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pesan Masuk</h1>
        <p className="text-gray-600">{unread} pesan belum dibaca</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Semua Pesan ({messages.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-400">Memuat...</p>
          ) : messages.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Belum ada pesan masuk.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map(msg => (
                <div key={msg.id} className={`py-4 ${!msg.is_read ? 'bg-red-50 -mx-6 px-6' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && <span className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0" />}
                        <span className="font-semibold text-gray-900">{msg.name}</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="text-gray-500 text-sm">{msg.email}</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="text-gray-400 text-xs">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!msg.is_read && (
                        <button onClick={() => markRead(msg.id)} title="Tandai sudah dibaca"
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      {msg.is_read && <MailOpen className="w-4 h-4 text-gray-300 mt-1.5" />}
                      <button onClick={() => handleDelete(msg.id)} title="Hapus"
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
