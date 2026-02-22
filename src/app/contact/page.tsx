import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'Kontak - BeritaKu',
  description: 'Hubungi tim redaksi BeritaKu.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Kontak</h1>
        <p className="text-gray-700 mb-8">
          Punya pertanyaan, saran, atau ingin bekerja sama? Hubungi kami melalui informasi di bawah ini.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Email Redaksi</h2>
              <p className="text-gray-600">redaksi@beritaku.com</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Email Iklan & Kerjasama</h2>
              <p className="text-gray-600">iklan@beritaku.com</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Telepon</h2>
              <p className="text-gray-600">(021) 123-4567</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Alamat</h2>
              <p className="text-gray-600">Jakarta Barat, DKI Jakarta, Indonesia</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Kirim Pesan</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Tulis pesan Anda..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
