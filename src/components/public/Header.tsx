'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const CATEGORIES = [
  { name: 'Politik', slug: 'politik' },
  { name: 'Ekonomi', slug: 'ekonomi' },
  { name: 'Hukum', slug: 'hukum' },
  { name: 'Olahraga', slug: 'olahraga' },
  { name: 'Teknologi', slug: 'teknologi' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="text-2xl font-black text-red-600 tracking-tight">
            BeritaKu
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56"
            />
            <Button type="submit" size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </form>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Sub-navigasi kategori - horizontal scrollable */}
        <nav className="border-t">
          <div className="overflow-x-auto scrollbar-hide">
            <ul className="flex items-center gap-0 whitespace-nowrap">
              <li>
                <Link
                  href="/"
                  className={`inline-block px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                    pathname === '/'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-red-600'
                  }`}
                >
                  Terbaru
                </Link>
              </li>
              {CATEGORIES.map((cat) => {
                const active = pathname === `/categories/${cat.slug}`;
                return (
                  <li key={cat.slug}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className={`inline-block px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        active
                          ? 'border-red-600 text-red-600'
                          : 'border-transparent text-gray-600 hover:text-red-600'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="flex space-x-2 mt-3">
              <Input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}