import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import AdminCard from './AdminCard';

interface UserData {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string | null;
}

export default function UserManagementCard() {
  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ['/api/admin/users'],
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const attorneyCount = users.filter(u => u.role === 'attorney').length;
  const totalCount = users.length;

  return (
    <AdminCard
      title="Users"
      description="Manage administrators and user credentials"
      icon={Users}
      iconColor="text-blue-600"
      route="/admin/users"
      isLoading={isLoading}
      error={null}
      actionText="Manage"
    >
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-500">Total Users</span>
        </div>
        <div className="text-2xl font-semibold text-gray-900">{totalCount}</div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Admins</span>
          <span className="font-medium">{adminCount}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Attorneys</span>
          <span className="font-medium">{attorneyCount}</span>
        </div>
      </div>
    </AdminCard>
  );
}
