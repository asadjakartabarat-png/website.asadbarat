import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'Tentang Kami - BeritaKu',
  description: 'Tentang BeritaKu, portal berita terkini dan terpercaya.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Tentang Kami</h1>
        <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
          <p>
            <strong>BeritaKu</strong> adalah portal berita digital yang menyajikan informasi terkini,
            akurat, dan terpercaya untuk masyarakat Indonesia, khususnya warga Jakarta Barat dan sekitarnya.
          </p>
          <p>
            Kami berkomitmen untuk menyampaikan berita secara objektif dan bertanggung jawab, mencakup
            berbagai topik mulai dari politik, ekonomi, hukum, olahraga, hingga teknologi.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-2">Visi</h2>
          <p>
            Menjadi sumber informasi terpercaya yang mendukung masyarakat dalam mengambil keputusan
            berdasarkan fakta dan data yang valid.
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-2">Misi</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Menyajikan berita yang akurat, cepat, dan berimbang.</li>
            <li>Mendukung kebebasan pers yang bertanggung jawab.</li>
            <li>Memberikan ruang bagi suara masyarakat lokal.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-8 mb-2">Tim Redaksi</h2>
          <p>
            BeritaKu dikelola oleh tim jurnalis dan editor berpengalaman yang berdedikasi untuk
            menghadirkan konten berkualitas setiap harinya.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
