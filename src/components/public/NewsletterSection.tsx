'use client';

import { useState } from 'react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="bg-gray-900 py-12">
      <div className="container mx-auto px-4 text-center max-w-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Tetap Terinformasi</h2>
        <p className="text-gray-400 mb-6">Dapatkan berita terkini langsung di inbox Anda</p>
        {submitted ? (
          <p className="text-green-400 font-semibold">Terima kasih! Anda telah berlangganan.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-md text-sm transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
