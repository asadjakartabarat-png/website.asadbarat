# Website Berita - BeritaKu

Website berita modern dengan admin panel lengkap menggunakan Next.js 14, TypeScript, dan Supabase.

## 🚀 Fitur Utama

### Frontend Publik
- **Homepage**: Hero section dengan breaking news dan grid artikel terbaru
- **Detail Artikel**: Layout clean dengan share buttons dan artikel terkait
- **Kategori Pages**: Halaman khusus untuk setiap kategori berita
- **Search**: Pencarian artikel dengan debouncing
- **Responsive Design**: Mobile-first approach

### Admin Panel
- **Dashboard**: Statistik dan overview sistem
- **Article Management**: CRUD artikel dengan rich text editor
- **Category Management**: Kelola kategori berita
- **User Management**: Kelola admin dan editor
- **Media Manager**: Upload dan kelola gambar
- **Role-based Access**: Super Admin, Editor, Writer

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 dengan TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Rich Text Editor**: ReactQuill
- **Form Validation**: React Hook Form + Zod
- **Deployment**: Vercel

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd website-berita
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env.local` berdasarkan `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://eizrsybushirzoxdpilc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenJzeWJ1c2hpcnpveGRwaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTkyOTUsImV4cCI6MjA3MzM5NTI5NX0.tF4AmoyAZza0g2OgPdfPJ9_1Zd1vh8QqNfYE16ZH6Kg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenJzeWJ1c2hpcnpveGRwaWxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgxOTI5NSwiZXhwIjoyMDczMzk1Mjk1fQ._tVsz63XLsRm8FDMLzux9EomySIL6F30Cg3MuyzYQK4
NEXT_PUBLIC_SITE_URL=https://asad-jakbar.vercel.app
```

### 4. Setup Database
1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL script dari file `database.sql` di SQL Editor Supabase
3. Buat user admin pertama di tabel `users`

### 5. Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat website.

## 🗄️ Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  full_name VARCHAR,
  role VARCHAR CHECK (role IN ('super_admin', 'editor', 'writer')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Categories Table
```sql
categories (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE,
  slug VARCHAR UNIQUE,
  description TEXT,
  created_at TIMESTAMP
)
```

### Articles Table
```sql
articles (
  id UUID PRIMARY KEY,
  title VARCHAR,
  slug VARCHAR UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id),
  status VARCHAR CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  meta_title VARCHAR,
  meta_description TEXT
)
```

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "New Project"
3. Import repository dari GitHub
4. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (URL production Anda)
5. Deploy

### 3. Setup Custom Domain (Opsional)
1. Di Vercel Dashboard, buka project settings
2. Tambahkan custom domain
3. Update DNS records sesuai instruksi Vercel

## 👥 User Roles

### Super Admin
- Full access ke semua fitur
- Kelola users, categories, articles
- Kelola settings sistem

### Editor
- Kelola semua articles
- Kelola categories
- Tidak bisa kelola users

### Writer
- Hanya bisa kelola artikel sendiri
- Tidak bisa kelola categories atau users

## 📱 Responsive Design

Website ini menggunakan mobile-first approach dengan breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security Features

- Row Level Security (RLS) di Supabase
- Route protection dengan middleware
- Role-based access control
- Input validation dengan Zod
- XSS protection

## 🎨 Design System

### Colors
- Primary: Red (#DC2626) - seperti Tempo
- Secondary: Gray (#6B7280)
- Background: White (#FFFFFF)
- Text: Black (#111827)

### Typography
- Font: Inter (Google Fonts)
- Heading: Bold weights
- Body: Regular weight

## 📝 Content Management

### Artikel
- Rich text editor dengan ReactQuill
- Auto slug generation dari title
- SEO meta fields
- Featured image support
- Status: Draft, Published, Scheduled

### Media
- Image upload ke Supabase Storage
- Automatic optimization
- File size limits
- Supported formats: JPG, PNG, WebP

## 🔍 SEO Features

- Meta tags otomatis
- Open Graph support
- Structured data
- Sitemap generation
- Clean URLs dengan slug

## 🚦 Performance

- Next.js 14 App Router
- Server-side rendering (SSR)
- Image optimization
- Code splitting
- Lazy loading

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build production
npm run build

# Start production server
npm start
```

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini atau hubungi tim development.

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.