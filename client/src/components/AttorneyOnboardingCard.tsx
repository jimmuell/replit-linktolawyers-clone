import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface Attorney {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function AttorneyOnboardingCard() {
  const [, setLocation] = useLocation();

  const { data: attorneys = [], isLoading, error } = useQuery({
    queryKey: ['/api/attorneys'],
  });

  const totalAttorneys = attorneys.length;
  const activeAttorneys = attorneys.filter((attorney: Attorney) => attorney.isActive).length;
  const verifiedAttorneys = attorneys.filter((attorney: Attorney) => attorney.isVerified).length;
  const pendingVerification = attorneys.filter((attorney: Attorney) => !attorney.isVerified).length;

  const handleManageAttorneys = () => {
    setLocation('/attorney-onboarding');
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Attorney Onboarding</CardTitle>
          <CardDescription>Manage attorney profiles and verification</CardDescription>
        </div>
        <UserPlus className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading attorneys...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">Error loading data</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalAttorneys}</div>
                  <div className="text-xs text-gray-500">Total Attorneys</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{activeAttorneys}</div>
                  <div className="text-xs text-gray-500">Active</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Verified: {verifiedAttorneys}</span>
                </div>
                {pendingVerification > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingVerification} pending
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={handleManageAttorneys}
                className="w-full mt-4"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Attorneys
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}