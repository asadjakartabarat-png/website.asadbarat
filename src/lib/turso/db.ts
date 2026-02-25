import { turso } from './client';
import { Article, Category, User } from '@/types';

// ─── ARTICLES ────────────────────────────────────────────────────────────────

export async function getPublishedArticles(limit = 12): Promise<Article[]> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.status = 'published'
          ORDER BY a.published_at DESC LIMIT ?`,
    args: [limit],
  });
  return result.rows.map(mapArticleRow);
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.status = 'published'
          ORDER BY a.published_at DESC LIMIT 1`,
    args: [],
  });
  if (result.rows.length === 0) return null;
  return mapArticleRow(result.rows[0]);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.slug = ? AND a.status = 'published'`,
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return mapArticleRow(result.rows[0]);
}

export async function getArticleById(id: string): Promise<Article | null> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return mapArticleRow(result.rows[0]);
}

export async function getRelatedArticles(categoryId: string, excludeId: string): Promise<Article[]> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.category_id = ? AND a.status = 'published' AND a.id != ?
          ORDER BY a.published_at DESC LIMIT 3`,
    args: [categoryId, excludeId],
  });
  return result.rows.map(mapArticleRow);
}

export async function getArticlesByCategorySlug(slug: string, limit = 5): Promise<Article[]> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE c.slug = ? AND a.status = 'published'
          ORDER BY a.published_at DESC LIMIT ?`,
    args: [slug, limit],
  });
  return result.rows.map(mapArticleRow);
}

export async function getArticlesByCategoryId(categoryId: string): Promise<Article[]> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.category_id = ? AND a.status = 'published'
          ORDER BY a.published_at DESC`,
    args: [categoryId],
  });
  return result.rows.map(mapArticleRow);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          WHERE a.status = 'published' AND (a.title LIKE ? OR a.excerpt LIKE ?)
          ORDER BY a.published_at DESC`,
    args: [`%${query}%`, `%${query}%`],
  });
  return result.rows.map(mapArticleRow);
}

export async function getAllArticlesAdmin(): Promise<Article[]> {
  const result = await turso.execute({
    sql: `SELECT a.*, c.name as category_name, c.slug as category_slug,
          u.full_name as author_name
          FROM articles a
          LEFT JOIN categories c ON a.category_id = c.id
          LEFT JOIN users u ON a.author_id = u.id
          ORDER BY a.created_at DESC`,
    args: [],
  });
  return result.rows.map(mapArticleRow);
}

export async function createArticle(data: {
  id: string; title: string; slug: string; content: string; excerpt: string;
  featured_image?: string; category_id: string; author_id: string;
  status: string; published_at?: string; meta_title?: string; meta_description?: string;
}) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO articles (id, title, slug, content, excerpt, featured_image, category_id, author_id, status, published_at, meta_title, meta_description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [data.id, data.title, data.slug, data.content, data.excerpt,
           data.featured_image || null, data.category_id, data.author_id,
           data.status, data.published_at || null, data.meta_title || null,
           data.meta_description || null, now, now],
  });
}

export async function updateArticle(id: string, data: {
  title?: string; content?: string; excerpt?: string; featured_image?: string;
  category_id?: string; status?: string; published_at?: string;
  meta_title?: string; meta_description?: string;
}) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `UPDATE articles SET title=?, content=?, excerpt=?, featured_image=?,
          category_id=?, status=?, published_at=?, meta_title=?, meta_description=?, updated_at=?
          WHERE id=?`,
    args: [data.title!, data.content!, data.excerpt!, data.featured_image || null,
           data.category_id!, data.status!, data.published_at || null,
           data.meta_title || null, data.meta_description || null, now, id],
  });
}

export async function deleteArticle(id: string) {
  await turso.execute({ sql: `DELETE FROM articles WHERE id = ?`, args: [id] });
}

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM categories ORDER BY name`,
    args: [],
  });
  return result.rows.map(mapCategoryRow);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM categories WHERE slug = ?`,
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return mapCategoryRow(result.rows[0]);
}

export async function createCategory(data: { id: string; name: string; slug: string; description?: string }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO categories (id, name, slug, description, created_at) VALUES (?, ?, ?, ?, ?)`,
    args: [data.id, data.name, data.slug, data.description || null, now],
  });
}

export async function updateCategory(id: string, data: { name?: string; description?: string }) {
  await turso.execute({
    sql: `UPDATE categories SET name=?, description=? WHERE id=?`,
    args: [data.name!, data.description || null, id],
  });
}

export async function deleteCategory(id: string) {
  await turso.execute({ sql: `DELETE FROM categories WHERE id = ?`, args: [id] });
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const result = await turso.execute({
    sql: `SELECT * FROM users ORDER BY created_at DESC`,
    args: [],
  });
  return result.rows.map(mapUserRow);
}

export async function getUserByUsername(username: string): Promise<(User & { password: string }) | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM users WHERE email = ?`,
    args: [username],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { ...mapUserRow(row), password: row.password as string };
}

export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM users WHERE email = ?`,
    args: [email],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...mapUserRow(row),
    password: row.password as string,
  };
}

export async function createUser(data: { id: string; email: string; password: string; full_name: string; role: string }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [data.id, data.email, data.password, data.full_name, data.role, now, now],
  });
}

export async function deleteUser(id: string) {
  await turso.execute({ sql: `DELETE FROM users WHERE id = ?`, args: [id] });
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await turso.execute({
    sql: `SELECT * FROM users WHERE id = ?`,
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return mapUserRow(result.rows[0]);
}

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export async function createMessage(data: { id: string; name: string; email: string; message: string }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO messages (id, name, email, message, is_read, created_at) VALUES (?, ?, ?, ?, 0, ?)`,
    args: [data.id, data.name, data.email, data.message, now],
  });
}

export async function getAllMessages() {
  const result = await turso.execute({
    sql: `SELECT * FROM messages ORDER BY created_at DESC`,
    args: [],
  });
  return result.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    message: r.message as string,
    is_read: Boolean(r.is_read),
    created_at: r.created_at as string,
  }));
}

export async function markMessageRead(id: string) {
  await turso.execute({ sql: `UPDATE messages SET is_read = 1 WHERE id = ?`, args: [id] });
}

export async function deleteMessage(id: string) {
  await turso.execute({ sql: `DELETE FROM messages WHERE id = ?`, args: [id] });
}

export async function getUnreadMessageCount(): Promise<number> {
  const result = await turso.execute({ sql: `SELECT COUNT(*) as count FROM messages WHERE is_read = 0`, args: [] });
  return Number(result.rows[0].count);
}

// ─── SUBSCRIBERS ─────────────────────────────────────────────────────────────

export async function createSubscriber(data: { id: string; email: string }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO subscribers (id, email, created_at) VALUES (?, ?, ?)`,
    args: [data.id, data.email, now],
  });
}

export async function getAllSubscribers() {
  const result = await turso.execute({
    sql: `SELECT * FROM subscribers ORDER BY created_at DESC`,
    args: [],
  });
  return result.rows.map(r => ({
    id: r.id as string,
    email: r.email as string,
    created_at: r.created_at as string,
  }));
}

export async function deleteSubscriber(id: string) {
  await turso.execute({ sql: `DELETE FROM subscribers WHERE id = ?`, args: [id] });
}

export async function getSubscriberCount(): Promise<number> {
  const result = await turso.execute({ sql: `SELECT COUNT(*) as count FROM subscribers`, args: [] });
  return Number(result.rows[0].count);
}

// ─── STATS ───────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const [articles, published, categories, users] = await Promise.all([
    turso.execute({ sql: `SELECT COUNT(*) as count FROM articles`, args: [] }),
    turso.execute({ sql: `SELECT COUNT(*) as count FROM articles WHERE status='published'`, args: [] }),
    turso.execute({ sql: `SELECT COUNT(*) as count FROM categories`, args: [] }),
    turso.execute({ sql: `SELECT COUNT(*) as count FROM users`, args: [] }),
  ]);
  return {
    totalArticles: Number(articles.rows[0].count),
    publishedArticles: Number(published.rows[0].count),
    totalCategories: Number(categories.rows[0].count),
    totalUsers: Number(users.rows[0].count),
  };
}

// ─── ABSENSI USERS ──────────────────────────────────────────────────────────

export async function getAbsensiUserByUsername(username: string) {
  const result = await turso.execute({ sql: `SELECT * FROM absensi_users WHERE username = ? AND is_active = 1`, args: [username] });
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

export async function getAllAbsensiUsers() {
  const result = await turso.execute({ sql: `SELECT au.*, ad.nama_desa FROM absensi_users au LEFT JOIN absensi_desa ad ON au.desa_id = ad.id ORDER BY au.created_at DESC`, args: [] });
  return result.rows;
}

export async function createAbsensiUser(data: { username: string; password: string; full_name: string; role: string; desa_id?: number | null }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO absensi_users (username, password, full_name, role, desa_id, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    args: [data.username, data.password, data.full_name, data.role, data.desa_id ?? null, now, now],
  });
}

export async function updateAbsensiUser(id: number, data: { username?: string; password?: string; full_name?: string; role?: string; desa_id?: number | null; is_active?: number }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `UPDATE absensi_users SET username=?, full_name=?, role=?, desa_id=?, is_active=?, updated_at=? WHERE id=?`,
    args: [data.username!, data.full_name!, data.role!, data.desa_id ?? null, data.is_active ?? 1, now, id],
  });
}

export async function deleteAbsensiUser(id: number) {
  await turso.execute({ sql: `DELETE FROM absensi_users WHERE id = ?`, args: [id] });
}

// ─── ABSENSI DESA ────────────────────────────────────────────────────────────

export async function getAllDesa() {
  const result = await turso.execute({ sql: `SELECT * FROM absensi_desa ORDER BY nama_desa`, args: [] });
  return result.rows;
}

export async function createDesa(nama_desa: string) {
  const now = new Date().toISOString();
  await turso.execute({ sql: `INSERT INTO absensi_desa (nama_desa, created_at) VALUES (?, ?)`, args: [nama_desa, now] });
}

export async function updateDesa(id: number, nama_desa: string) {
  await turso.execute({ sql: `UPDATE absensi_desa SET nama_desa = ? WHERE id = ?`, args: [nama_desa, id] });
}

export async function deleteDesa(id: number) {
  await turso.execute({ sql: `DELETE FROM absensi_desa WHERE id = ?`, args: [id] });
}

// ─── ABSENSI KELOMPOK ────────────────────────────────────────────────────────

export async function getAllKelompok(desaId?: number) {
  if (desaId) {
    const result = await turso.execute({ sql: `SELECT ak.*, ad.nama_desa FROM absensi_kelompok ak JOIN absensi_desa ad ON ak.desa_id = ad.id WHERE ak.desa_id = ? ORDER BY ak.nama_kelompok`, args: [desaId] });
    return result.rows;
  }
  const result = await turso.execute({ sql: `SELECT ak.*, ad.nama_desa FROM absensi_kelompok ak JOIN absensi_desa ad ON ak.desa_id = ad.id ORDER BY ad.nama_desa, ak.nama_kelompok`, args: [] });
  return result.rows;
}

export async function createKelompok(data: { desa_id: number; nama_kelompok: string; target_putra: number; target_putri: number }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO absensi_kelompok (desa_id, nama_kelompok, target_putra, target_putri, created_at) VALUES (?, ?, ?, ?, ?)`,
    args: [data.desa_id, data.nama_kelompok, data.target_putra, data.target_putri, now],
  });
}

export async function updateKelompok(id: number, data: { nama_kelompok?: string; target_putra?: number; target_putri?: number }) {
  await turso.execute({
    sql: `UPDATE absensi_kelompok SET nama_kelompok=?, target_putra=?, target_putri=? WHERE id=?`,
    args: [data.nama_kelompok!, data.target_putra!, data.target_putri!, id],
  });
}

export async function deleteKelompok(id: number) {
  await turso.execute({ sql: `DELETE FROM absensi_kelompok WHERE id = ?`, args: [id] });
}

// ─── ABSENSI DATA ────────────────────────────────────────────────────────────

export async function getAbsensiData(bulan: number, tahun: number, desaId?: number) {
  if (desaId) {
    const result = await turso.execute({
      sql: `SELECT ad.*, ak.nama_kelompok, ak.target_putra, ak.target_putri, ades.nama_desa
            FROM absensi_data ad
            JOIN absensi_kelompok ak ON ad.kelompok_id = ak.id
            JOIN absensi_desa ades ON ak.desa_id = ades.id
            WHERE ad.bulan = ? AND ad.tahun = ? AND ak.desa_id = ?`,
      args: [bulan, tahun, desaId],
    });
    return result.rows;
  }
  const result = await turso.execute({
    sql: `SELECT ad.*, ak.nama_kelompok, ak.target_putra, ak.target_putri, ades.nama_desa
          FROM absensi_data ad
          JOIN absensi_kelompok ak ON ad.kelompok_id = ak.id
          JOIN absensi_desa ades ON ak.desa_id = ades.id
          WHERE ad.bulan = ? AND ad.tahun = ?`,
    args: [bulan, tahun],
  });
  return result.rows;
}

export async function upsertAbsensiData(data: { kelompok_id: number; bulan: number; tahun: number; hadir_putra: number; hadir_putri: number; input_by: number }) {
  const now = new Date().toISOString();
  await turso.execute({
    sql: `INSERT INTO absensi_data (kelompok_id, bulan, tahun, hadir_putra, hadir_putri, input_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(kelompok_id, bulan, tahun) DO UPDATE SET hadir_putra=excluded.hadir_putra, hadir_putri=excluded.hadir_putri, input_by=excluded.input_by, updated_at=excluded.updated_at`,
    args: [data.kelompok_id, data.bulan, data.tahun, data.hadir_putra, data.hadir_putri, data.input_by, now, now],
  });
}

// ─── ABSENSI LAPORAN ─────────────────────────────────────────────────────────

export async function getLaporanPerDesa(bulan: number, tahun: number) {
  const result = await turso.execute({
    sql: `SELECT ades.nama_desa,
            COUNT(ak.id) as total_kelompok,
            SUM(ak.target_putra) as total_target_putra,
            COALESCE(SUM(ad.hadir_putra), 0) as total_hadir_putra,
            SUM(ak.target_putri) as total_target_putri,
            COALESCE(SUM(ad.hadir_putri), 0) as total_hadir_putri
          FROM absensi_desa ades
          JOIN absensi_kelompok ak ON ak.desa_id = ades.id
          LEFT JOIN absensi_data ad ON ad.kelompok_id = ak.id AND ad.bulan = ? AND ad.tahun = ?
          GROUP BY ades.id, ades.nama_desa
          ORDER BY ades.nama_desa`,
    args: [bulan, tahun],
  });
  return result.rows;
}

export async function getLaporanDetailDesa(desaName: string, bulan: number, tahun: number) {
  const result = await turso.execute({
    sql: `SELECT ak.nama_kelompok,
            ak.target_putra, ak.target_putri,
            COALESCE(ad.hadir_putra, 0) as hadir_putra,
            COALESCE(ad.hadir_putri, 0) as hadir_putri
          FROM absensi_kelompok ak
          JOIN absensi_desa ades ON ak.desa_id = ades.id
          LEFT JOIN absensi_data ad ON ad.kelompok_id = ak.id AND ad.bulan = ? AND ad.tahun = ?
          WHERE ades.nama_desa = ?
          ORDER BY ak.nama_kelompok`,
    args: [bulan, tahun, desaName],
  });
  return result.rows;
}

export async function getLaporanDKI(tahun: number) {
  const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const result = await turso.execute({
    sql: `SELECT ad.bulan,
            SUM(ak.target_putra) as total_target_putra,
            SUM(ad.hadir_putra) as total_hadir_putra,
            SUM(ak.target_putri) as total_target_putri,
            SUM(ad.hadir_putri) as total_hadir_putri
          FROM absensi_data ad
          JOIN absensi_kelompok ak ON ad.kelompok_id = ak.id
          WHERE ad.tahun = ?
          GROUP BY ad.bulan
          ORDER BY ad.bulan`,
    args: [tahun],
  });
  return result.rows.map(r => ({
    bulan: Number(r.bulan),
    nama_bulan: BULAN[Number(r.bulan) - 1],
    total_target_putra: Number(r.total_target_putra),
    total_hadir_putra: Number(r.total_hadir_putra),
    total_target_putri: Number(r.total_target_putri),
    total_hadir_putri: Number(r.total_hadir_putri),
    persentase_putra: Number(r.total_target_putra) > 0 ? Math.round((Number(r.total_hadir_putra) / Number(r.total_target_putra)) * 1000) / 10 : 0,
    persentase_putri: Number(r.total_target_putri) > 0 ? Math.round((Number(r.total_hadir_putri) / Number(r.total_target_putri)) * 1000) / 10 : 0,
  }));
}

// ─── MAPPERS ─────────────────────────────────────────────────────────────────

function mapArticleRow(row: any): Article {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    content: row.content as string,
    excerpt: row.excerpt as string,
    featured_image: row.featured_image as string | undefined,
    category_id: row.category_id as string,
    author_id: row.author_id as string,
    status: row.status as 'draft' | 'published' | 'scheduled',
    published_at: row.published_at as string | undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    meta_title: row.meta_title as string | undefined,
    meta_description: row.meta_description as string | undefined,
    categories: row.category_name ? { id: row.category_id as string, name: row.category_name as string, slug: row.category_slug as string, created_at: '' } : undefined,
    users: row.author_name ? { id: row.author_id as string, full_name: row.author_name as string, email: '', role: 'writer', created_at: '', updated_at: '' } : undefined,
  };
}

function mapCategoryRow(row: any): Category {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    description: row.description as string | undefined,
    created_at: row.created_at as string,
  };
}

function mapUserRow(row: any): User {
  return {
    id: row.id as string,
    email: row.email as string,
    full_name: row.full_name as string,
    role: row.role as 'super_admin' | 'editor' | 'writer',
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
