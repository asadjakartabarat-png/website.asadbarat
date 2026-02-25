import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import ContactForm from '@/components/public/ContactForm';

export const metadata: Metadata = {
  title: 'Kontak - Asad Jakbar',
  description: 'Hubungi tim redaksi Asad Jakbar.',
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
              <p className="text-gray-600">asad.jakartabarat@gmail.com</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Telepon</h2>
              <p className="text-gray-600">+62 897-9157-353</p>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Alamat</h2>
              <p className="text-gray-600">Jl. Fajar Baru III No.11 2, RT.2/RW.8, Cengkareng Tim., Kecamatan Cengkareng, Kota Jakarta Barat, DKI Jakarta 11730</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
