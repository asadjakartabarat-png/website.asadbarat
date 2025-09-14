import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Kategori Baru</h1>
        <p className="text-gray-600">Buat kategori berita baru</p>
      </div>

      <CategoryForm />
    </div>
  );
}