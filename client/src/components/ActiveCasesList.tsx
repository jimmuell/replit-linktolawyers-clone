import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, FileText, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ActiveCase {
  caseId: number;
  caseNumber: string;
  caseStatus: string;
  startDate: string;
  completedDate?: string;
  caseNotes: string;
  serviceFee: number;
  quoteDescription: string;
  quoteId: number;
  caseUpdatedAt: string;
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
  };
}

export default function ActiveCasesList() {
  const [selectedCase, setSelectedCase] = useState<ActiveCase | null>(null);
  const [closeCaseConfirm, setCloseCaseConfirm] = useState<ActiveCase | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const cases: ActiveCase[] = casesData?.data || [];

  const closeCaseMutation = useMutation({
    mutationFn: async (caseId: number) => {
      return await apiRequest(`/api/attorney-referrals/cases/${caseId}`, {
        method: 'PATCH',
        body: { status: 'completed' },
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Case Closed",
        description: `Case ${closeCaseConfirm?.caseNumber} has been marked as completed.`,
      });
      setCloseCaseConfirm(null);
      if (selectedCase && selectedCase.caseId === closeCaseConfirm?.caseId) {
        setSelectedCase({ ...selectedCase, caseStatus: 'completed', completedDate: new Date().toISOString() });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/cases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to close the case. Please try again.",
        variant: "destructive",
      });
    },
  });

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
                      {cases.filter((c) => c.caseStatus === 'active').length}
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
                      {formatCurrency(cases.reduce((sum, c) => sum + (c.serviceFee || 0), 0))}
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
                      {cases.filter((c) => c.caseStatus === 'completed').length}
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
                {cases.map((case_) => (
                  <TableRow key={case_.caseId}>
                    <TableCell className="font-medium">{case_.caseNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{case_.request?.firstName} {case_.request?.lastName}</div>
                        <div className="text-sm text-gray-500">{case_.request?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={case_.request?.caseType}>
                        {case_.request?.caseType}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(case_.caseStatus)}>
                        {case_.caseStatus.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(case_.startDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(case_.serviceFee || 0)}</TableCell>
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
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Case Number</label>
                                  <p className="text-sm font-medium">{selectedCase.caseNumber}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Status</label>
                                  <div className="mt-1">
                                    <Badge variant={getStatusBadgeVariant(selectedCase.caseStatus)}>
                                      {selectedCase.caseStatus.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                                  <p className="text-sm">{formatDate(selectedCase.startDate)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Service Fee</label>
                                  <p className="text-sm font-medium">{formatCurrency(selectedCase.serviceFee || 0)}</p>
                                </div>
                              </div>

                              <div>
                                <h3 className="text-lg font-medium mb-3">Client Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Client Name</label>
                                    <p className="text-sm">{selectedCase.request?.firstName} {selectedCase.request?.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm">{selectedCase.request?.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm">{selectedCase.request?.phoneNumber || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Location</label>
                                    <p className="text-sm">{selectedCase.request?.location || 'Not specified'}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h3 className="text-lg font-medium mb-3">Case Details</h3>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Type</label>
                                    <p className="text-sm">{selectedCase.request?.caseType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Description</label>
                                    <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedCase.request?.caseDescription}</p>
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

                              {selectedCase.caseStatus === 'completed' ? (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                  <div className="flex items-center space-x-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Case Completed</span>
                                    {selectedCase.completedDate && (
                                      <span className="text-sm text-green-600">
                                        on {formatDate(selectedCase.completedDate)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : selectedCase.caseStatus === 'active' ? (
                                <div className="flex justify-end pt-4 border-t">
                                  <Button
                                    onClick={() => setCloseCaseConfirm(selectedCase)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Close Case (Completed)
                                  </Button>
                                </div>
                              ) : null}
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

      <AlertDialog open={!!closeCaseConfirm} onOpenChange={(open) => { if (!open) setCloseCaseConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Case {closeCaseConfirm?.caseNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the case as completed. The case for {closeCaseConfirm?.request?.firstName} {closeCaseConfirm?.request?.lastName} will be moved to completed status with today's date as the completion date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closeCaseMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => closeCaseConfirm && closeCaseMutation.mutate(closeCaseConfirm.caseId)}
              disabled={closeCaseMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {closeCaseMutation.isPending ? 'Closing...' : 'Yes, Close Case'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
