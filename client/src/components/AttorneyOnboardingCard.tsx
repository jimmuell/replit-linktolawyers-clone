import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AdminCard from './AdminCard';

interface Attorney {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function AttorneyOnboardingCard() {
  const { data: attorneys = [], isLoading, error } = useQuery({
    queryKey: ['/api/attorneys'],
  });

  const totalAttorneys = attorneys.length;
  const activeAttorneys = attorneys.filter((attorney: Attorney) => attorney.isActive).length;
  const verifiedAttorneys = attorneys.filter((attorney: Attorney) => attorney.isVerified).length;
  const pendingVerification = attorneys.filter((attorney: Attorney) => !attorney.isVerified).length;

  return (
    <AdminCard
      title="Attorney Onboarding"
      description="Manage attorney profiles and verification"
      icon={UserPlus}
      iconColor="text-purple-600"
      route="/attorney-onboarding"
      isLoading={isLoading}
      error={error}
      actionText="Manage"
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserPlus className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalAttorneys}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">Verified</span>
          </div>
          <div className="text-lg font-semibold text-green-900">{verifiedAttorneys}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-600">Pending</span>
          </div>
          <div className="text-lg font-semibold text-yellow-900">{pendingVerification}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Status Overview:</div>
        <p className="text-sm font-medium">
          {pendingVerification > 0 ? `${pendingVerification} attorneys pending verification` : 'All attorneys verified and active'}
        </p>
      </div>
    </AdminCard>
  );
}