import type { Metadata } from 'next';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'Tentang Kami - PERSINAS ASAD Jakarta Barat',
  description: 'Tentang PERSINAS ASAD, perguruan pencak silat nasional yang didirikan pada 30 April 1993.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Tentang Kami</h1>
        <div className="prose prose-gray max-w-none space-y-4 text-gray-700">
          <p>
            <strong>Perguruan Pencak Silat Nasional (PERSINAS) ASAD</strong> adalah yayasan perguruan
            pencak silat nasional yang didirikan pada tanggal 30 April 1993 dengan Akta Nomor 430 Notaris
            J.L. Waworuntu. Berasaskan Pancasila dan UUD 1945, PERSINAS ASAD menghimpun seluruh potensi
            bangsa dalam melestarikan seni bela diri pencak silat nasional. ASAD merupakan singkatan dari
            Ampuh, Sehat, Aman, Damai, dengan motto: &quot;Dengan AMAN, untuk SELAMAT, dengan AMPUH menjadi DAMAI.&quot;
          </p>
          <h2 className="text-xl font-semibold mt-8 mb-2">Visi</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Menjadi Perguruan Pencak Silat Andalan (Center of Excellence) dengan pendekar-pendekar yang religius, andal, tahan uji, menjunjung tinggi sportivitas, dan memiliki karakter budi luhur.</li>
            <li>Melestarikan seni bela diri pencak silat sebagai bagian dari identitas dan budaya bangsa Indonesia.</li>
            <li>Berprestasi di tingkat nasional dan internasional sebagai kebanggaan bangsa.</li>
          </ol>
          <h2 className="text-xl font-semibold mt-8 mb-2">Misi</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Membentuk insan pencak silat yang religius, mandiri, handal, tahan uji, berakhlak mulia, jujur, amanah, rukun, kompak, dan sportif.</li>
            <li>Melestarikan seni budaya pencak silat sebagai sarana menjaga persatuan dan kesatuan bangsa.</li>
            <li>Berperan aktif dalam organisasi pencak silat dari tingkat kecamatan hingga internasional.</li>
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
