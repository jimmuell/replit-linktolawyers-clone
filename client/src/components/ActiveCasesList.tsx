import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, FileText, Calendar, DollarSign } from 'lucide-react';

interface ActiveCase {
  caseId: number;
  caseNumber: string;
  caseStatus: string;
  startDate: string;
  completedDate?: string;
  caseNotes: string;
  serviceFee: number;
  quoteDescription: string;
  requestId: number;
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  caseType: string;
  caseDescription: string;
  location: string;
}

export default function ActiveCasesList() {
  const [selectedCase, setSelectedCase] = useState<ActiveCase | null>(null);

  // Fetch active cases
  const { data: casesData, isLoading } = useQuery({
    queryKey: ['/api/attorney-referrals/cases'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/cases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      
      return response.json();
    },
    retry: false,
  });

  const cases = casesData?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'on_hold':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Cases</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Active Cases
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cases.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No active cases yet</p>
            <p className="text-sm">Cases will appear here when you start them from accepted quotes</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Cases</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {cases.filter((c: ActiveCase) => c.caseStatus === 'active').length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(cases.reduce((sum: number, c: ActiveCase) => sum + c.serviceFee, 0))}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Completed Cases</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {cases.filter((c: ActiveCase) => c.caseStatus === 'completed').length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((case_: ActiveCase) => (
                  <TableRow key={case_.caseId}>
                    <TableCell className="font-medium">{case_.caseNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{case_.firstName} {case_.lastName}</div>
                        <div className="text-sm text-gray-500">{case_.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={case_.caseType}>
                        {case_.caseType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(case_.caseStatus)}>
                        {case_.caseStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(case_.startDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(case_.serviceFee)}</TableCell>
                    <TableCell>
                      <Dialog open={selectedCase?.caseId === case_.caseId} onOpenChange={(open) => {
                        if (!open) {
                          setSelectedCase(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedCase(case_)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Case Details - {selectedCase?.caseNumber}</DialogTitle>
                          </DialogHeader>
                          {selectedCase && (
                            <div className="space-y-6">
                              {/* Case Information */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Case Number</label>
                                  <p className="text-sm font-medium">{selectedCase.caseNumber}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Status</label>
                                  <Badge variant={getStatusBadgeVariant(selectedCase.caseStatus)}>
                                    {selectedCase.caseStatus.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                                  <p className="text-sm">{formatDate(selectedCase.startDate)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Service Fee</label>
                                  <p className="text-sm font-medium">{formatCurrency(selectedCase.serviceFee)}</p>
                                </div>
                              </div>

                              {/* Client Information */}
                              <div>
                                <h3 className="text-lg font-medium mb-3">Client Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Client Name</label>
                                    <p className="text-sm">{selectedCase.firstName} {selectedCase.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm">{selectedCase.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm">{selectedCase.phoneNumber || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Location</label>
                                    <p className="text-sm">{selectedCase.location || 'Not specified'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Case Details */}
                              <div>
                                <h3 className="text-lg font-medium mb-3">Case Details</h3>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Type</label>
                                    <p className="text-sm">{selectedCase.caseType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Description</label>
                                    <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedCase.caseDescription}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Service Description</label>
                                    <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedCase.quoteDescription}</p>
                                  </div>
                                  {selectedCase.caseNotes && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Case Notes</label>
                                      <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedCase.caseNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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