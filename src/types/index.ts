export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'editor' | 'writer';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category_id: string;
  author_id: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
  category?: Category;
  author?: User;
}

export interface Media {
  id: string;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface CreateArticleData {
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  category_id: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateArticleData extends Partial<CreateArticleData> {
  id: string;
}