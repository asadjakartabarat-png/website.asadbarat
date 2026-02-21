import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media</h1>
        <p className="text-gray-600">Kelola file media</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Fitur media library akan segera hadir</p>
            <p className="text-sm text-gray-400">
              Sementara ini, Anda dapat menggunakan URL gambar eksternal di form artikel
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}