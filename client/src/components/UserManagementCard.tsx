import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
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

  return (
    <AdminCard
      title="Admin Users"
      description="Manage administrator accounts and credentials"
      icon={ShieldCheck}
      iconColor="text-blue-600"
      route="/admin/users"
      isLoading={isLoading}
      error={null}
      actionText="Manage"
    >
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-1 mb-1">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-gray-500">Admin Accounts</span>
        </div>
        <div className="text-2xl font-semibold text-gray-900">{adminCount}</div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600">
          {adminCount} admin account{adminCount !== 1 ? 's' : ''} configured
        </div>
        <div className="text-xs text-gray-400">
          Attorney accounts are managed via Attorney Onboarding
        </div>
      </div>
    </AdminCard>
  );
}
