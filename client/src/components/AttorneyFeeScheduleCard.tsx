import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ChevronRight, TrendingUp, Users, Calculator } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

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
  const [, setLocation] = useLocation();

  const { data: feeSchedules = [] } = useQuery({
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
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Fee Schedule
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </CardTitle>
        <CardDescription>
          Manage attorney fees for different case types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Active Fee Schedules</span>
            </div>
            <p className="text-2xl font-bold">{activeFeeSchedules.length}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Attorneys with Fees</span>
            </div>
            <p className="text-2xl font-bold">
              {attorneysWithFees}
              <span className="text-sm text-gray-500 ml-1">/ {totalAttorneys}</span>
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Average Fee</span>
          </div>
          <p className="text-xl font-semibold text-green-600">
            {formatCurrency(averageFee)}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {activeFeeSchedules.length} Active
            </Badge>
            {feeSchedules.length - activeFeeSchedules.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {feeSchedules.length - activeFeeSchedules.length} Inactive
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/attorney-fee-schedule')}
            className="text-xs"
          >
            Manage Fees
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}