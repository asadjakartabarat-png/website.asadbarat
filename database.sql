-- ============================================================
-- TURSO DATABASE SETUP - Website Berita Asad Jakbar
-- Jalankan script ini di Turso Web Console
-- https://app.turso.tech → pilih database → Shell
-- ============================================================

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor', 'writer')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Tabel categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

-- Tabel articles
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  featured_image TEXT,
  category_id TEXT NOT NULL REFERENCES categories(id),
  author_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================================
-- DATA AWAL
-- ============================================================

-- Admin user (password: admin123)
-- GANTI password setelah pertama login!
INSERT OR IGNORE INTO users (id, email, password, full_name, role, created_at, updated_at)
VALUES (
  'usr_' || lower(hex(randomblob(8))),
  'admin@asadjakbar.com',
  'admin123',
  'Admin Asad Jakbar',
  'super_admin',
  datetime('now'),
  datetime('now')
);

-- Kategori default
INSERT OR IGNORE INTO categories (id, name, slug, description, created_at) VALUES
  ('cat_politik',    'Politik',    'politik',    'Berita seputar politik dan pemerintahan', datetime('now')),
  ('cat_ekonomi',   'Ekonomi',    'ekonomi',    'Berita seputar ekonomi dan bisnis',       datetime('now')),
  ('cat_hukum',     'Hukum',      'hukum',      'Berita seputar hukum dan keadilan',       datetime('now')),
  ('cat_olahraga',  'Olahraga',   'olahraga',   'Berita seputar olahraga',                 datetime('now')),
  ('cat_teknologi', 'Teknologi',  'teknologi',  'Berita seputar teknologi dan inovasi',    datetime('now'));

-- ============================================================
-- VERIFIKASI (jalankan setelah insert di atas)
-- ============================================================
-- SELECT * FROM users;
-- SELECT * FROM categories;

-- ============================================================
-- TABEL MESSAGES (jalankan jika belum ada)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- ============================================================
-- TABEL SUBSCRIBERS (jalankan jika belum ada)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL
);
