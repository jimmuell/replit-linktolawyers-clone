import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { FileText, TrendingUp } from 'lucide-react';
import AdminCard from './AdminCard';

interface StructuredIntake {
  id: number;
  createdAt: string;
  caseType: string;
}

export default function SubmissionsCard() {
  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: StructuredIntake[] }>({
    queryKey: ['/api/structured-intakes'],
    enabled: true,
    retry: false,
  });

  const intakes = response?.data || [];

  const getSubmissionsInfo = () => {
    if (!intakes || intakes.length === 0) {
      return {
        count: 0,
        recentCount: 0,
        description: 'No submissions found',
      };
    }

    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSubmissions = intakes.filter((intake: StructuredIntake) => {
      const createdAt = new Date(intake.createdAt);
      return createdAt >= last7Days;
    });

    return {
      count: intakes.length,
      recentCount: recentSubmissions.length,
      description: `${recentSubmissions.length} new submission${recentSubmissions.length !== 1 ? 's' : ''} this week`,
    };
  };

  const submissionsInfo = getSubmissionsInfo();

  return (
    <AdminCard
      title="Submissions"
      description="View and manage form submissions"
      icon={FileText}
      iconColor="text-cyan-600"
      route="/submissions"
      isLoading={isLoading}
      error={error}
      actionText="View All"
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{submissionsInfo.count}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <span className="text-xs text-cyan-600">This Week</span>
          </div>
          <div className="text-lg font-semibold text-cyan-900">{submissionsInfo.recentCount}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Badge variant="outline" className="text-xs">
              {submissionsInfo.recentCount > 0 ? 'Active' : 'Quiet'}
            </Badge>
          </div>
          <div className="text-lg font-semibold text-gray-900">Status</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Recent Activity:</div>
        <p className="text-sm font-medium">{submissionsInfo.description}</p>
      </div>
    </AdminCard>
  );
}
