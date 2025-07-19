import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Clock, DollarSign, Users, Bell, MessageSquare } from 'lucide-react';
import AttorneyAppBar from '@/components/AttorneyAppBar';
import ReferralList from '@/components/ReferralList';
import MyReferralsList from '@/components/MyReferralsList';

export default function AttorneyDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Redirect if not an attorney and not loading
    if (!loading && user && user.role !== 'attorney') {
      if (user.role === 'admin') {
        window.location.href = '/admin-dashboard';
      } else {
        window.location.href = '/';
      }
    }
  }, [user, loading]);

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
          <p className="text-gray-600 mt-2">Manage your legal referrals and cases</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="available">Available Referrals</TabsTrigger>
            <TabsTrigger value="my-referrals">My Referrals</TabsTrigger>
            <TabsTrigger value="cases">Active Cases</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Stats Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Awaiting submission</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4h</div>
                  <p className="text-xs text-muted-foreground">Average response</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New referral assigned</p>
                        <p className="text-xs text-gray-500">Immigration case - Family visa</p>
                      </div>
                      <Badge variant="outline">2h ago</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Quote accepted</p>
                        <p className="text-xs text-gray-500">Case #LR-123456</p>
                      </div>
                      <Badge variant="outline">1 day ago</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Information requested</p>
                        <p className="text-xs text-gray-500">Client response pending</p>
                      </div>
                      <Badge variant="outline">2 days ago</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" onClick={() => setActiveTab('available')}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Browse Available Referrals
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('my-referrals')}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Review My Referrals
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('cases')}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Active Cases
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Bell className="mr-2 h-4 w-4" />
                      View Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="available">
            <ReferralList 
              title="Available Referrals"
              endpoint="/api/attorney-referrals/available"
              showAssignButton={true}
            />
          </TabsContent>

          <TabsContent value="my-referrals">
            <MyReferralsList />
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Active Cases</CardTitle>
                <p className="text-sm text-gray-600">Monitor your ongoing legal cases</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Case management feature is under construction.</p>
                  <p className="text-sm">This section will show your active legal cases and allow you to track progress and manage case details.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Attorney Profile</CardTitle>
                <p className="text-sm text-gray-600">Update your professional information</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Profile management feature is under construction.</p>
                  <p className="text-sm">This section will allow you to update your attorney profile, practice areas, and contact information.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}