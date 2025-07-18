import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { FileText, TrendingUp } from 'lucide-react';
import AdminCard from './AdminCard';

export default function RequestManagementCard() {
  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['/api/legal-requests'],
    enabled: true,
    retry: false,
  });

  const getRequestsInfo = () => {
    if (!requests || !Array.isArray(requests)) {
      return {
        count: 0,
        recentCount: 0,
        description: 'No requests found',
      };
    }

    const today = new Date();
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentRequests = requests.filter(request => {
      const createdAt = new Date(request.createdAt);
      return createdAt >= last7Days;
    });

    return {
      count: requests.length,
      recentCount: recentRequests.length,
      description: `${recentRequests.length} new requests this week`,
    };
  };

  const requestsInfo = getRequestsInfo();

  return (
    <AdminCard
      title="Request Management"
      description="Legal service requests and tracking"
      icon={FileText}
      iconColor="text-green-600"
      route="/request-management"
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
          <div className="text-lg font-semibold text-gray-900">{requestsInfo.count}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">This Week</span>
          </div>
          <div className="text-lg font-semibold text-green-900">{requestsInfo.recentCount}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Badge variant="outline" className="text-xs">
              {requestsInfo.recentCount > 0 ? 'Active' : 'Quiet'}
            </Badge>
          </div>
          <div className="text-lg font-semibold text-gray-900">Status</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Recent Activity:</div>
        <p className="text-sm font-medium">{requestsInfo.description}</p>
      </div>
    </AdminCard>
  );
}