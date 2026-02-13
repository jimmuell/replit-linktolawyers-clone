import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Clock, DollarSign, Users, MessageSquare, FileText, CheckCircle, Building2 } from 'lucide-react';
import AttorneyAppBar from '@/components/AttorneyAppBar';
import SubmissionsList from '@/components/SubmissionsList';
import MyReferralsList from '@/components/MyReferralsList';
import ActiveCasesList from '@/components/ActiveCasesList';

interface ReferralData {
  assignmentId: number;
  assignmentStatus: string;
  assignedAt: string;
  quoteStatus?: string;
  quoteId?: number;
  request: {
    id: number;
    requestNumber: string;
    firstName: string;
    lastName: string;
    caseType: string;
    createdAt: string;
  };
}

interface CaseData {
  caseId: number;
  caseNumber: string;
  caseStatus: string;
  startDate: string;
  serviceFee: number;
  request: {
    firstName: string;
    lastName: string;
    caseType: string;
  };
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

interface Organization {
  id: number;
  name: string;
}

export default function AttorneyDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [referralSubTab, setReferralSubTab] = useState<'available' | 'assigned'>('available');
  const [quotesSubTab, setQuotesSubTab] = useState<'pending' | 'accepted'>('pending');

  useEffect(() => {
    if (!loading && user && user.role !== 'attorney') {
      if (user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/';
      }
    }
  }, [user, loading]);

  const { data: orgData } = useQuery<Organization>({
    queryKey: ['/api/attorney/organization'],
    enabled: !!user && user.role === 'attorney',
  });

  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ['/api/attorney-referrals/my-referrals'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/my-referrals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) return { data: [] };
      return response.json();
    },
    retry: false,
    enabled: !!user && user.role === 'attorney',
  });

  const { data: casesData, isLoading: casesLoading } = useQuery({
    queryKey: ['/api/attorney-referrals/cases'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/cases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) return { data: [] };
      return response.json();
    },
    retry: false,
    enabled: !!user && user.role === 'attorney',
  });

  const { data: availableData } = useQuery({
    queryKey: ['/api/attorney-referrals/available'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) return { success: true, data: [] };
      return response.json();
    },
    retry: false,
    enabled: !!user && user.role === 'attorney',
  });

  const referrals: ReferralData[] = referralsData?.data || [];
  const cases: CaseData[] = casesData?.data || [];
  const availableCount = availableData?.data?.length || 0;

  const assignedReferrals = referrals.filter((r) => r.assignmentStatus !== 'accepted' && r.assignmentStatus !== 'rejected' && r.assignmentStatus !== 'quoted');
  const quotedReferrals = referrals.filter((r) => r.assignmentStatus === 'quoted');
  const acceptedQuotes = referrals.filter((r) => r.assignmentStatus === 'accepted');
  const activeCaseQuoteIds = new Set(cases.filter((c) => c.caseStatus === 'active').map((c: any) => c.quoteId || c.quote_id));
  const acceptedNotCased = acceptedQuotes.filter((r) => !r.quoteId || !activeCaseQuoteIds.has(r.quoteId));
  const allQuotesCount = quotedReferrals.length + acceptedNotCased.length;
  const activeCases = cases.filter((c) => c.caseStatus === 'active');
  const totalReferralsCount = availableCount + assignedReferrals.length;

  const recentActivities: Array<{ type: string; label: string; detail: string; date: string; color: string }> = [];

  referrals.forEach((r) => {
    if (r.assignmentStatus === 'assigned') {
      recentActivities.push({
        type: 'referral_assigned',
        label: 'Referral assigned',
        detail: `${r.request.firstName} ${r.request.lastName} - ${r.request.caseType}`,
        date: r.assignedAt,
        color: 'bg-blue-500',
      });
    }
    if (r.assignmentStatus === 'quoted') {
      recentActivities.push({
        type: 'quote_submitted',
        label: 'Quote submitted',
        detail: `${r.request.requestNumber} - ${r.request.caseType}`,
        date: r.assignedAt,
        color: 'bg-yellow-500',
      });
    }
    if (r.assignmentStatus === 'accepted') {
      recentActivities.push({
        type: 'quote_accepted',
        label: 'Quote accepted',
        detail: `${r.request.requestNumber}`,
        date: r.assignedAt,
        color: 'bg-green-500',
      });
    }
  });

  cases.forEach((c) => {
    recentActivities.push({
      type: 'case_started',
      label: `Case ${c.caseNumber} started`,
      detail: `${c.request.firstName} ${c.request.lastName} - ${c.request.caseType}`,
      date: c.startDate,
      color: 'bg-purple-500',
    });
  });

  recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const topActivities = recentActivities.slice(0, 5);

  const overviewLoading = referralsLoading || casesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'attorney') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AttorneyAppBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attorney Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-600">Manage your legal referrals and cases</p>
            {orgData?.name && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-3 h-3" />
                {orgData.name}
              </span>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals" className="gap-1.5">
              Referrals
              {totalReferralsCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{totalReferralsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-1.5">
              Quotes
              {allQuotesCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{allQuotesCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-1.5">
              Cases
              {activeCases.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{activeCases.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {overviewLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveTab('referrals'); setReferralSubTab('available'); }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Referrals</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{availableCount}</div>
                      <p className="text-xs text-muted-foreground">Ready for you to pick up</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveTab('referrals'); setReferralSubTab('assigned'); }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Referrals</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{assignedReferrals.length}</div>
                      <p className="text-xs text-muted-foreground">Currently assigned to you</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveTab('quotes'); setQuotesSubTab('pending'); }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Quotes</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{allQuotesCount}</div>
                      <p className="text-xs text-muted-foreground">{quotedReferrals.length} pending, {acceptedNotCased.length} accepted</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('cases')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeCases.length}</div>
                      <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topActivities.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No recent activity yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {topActivities.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{activity.label}</p>
                                <p className="text-xs text-gray-500 truncate">{activity.detail}</p>
                              </div>
                              <Badge variant="outline" className="whitespace-nowrap">{formatTimeAgo(activity.date)}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button className="w-full justify-start" onClick={() => { setActiveTab('referrals'); setReferralSubTab('available'); }}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          Browse Available Referrals
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => { setActiveTab('referrals'); setReferralSubTab('assigned'); }}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Review My Referrals
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => { setActiveTab('quotes'); setQuotesSubTab('pending'); }}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          View Quotes
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('cases')}>
                          <FileText className="mr-2 h-4 w-4" />
                          Manage Active Cases
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="referrals">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={referralSubTab === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReferralSubTab('available')}
                  className="gap-1.5"
                >
                  Available
                  {availableCount > 0 && (
                    <Badge variant={referralSubTab === 'available' ? 'outline' : 'secondary'} className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{availableCount}</Badge>
                  )}
                </Button>
                <Button
                  variant={referralSubTab === 'assigned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setReferralSubTab('assigned')}
                  className="gap-1.5"
                >
                  Assigned to Me
                  {assignedReferrals.length > 0 && (
                    <Badge variant={referralSubTab === 'assigned' ? 'outline' : 'secondary'} className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{assignedReferrals.length}</Badge>
                  )}
                </Button>
              </div>

              {referralSubTab === 'available' ? (
                <SubmissionsList 
                  title="Available Referrals"
                  showAssignButton={true}
                />
              ) : (
                <MyReferralsList 
                  title="My Assigned Referrals"
                  emptyMessage="No assigned referrals yet."
                  emptySubMessage="Check the Available tab to pick up new referrals."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="quotes">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={quotesSubTab === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuotesSubTab('pending')}
                  className="gap-1.5"
                >
                  Submitted
                  {quotedReferrals.length > 0 && (
                    <Badge variant={quotesSubTab === 'pending' ? 'outline' : 'secondary'} className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{quotedReferrals.length}</Badge>
                  )}
                </Button>
                <Button
                  variant={quotesSubTab === 'accepted' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuotesSubTab('accepted')}
                  className="gap-1.5"
                >
                  Accepted
                  {acceptedNotCased.length > 0 && (
                    <Badge variant={quotesSubTab === 'accepted' ? 'outline' : 'secondary'} className="ml-1 h-5 min-w-[20px] px-1.5 text-xs rounded-full">{acceptedNotCased.length}</Badge>
                  )}
                </Button>
              </div>

              {quotesSubTab === 'pending' ? (
                <MyReferralsList 
                  filterStatus="quoted"
                  title="Submitted Quotes"
                  emptyMessage="No submitted quotes yet."
                  emptySubMessage="Submit quotes from your assigned referrals."
                />
              ) : (
                <MyReferralsList 
                  filterStatus="accepted"
                  title="Accepted Quotes"
                  emptyMessage="No accepted quotes yet."
                  emptySubMessage="Quotes accepted by clients will appear here."
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cases">
            <ActiveCasesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
