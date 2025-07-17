import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp } from 'lucide-react';
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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{activeFeeSchedules.length}</div>
            <div className="text-sm text-gray-600">Active Schedules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{attorneysWithFees}</div>
            <div className="text-sm text-gray-600">Attorneys with Fees</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Average Fee</span>
          </div>
          <Badge variant="outline">
            {formatCurrency(averageFee)}
          </Badge>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Coverage</div>
          <p className="text-sm font-medium">
            {attorneysWithFees} of {totalAttorneys} attorneys have fee schedules
          </p>
        </div>
      </div>
    </AdminCard>
  );
}