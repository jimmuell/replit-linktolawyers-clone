import { Building2, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AdminCard from './AdminCard';

interface Organization {
  id: number;
  name: string;
  isActive: boolean | null;
}

export default function OrganizationsCard() {
  const { data: organizations = [], isLoading, error } = useQuery<Organization[]>({
    queryKey: ['/api/organizations'],
  });

  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter((org) => org.isActive !== false).length;

  return (
    <AdminCard
      title="Organizations"
      description="Manage law firms and organizations"
      icon={Building2}
      iconColor="text-indigo-600"
      route="/organizations"
      isLoading={isLoading}
      error={error}
      actionText="Manage"
    >
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalOrgs}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">Active</span>
          </div>
          <div className="text-lg font-semibold text-green-900">{activeOrgs}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Status Overview:</div>
        <p className="text-sm font-medium">
          {totalOrgs === 0
            ? 'No organizations yet'
            : `${activeOrgs} of ${totalOrgs} organizations active`}
        </p>
      </div>
    </AdminCard>
  );
}