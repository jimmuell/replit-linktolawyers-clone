import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Clock } from 'lucide-react';

interface MyReferral {
  assignmentId: number;
  assignmentStatus: string;
  assignedAt: string;
  notes: string;
  quoteStatus?: string;
  quoteId?: number;
  request: {
    id: number;
    requestNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    caseType: string;
    caseDescription: string;
    location: string;
    status: string;
    createdAt: string;
  };
}

interface MyReferralsListProps {
  filterStatus?: string;
  title?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export default function MyReferralsList({ filterStatus, title, emptyMessage, emptySubMessage }: MyReferralsListProps) {
  const [, navigate] = useLocation();

  const { data: referralsData, isLoading } = useQuery({
    queryKey: ['/api/attorney-referrals/my-referrals'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/my-referrals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch my referrals');
      }
      return response.json();
    },
    retry: false,
  });

  const allReferrals = referralsData?.data || [];

  const { data: casesData } = useQuery({
    queryKey: ['/api/attorney-referrals/cases'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/cases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) {
        return { data: [] };
      }
      return response.json();
    },
    retry: false,
  });

  const activeCases = casesData?.data || [];
  const activeCaseQuoteIds = new Set(activeCases.map((c: any) => c.quoteId || c.quote_id));

  const referrals = allReferrals.filter((referral: MyReferral) => {
    const hasActiveCase = activeCaseQuoteIds.size > 0 && referral.quoteId && activeCaseQuoteIds.has(referral.quoteId);

    if (!filterStatus) {
      return referral.assignmentStatus !== 'accepted' && referral.assignmentStatus !== 'quoted' && referral.assignmentStatus !== 'rejected';
    }

    if (filterStatus === 'accepted') {
      return referral.assignmentStatus === 'accepted' && !hasActiveCase;
    }

    if (filterStatus === 'quoted') {
      return referral.assignmentStatus === 'quoted';
    }

    if (filterStatus === 'all_quotes') {
      return (referral.assignmentStatus === 'quoted' || referral.assignmentStatus === 'accepted') && !hasActiveCase;
    }

    return referral.assignmentStatus === filterStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'assigned': return 'secondary';
      case 'under_review': return 'default';
      case 'info_requested': return 'outline';
      case 'ready_to_quote': return 'default';
      case 'quoted': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title || 'My Assigned Referrals'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title || 'My Assigned Referrals'}
          <Badge variant="outline">{referrals.length} {referrals.length === 1 ? 'record' : 'records'}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{emptyMessage || 'No assigned referrals yet.'}</p>
            <p className="text-sm">{emptySubMessage || 'Check the available referrals to assign cases to yourself.'}</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral: MyReferral) => (
                  <TableRow key={referral.assignmentId}>
                    <TableCell className="font-medium">
                      {referral.request.requestNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referral.request.firstName} {referral.request.lastName}</div>
                        <div className="text-sm text-gray-500">{referral.request.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={referral.request.caseType}>
                        {referral.request.caseType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(referral.assignmentStatus)}>
                        {referral.assignmentStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(referral.assignedAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/attorney/referral/${referral.assignmentId}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
