export const dynamic = 'force-dynamic';
import { getAllUsers } from '@/lib/turso/db';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import AddUserButton from '@/components/admin/AddUserButton';
import DeleteUserButton from '@/components/admin/DeleteUserButton';

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Kelola pengguna sistem</p>
        </div>
        <AddUserButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Nama</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal Daftar</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{user.full_name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-xs px-2 py-1 rounded capitalize font-medium ${
                          user.role === 'super_admin' ? 'bg-red-100 text-red-800'
                          : user.role === 'editor' ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-4">
                        <DeleteUserButton userId={user.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Belum ada users</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
