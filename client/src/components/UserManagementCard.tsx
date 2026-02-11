import { useQuery } from '@tanstack/react-query';
import { Users, ShieldCheck, UserCog, UserCircle } from 'lucide-react';
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
  const clientCount = users.filter(u => u.role === 'client').length;

  return (
    <AdminCard
      title="User Management"
      description="Manage users, roles, and credentials"
      icon={Users}
      iconColor="text-emerald-600"
      route="/admin/users"
      isLoading={isLoading}
      error={null}
      actionText="Manage"
    >
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Admins</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{adminCount}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserCog className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Attorneys</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{attorneyCount}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Clients</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{clientCount}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Quick Status:</div>
        <div className="text-sm text-gray-600">
          {users.length} total user{users.length !== 1 ? 's' : ''} registered
        </div>
      </div>
    </AdminCard>
  );
}
