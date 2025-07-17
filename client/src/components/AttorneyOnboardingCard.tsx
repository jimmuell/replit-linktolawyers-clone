import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle } from 'lucide-react';
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalAttorneys}</div>
            <div className="text-sm text-gray-600">Total Attorneys</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{activeAttorneys}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Verified</span>
          </div>
          <Badge variant="outline">
            {verifiedAttorneys}/{totalAttorneys}
          </Badge>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Pending Verification</div>
          <p className="text-sm font-medium">
            {pendingVerification > 0 ? `${pendingVerification} attorneys pending` : 'All attorneys verified'}
          </p>
        </div>
      </div>
    </AdminCard>
  );
}