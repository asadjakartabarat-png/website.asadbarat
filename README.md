# Website Persinas Asad Jakarta Barat

Website resmi Persinas Asad Jakarta Barat — mencakup portal berita, sistem absensi penderesan, dan aplikasi pasanggiri (kompetisi pencak silat).

**URL Produksi:** https://asadjakbar.vercel.app

---

## 🗂️ Modul Aplikasi

### 1. Portal Berita (Publik)
- Homepage dengan artikel terbaru dan featured article
- Detail artikel dengan artikel terkait
- Halaman per kategori
- Pencarian artikel
- Halaman About, Contact, Privacy
- Form newsletter subscriber

### 2. Admin Panel Berita (`/admin`)
- Login dengan JWT (cookie `admin_token`)
- Dashboard statistik
- CRUD artikel dengan rich text editor (ReactQuill)
- CRUD kategori
- Manajemen user (super_admin, editor, writer)
- Media manager (upload gambar)
- Pesan masuk dari form contact
- Manajemen subscriber
- Akses cepat ke Dashboard Pasanggiri & Absensi (khusus super_admin)

**Role Admin Berita:**
| Role | Akses |
|------|-------|
| super_admin | Full akses semua fitur |
| editor | Artikel, Kategori, Media, Pesan, Subscribers |
| writer | Artikel, Media |

### 3. Absensi Penderesan (`/absensi`)
- Login dengan cookie session `absensi_session`
- Dashboard per role dengan menu akses cepat
- Input absensi per kelompok/desa
- Laporan per desa dan laporan DKI (rekap bulanan)
- Master data (desa, kelompok)
- Kelola user absensi
- Akses cepat ke Dashboard Pasanggiri & Berita (khusus super_admin)

**Role Absensi:**
| Role | Akses |
|------|-------|
| super_admin | Full akses semua fitur |
| koordinator_desa | Input absensi |
| koordinator_daerah | Lihat laporan |
| viewer | Lihat laporan + laporan DKI |
| astrida | Input absensi + laporan |

### 4. Pasanggiri (Kompetisi Pencak Silat) (`/pasanggiri`)
- Login dengan cookie session `pasanggiri_session`
- Sistem penilaian multi-juri (5 juri, ambil 3 nilai tengah)
- Kontrol sesi pertandingan per desa/golongan/kategori/kelas
- Ranking real-time (tampil segera setelah ada nilai juri, tanpa menunggu status COMPLETED)
- Administrasi peserta dan undian urutan tampil
- Lock/unlock event per kelas (PUTRA/PUTRI)
- Juara umum gabungan PUTRA + PUTRI
- Log aktivitas
- Akses cepat ke Dashboard Absensi & Berita (khusus SUPER_ADMIN)

**Role Pasanggiri:**
| Role | Akses |
|------|-------|
| SUPER_ADMIN | Full akses, kelola user, desa, sesi, sistem |
| ADMIN | Dashboard, ranking, detail penilaian, log, administrasi |
| KOORDINATOR_PUTRA / PUTRI | Supervisi sesi, ranking, detail penilaian |
| SIRKULATOR_PUTRA / PUTRI | Kontrol sesi aktif, hasil |
| JURI_PUTRA / JURI_PUTRI | Input nilai, riwayat penilaian |
| VIEWER | Lihat hasil dan ranking |

**Kategori Pertandingan:** PERORANGAN, BERKELOMPOK, MASAL, ATT, BERPASANGAN  
**Golongan:** USIA DINI, PRA REMAJA, REMAJA, DEWASA, ISTIMEWA  
**Kelas:** PUTRA, PUTRI

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14.0.0 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Database | Turso (`@libsql/client` 0.14.0) |
| Auth | JWT (`jose` 5) + Cookie session |
| State | Zustand 4 |
| Form | React Hook Form 7 + Zod 3 + `@hookform/resolvers` |
| Editor | ReactQuill 2 |
| Icons | Lucide React |
| Toast | React Hot Toast 2 |
| Date | date-fns 2 |
| Slug | slugify |
| Deploy | Vercel (free tier) |
| Media Storage | Cloudinary |

---

## 📦 Instalasi

```bash
# 1. Install dependencies
npm install

# 2. Buat file .env.local
# Isi variabel environment (lihat bagian Environment Variables)

# 3. Jalankan development server
npm run dev
```

Buka http://localhost:3000

---

## 🔑 Environment Variables

Buat file `.env.local` dengan isi:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# JWT Secret untuk admin panel berita
JWT_SECRET=your-secret-key-change-in-production

# URL site
NEXT_PUBLIC_SITE_URL=https://asadjakbar.vercel.app

# Cloudinary (untuk media manager di admin panel)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

---

## 🗄️ Database Schema (Turso / SQLite)

Schema modul Berita ada di `database.sql`. Schema Absensi dan Pasanggiri dibuat manual langsung di Turso Web Console → Shell.

### Berita
```sql
users (id, email, password, full_name, role, created_at, updated_at)
-- role: 'super_admin' | 'editor' | 'writer'

categories (id, name, slug, description, created_at)

articles (id, title, slug, content, excerpt, featured_image, category_id,
          author_id, status, published_at, meta_title, meta_description,
          created_at, updated_at)
-- status: 'draft' | 'published' | 'scheduled'

messages (id, name, email, message, is_read, created_at)
subscribers (id, email, created_at)
```

### Absensi
```sql
absensi_users (id, username, password, full_name, role, desa_id, is_active,
               created_at, updated_at)
absensi_desa (id, nama_desa, created_at)
absensi_kelompok (id, desa_id, nama_kelompok, target_putra, target_putri, created_at)
absensi_data (id, kelompok_id, bulan, tahun, hadir_putra, hadir_putri,
              input_by, created_at, updated_at)
-- UNIQUE constraint: (kelompok_id, bulan, tahun)
```

### Pasanggiri
```sql
pasanggiri_users (id, username, password, role, is_active, created_at, updated_at)
pasanggiri_desa (id, nama_desa, created_at)
pasanggiri_peserta (id, nama_peserta, desa_id, kategori, golongan, kelas,
                    created_at, updated_at)
pasanggiri_undian (id, peserta_id, kelas, kategori, golongan, urutan,
                   created_at, updated_at)
pasanggiri_competitions (id, desa_id, kelas, kategori, golongan, status,
                         created_at, updated_at)
-- status: 'ACTIVE' | 'COMPLETED'

pasanggiri_scores (id, competition_id, juri_name, criteria_scores, total_score, created_at)
-- criteria_scores disimpan sebagai JSON string

pasanggiri_activity_logs (id, user_id, username, action, details, created_at)
pasanggiri_event_status (id, kelas, is_locked, locked_by, locked_at, updated_at)
-- UNIQUE constraint: (kelas)
```

---

## 🚀 Deploy ke Vercel

1. Push ke GitHub
2. Import repository di [Vercel Dashboard](https://vercel.com/dashboard)
3. Set environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
4. Deploy otomatis setiap push ke branch `main`

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── page.tsx                    # Homepage berita
│   ├── layout.tsx                  # Root layout (Inter font, Toaster)
│   ├── globals.css                 # Global styles + .card, .skeleton
│   ├── about/                      # Halaman about
│   ├── contact/                    # Halaman contact
│   ├── privacy/                    # Halaman privacy
│   ├── articles/[slug]/            # Detail artikel
│   ├── categories/[slug]/          # Artikel per kategori
│   ├── search/                     # Pencarian artikel
│   ├── admin/                      # Admin panel berita
│   │   ├── layout.tsx              # Sidebar admin (role-based nav)
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── articles/               # List, new, [id]/edit
│   │   ├── categories/             # List, new
│   │   ├── users/
│   │   ├── media/
│   │   ├── messages/
│   │   └── subscribers/
│   ├── absensi/                    # Sistem absensi
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── input/
│   │   ├── laporan/
│   │   ├── laporan-dki/
│   │   ├── master-data/
│   │   └── kelola-user/
│   ├── pasanggiri/                 # Sistem pasanggiri
│   │   ├── login/
│   │   └── dashboard/
│   └── api/                        # API routes
│       ├── auth/                   # Login/logout/me (admin berita)
│       ├── articles/
│       ├── categories/
│       ├── users/
│       ├── media/
│       ├── messages/
│       ├── subscribers/
│       ├── upload/
│       ├── absensi/
│       │   ├── auth/               # Login/logout absensi
│       │   ├── data/
│       │   ├── desa/
│       │   ├── kelompok/
│       │   ├── laporan/
│       │   ├── laporan-dki/
│       │   └── users/
│       └── pasanggiri/
│           ├── auth/               # Login/logout/me pasanggiri
│           ├── competitions/       # CRUD + [id]/
│           ├── scores/
│           ├── results/
│           ├── desa/
│           ├── peserta/
│           ├── undian/
│           ├── users/
│           ├── event-status/
│           └── activity-logs/
├── components/
│   ├── public/                     # ArticleCard, Header, Footer, HeroSection,
│   │                               # CategorySection, ContactForm, RelatedArticles,
│   │                               # NewsletterSection, ShareButtons
│   ├── admin/                      # ArticleForm, CategoryForm, AddUserButton,
│   │                               # DeleteArticleButton, DeleteCategoryButton,
│   │                               # DeleteUserButton
│   ├── absensi/                    # AbsensiLayout, InputAbsensiClient,
│   │                               # LaporanClient, LaporanDKIClient,
│   │                               # MasterDataClient, KelolaUserClient
│   ├── pasanggiri/                 # SuperAdminDashboard, AdminDashboard,
│   │                               # KoordinatorDashboard, SirkulatorDashboard,
│   │                               # JuriDashboard, ViewerDashboard, Sidebar,
│   │                               # RankingView, ResultsView, ScoringForm,
│   │                               # ScoringDetails, ScoreBreakdownModal,
│   │                               # AdministrasiPertandingan, ModalPeserta,
│   │                               # PesertaTerdaftarTab, JuaraUmumGabungan,
│   │                               # JuaraUmumView
│   └── ui/                         # Button, Card, Input
├── lib/
│   ├── turso/
│   │   ├── client.ts               # Turso client (@libsql/client)
│   │   └── db.ts                   # Semua query functions (berita, absensi, pasanggiri)
│   ├── pasanggiri/
│   │   └── scoring.ts              # calculateFinalScore, middle-3, tie-breaker
│   ├── utils/
│   │   └── index.ts                # generateSlug, formatDate, formatDateTime,
│   │                               # truncateText, classNames/cn
│   └── store.ts                    # Zustand store (auth admin berita)
├── types/
│   ├── index.ts                    # User, Category, Article, Media types (berita)
│   └── pasanggiri.ts               # User, Competition, Score, ActivityLog,
│                                   # SCORING_CRITERIA, GOLONGAN_LIST, KATEGORI_LIST
└── middleware.ts                   # Route protection: /admin (JWT), /absensi, /pasanggiri (session)
```

---

## 🔒 Autentikasi

| Modul | Cookie | Login Field | Metode |
|-------|--------|-------------|--------|
| Admin Berita | `admin_token` | email | JWT via `jose`, diverifikasi di middleware |
| Absensi | `absensi_session` | username | JSON session di cookie |
| Pasanggiri | `pasanggiri_session` | username | JSON session di cookie |

Semua route dilindungi oleh `middleware.ts` dengan matcher `/admin/:path*`, `/absensi/:path*`, `/pasanggiri/:path*`.

> ⚠️ **Catatan Keamanan:** Password semua modul saat ini disimpan dan dibandingkan sebagai plain text. Disarankan menggunakan hashing (bcrypt) sebelum go-live ke produksi.

---

## 🧮 Sistem Penilaian Pasanggiri

Menggunakan metode **middle-3** (buang nilai tertinggi dan terendah dari 5 juri):

| Jumlah Juri | Metode |
|-------------|--------|
| 5 juri | Buang tertinggi & terendah, jumlah 3 tengah |
| 4 juri | Buang tertinggi, jumlah 3 terendah |
| 3 juri | Jumlah semua |
| < 3 juri | Jumlah semua yang ada |

Ranking tampil real-time segera setelah ada nilai dari juri (tidak perlu menunggu status COMPLETED).

Tie-breaker per kategori berdasarkan prioritas kriteria:
- **PERORANGAN:** ORISINALITAS → KEMANTAPAN → STAMINA
- **ATT:** ORISINALITAS → KEMANTAPAN → KEKAYAAAN TEKNIK
- **BERKELOMPOK:** ORISINALITAS → KEMANTAPAN → KEKOMPAKAN
- **MASAL:** ORISINALITAS → KEMANTAPAN → KEKOMPAKAN → KREATIFITAS
- **BERPASANGAN:** TEKNIK SERANG BELA → KEMANTAPAN → PENGHAYATAN

---

## 🧪 Scripts

```bash
npm run dev      # Development server
npm run build    # Build production
npm run start    # Start production server
npm run lint     # Linting
```
