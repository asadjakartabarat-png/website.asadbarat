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
