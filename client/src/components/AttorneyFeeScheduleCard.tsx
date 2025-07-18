import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import AdminCard from './AdminCard';

interface AttorneyFeeSchedule {
  id: number;
  attorneyId: number;
  caseTypeId: number;
  fee: number;
  feeType: string;
  isActive: boolean;
}

export default function AttorneyFeeScheduleCard() {
  const { user } = useAuth();

  const { data: feeSchedules = [], isLoading, error } = useQuery({
    queryKey: ['/api/attorney-fee-schedule'],
    enabled: user?.role === 'admin',
  });

  const { data: attorneys = [] } = useQuery({
    queryKey: ['/api/attorneys'],
    enabled: user?.role === 'admin',
  });

  const activeFeeSchedules = feeSchedules.filter((schedule: AttorneyFeeSchedule) => schedule.isActive);
  const uniqueAttorneys = new Set(feeSchedules.map((schedule: AttorneyFeeSchedule) => schedule.attorneyId));
  const attorneysWithFees = uniqueAttorneys.size;
  const totalAttorneys = attorneys.length;

  const averageFee = activeFeeSchedules.length > 0 
    ? activeFeeSchedules.reduce((sum: number, schedule: AttorneyFeeSchedule) => sum + schedule.fee, 0) / activeFeeSchedules.length
    : 0;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <AdminCard
      title="Fee Schedule"
      description="Manage attorney fees for different case types"
      icon={DollarSign}
      iconColor="text-orange-600"
      route="/attorney-fee-schedule"
      isLoading={isLoading}
      error={error}
      actionText="Manage Fees"
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Active</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{activeFeeSchedules.length}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">Attorneys</span>
          </div>
          <div className="text-lg font-semibold text-green-900">{attorneysWithFees}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600">Average</span>
          </div>
          <div className="text-lg font-semibold text-orange-900">{formatCurrency(averageFee)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Coverage:</div>
        <p className="text-sm font-medium">
          {attorneysWithFees} of {totalAttorneys} attorneys have fee schedules
        </p>
      </div>
    </AdminCard>
  );
}