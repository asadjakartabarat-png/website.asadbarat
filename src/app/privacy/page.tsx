import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - BeritaKu',
  description: 'Kebijakan privasi dan perlindungan data pengguna BeritaKu.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Kebijakan Privasi</h1>
        <p className="text-sm text-gray-500 mb-8">Terakhir diperbarui: Januari 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami dapat mengumpulkan informasi yang Anda berikan secara langsung, seperti nama dan
              alamat email saat menghubungi kami, serta data penggunaan seperti halaman yang dikunjungi
              dan waktu kunjungan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Penggunaan Informasi</h2>
            <p>Informasi yang dikumpulkan digunakan untuk:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Meningkatkan kualitas layanan dan konten website.</li>
              <li>Merespons pertanyaan atau pesan yang Anda kirimkan.</li>
              <li>Menganalisis tren penggunaan untuk pengembangan website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Cookies</h2>
            <p>
              Website ini menggunakan cookies untuk meningkatkan pengalaman pengguna. Anda dapat
              menonaktifkan cookies melalui pengaturan browser, namun beberapa fitur website mungkin
              tidak berfungsi optimal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Keamanan Data</h2>
            <p>
              Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari
              akses, penggunaan, atau pengungkapan yang tidak sah.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Pihak Ketiga</h2>
            <p>
              Kami tidak menjual, memperdagangkan, atau mengalihkan informasi pribadi Anda kepada pihak
              ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Perubahan Kebijakan</h2>
            <p>
              Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan diberitahukan melalui
              halaman ini dengan memperbarui tanggal revisi di bagian atas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami di{' '}
              <a href="mailto:asad.jakartabarat@gmail.com" className="text-red-600 hover:underline">
                redaksi@beritaku.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
