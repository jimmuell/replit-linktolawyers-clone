import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { FileText, Users, Eye, Plus } from 'lucide-react';
import { useLocation } from 'wouter';

export default function RequestManagementCard() {
  const [, navigate] = useLocation();

  // Fetch legal requests count
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/legal-requests'],
    enabled: true,
    retry: false,
  });

  const handleManageClick = () => {
    navigate('/request-management');
  };

  const getRequestsInfo = () => {
    if (isLoading) {
      return {
        count: '...',
        recentCount: '...',
        description: 'Loading requests...',
      };
    }

    if (!requests || !Array.isArray(requests)) {
      return {
        count: '0',
        recentCount: '0',
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
      count: requests.length.toString(),
      recentCount: recentRequests.length.toString(),
      description: `${recentRequests.length} new requests this week`,
    };
  };

  const requestsInfo = getRequestsInfo();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Request Management
        </CardTitle>
        <Users className="w-5 h-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{requestsInfo.count}</div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">{requestsInfo.recentCount}</div>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {requestsInfo.description}
          </div>
          
          <Button 
            onClick={handleManageClick}
            className="w-full"
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage Requests
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}