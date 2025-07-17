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
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{requestsInfo.count}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{requestsInfo.recentCount}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Activity</span>
          </div>
          <Badge variant="outline">
            {requestsInfo.recentCount > 0 ? 'Active' : 'Quiet'}
          </Badge>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Recent Activity</div>
          <p className="text-sm font-medium">{requestsInfo.description}</p>
        </div>
      </div>
    </AdminCard>
  );
}