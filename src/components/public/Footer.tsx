import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary-500 mb-4">BeritaKu</h3>
            <p className="text-gray-300">
              Portal berita terkini dan terpercaya untuk memberikan informasi akurat kepada masyarakat.
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
              <p>Email: info@beritaku.com</p>
              <p>Telepon: (021) 123-4567</p>
              <p>Alamat: Jakarta, Indonesia</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 BeritaKu. Semua hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}