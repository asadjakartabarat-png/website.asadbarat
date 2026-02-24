import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4">Portal Kegiatan Persinas Asad Kota Jakarta Barat</h3>
            <p className="text-gray-300">
              Portal berita kegiatan persinas asad kota jakarta barat terkini
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Kategori</h4>
            <ul className="space-y-2">
              <li><Link href="/categories/politik" className="text-gray-300 hover:text-white">Politik</Link></li>
              <li><Link href="/categories/ekonomi" className="text-gray-300 hover:text-white">Ekonomi</Link></li>
              <li><Link href="/categories/hukum" className="text-gray-300 hover:text-white">Hukum</Link></li>
              <li><Link href="/categories/olahraga" className="text-gray-300 hover:text-white">Olahraga</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Tentang</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-white">Tentang Kami</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white">Kontak</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white">Kebijakan Privasi</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <div className="text-gray-300 space-y-2">
              <p>Email: asad.jakartabarat@gmail.com</p>
              <p>Telepon: +62 897-9157-353</p>
              <p>Alamat: Jl. Fajar Baru III No.11 2, RT.2/RW.8, Cengkareng Tim., Kecamatan Cengkareng, Kota Jakarta Barat, DKI Jakarta 11730</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Persinas Asad Jakarta Barat. Semua hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
