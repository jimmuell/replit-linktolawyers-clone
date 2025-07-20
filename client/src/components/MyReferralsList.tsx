import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, MessageSquare, DollarSign, FileText, Clock, Edit2, Trash2, UserMinus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MyReferral {
  assignmentId: number;
  assignmentStatus: string;
  assignedAt: string;
  notes: string;
  quoteStatus?: string;
  quoteId?: number; // Add quoteId to check against active cases
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
}

export default function MyReferralsList({ filterStatus }: MyReferralsListProps) {
  const [selectedReferral, setSelectedReferral] = useState<MyReferral | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isEditQuoteModalOpen, setIsEditQuoteModalOpen] = useState(false);
  const [infoRequest, setInfoRequest] = useState({ subject: '', message: '' });
  const [quote, setQuote] = useState({ serviceFee: '', description: '', terms: '', validUntil: '' });
  const [editQuote, setEditQuote] = useState({ id: 0, serviceFee: '', description: '', terms: '', validUntil: '' });
  const [feeScheduleData, setFeeScheduleData] = useState<any>(null);
  const [note, setNote] = useState('');
  const [existingQuote, setExistingQuote] = useState<any>(null);
  const [existingCase, setExistingCase] = useState<any>(null);
  const [unassignWarning, setUnassignWarning] = useState<{ assignmentId: number; hasQuote: boolean } | null>(null);
  const [isStartCaseModalOpen, setIsStartCaseModalOpen] = useState(false);
  const [caseNotes, setCaseNotes] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch my referrals
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

  // Fetch existing quote for a referral
  const fetchExistingQuote = async (assignmentId: number) => {
    try {
      const response = await fetch(`/api/attorney-referrals/assignment/${assignmentId}/quotes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (response.ok) {
        const text = await response.text();
        if (!text) {
          // Empty response
          return null;
        }
        const data = JSON.parse(text);
        return data.data && data.data.length > 0 ? data.data[0] : null;
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
    return null;
  };

  // Fetch existing case for a quote
  const fetchExistingCase = async (quoteId: number) => {
    try {
      const response = await fetch('/api/attorney-referrals/cases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const cases = data.data || [];
        // Match using quoteId (note: API returns camelCase)
        return cases.find((c: any) => c.quoteId === quoteId || c.quote_id === quoteId) || null;
      }
    } catch (error) {
      console.error('Error fetching case:', error);
    }
    return null;
  };

  const allReferrals = referralsData?.data || [];
  
  // Fetch active cases to determine which quotes have been turned into cases
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
  
  // Debug logging to understand the data flow
  console.log('Active cases:', activeCases);
  console.log('Active case quote IDs:', Array.from(activeCaseQuoteIds));
  console.log('All referrals:', allReferrals.map(r => ({ 
    assignmentId: r.assignmentId, 
    quoteId: r.quoteId, 
    assignmentStatus: r.assignmentStatus,
    quoteStatus: r.quoteStatus,
    hasActiveCase: activeCaseQuoteIds.has(r.quoteId)
  })));
  console.log('Filter status:', filterStatus);

  // Filter referrals based on assignment status or quote status
  const referrals = allReferrals.filter((referral: MyReferral) => {
    // Check if this referral has an active case (should be excluded from Accepted Quotes)
    const hasActiveCase = activeCaseQuoteIds.size > 0 && referral.quoteId && activeCaseQuoteIds.has(referral.quoteId);
    
    if (!filterStatus) {
      // No filter means show all EXCEPT accepted ones (they belong in "Accepted Quotes" tab)
      return referral.assignmentStatus !== 'accepted';
    }
    
    if (filterStatus === 'accepted') {
      // For accepted quotes, only show referrals with "accepted" assignment status AND no active case
      // This ensures that once a case is started, it disappears from "Accepted Quotes" tab
      return referral.assignmentStatus === 'accepted' && !hasActiveCase;
    }
    
    return referral.assignmentStatus === filterStatus;
  });

  // Unassign mutation
  const unassignMutation = useMutation({
    mutationFn: async (assignmentId: number) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/unassign`, {
        method: 'DELETE',
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Unassigned Successfully",
        description: data.quotesDeleted > 0 
          ? `Unassigned from request and deleted ${data.quotesDeleted} quote(s)`
          : "Successfully unassigned from request",
      });
      // Invalidate both my-referrals and available referrals to ensure UI consistency
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/available'] });
      setUnassignWarning(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unassign from request",
        variant: "destructive",
      });
    },
  });

  // Edit quote mutation
  const editQuoteMutation = useMutation({
    mutationFn: async ({ assignmentId, quoteId, data }: { assignmentId: number; quoteId: number; data: any }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/quote/${quoteId}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Quote Updated",
        description: "Your quote has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      setIsEditQuoteModalOpen(false);
      setEditQuote({ id: 0, serviceFee: '', description: '', terms: '', validUntil: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update quote",
        variant: "destructive",
      });
    },
  });

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async ({ assignmentId, quoteId }: { assignmentId: number; quoteId: number }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/quote/${quoteId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Quote Deleted",
        description: "Your quote has been deleted successfully",
      });
      // Update the selectedReferral state to reflect the new status
      setSelectedReferral(prev => prev ? {
        ...prev,
        assignmentStatus: 'assigned'
      } : prev);
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote",
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ assignmentId, status, notes }: { assignmentId: number; status: string; notes?: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/status`, {
        method: 'PATCH',
        body: { status, notes },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  // Request info mutation
  const requestInfoMutation = useMutation({
    mutationFn: async ({ assignmentId, subject, message }: { assignmentId: number; subject: string; message: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/request-info`, {
        method: 'POST',
        body: { subject, message },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Information request sent to client",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      setIsInfoModalOpen(false);
      setInfoRequest({ subject: '', message: '' });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send information request",
        variant: "destructive",
      });
    },
  });

  // Submit quote mutation
  const quoteMutation = useMutation({
    mutationFn: async ({ assignmentId, serviceFee, description, terms, validUntil }: { 
      assignmentId: number; 
      serviceFee: number; 
      description: string; 
      terms: string; 
      validUntil?: string;
    }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/quote`, {
        method: 'POST',
        body: { serviceFee, description, terms, validUntil },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quote submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      // Close all modals and return to main list
      setIsQuoteModalOpen(false);
      setSelectedReferral(null);
      setQuote({ serviceFee: '', description: '', terms: '', validUntil: '' });
      setFeeScheduleData(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit quote",
        variant: "destructive",
      });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ assignmentId, note }: { assignmentId: number; note: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/note`, {
        method: 'POST',
        body: { note, isPrivate: true },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note added successfully",
      });
      setIsNotesModalOpen(false);
      setNote('');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    },
  });

  // Start case mutation
  const startCaseMutation = useMutation({
    mutationFn: async ({ quoteId, notes }: { quoteId: number; notes?: string }) => {
      return await apiRequest('/api/attorney-referrals/cases/start', {
        method: 'POST',
        body: { quoteId, notes },
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Case Started",
        description: `Case ${data.data.caseNumber} has been started successfully`,
      });
      setIsStartCaseModalOpen(false);
      setCaseNotes('');
      setExistingCase(data.data); // Update the case state to show case info instead of button
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start case",
        variant: "destructive",
      });
    },
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

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Function to fetch fee schedule for a case type
  const fetchFeeSchedule = async (caseType: string) => {
    try {
      const response = await fetch(`/api/attorney-referrals/fee-schedule/${caseType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
    } catch (error) {
      console.error('Error fetching fee schedule:', error);
    }
    return null;
  };

  // Removed useEffect for fee schedule loading - now handled in button click

  const handleSubmitInfoRequest = () => {
    if (!selectedReferral || !infoRequest.subject || !infoRequest.message) return;
    
    requestInfoMutation.mutate({
      assignmentId: selectedReferral.assignmentId,
      subject: infoRequest.subject,
      message: infoRequest.message,
    });
  };

  const handleSubmitQuote = () => {
    if (!selectedReferral || !quote.serviceFee || !quote.description) return;
    
    quoteMutation.mutate({
      assignmentId: selectedReferral.assignmentId,
      serviceFee: Math.round(parseFloat(quote.serviceFee) * 100), // Convert to cents
      description: quote.description,
      terms: quote.terms,
      validUntil: quote.validUntil || undefined,
    });
  };

  const handleAddNote = () => {
    if (!selectedReferral || !note.trim()) return;
    
    addNoteMutation.mutate({
      assignmentId: selectedReferral.assignmentId,
      note: note.trim(),
    });
  };

  const handleEditQuoteSubmit = () => {
    if (!selectedReferral || !editQuote.id) return;
    
    editQuoteMutation.mutate({
      assignmentId: selectedReferral.assignmentId,
      quoteId: editQuote.id,
      data: {
        serviceFee: Math.round(parseFloat(editQuote.serviceFee) * 100),
        description: editQuote.description,
        terms: editQuote.terms,
        validUntil: editQuote.validUntil || undefined,
      },
    });
  };

  const handleUnassignClick = async (referral: MyReferral) => {
    const quote = await fetchExistingQuote(referral.assignmentId);
    setUnassignWarning({
      assignmentId: referral.assignmentId,
      hasQuote: !!quote
    });
  };

  const handleEditQuoteClick = async (referral: MyReferral) => {
    const quote = await fetchExistingQuote(referral.assignmentId);
    if (quote) {
      setEditQuote({
        id: quote.id,
        serviceFee: (quote.serviceFee / 100).toString(),
        description: quote.description,
        terms: quote.terms || '',
        validUntil: quote.validUntil || '',
      });
      setSelectedReferral(referral);
      setIsEditQuoteModalOpen(true);
    } else {
      toast({
        title: "No Quote Found",
        description: "No quote found for this referral",
        variant: "destructive",
      });
    }
  };

  const handleStartCaseClick = async (referral: MyReferral) => {
    const quote = await fetchExistingQuote(referral.assignmentId);
    if (quote && quote.status === 'accepted') {
      setSelectedReferral(referral);
      setExistingQuote(quote);
      setIsStartCaseModalOpen(true);
    } else {
      toast({
        title: "Cannot Start Case",
        description: "Quote must be accepted to start a case",
        variant: "destructive",
      });
    }
  };

  const handleStartCaseSubmit = () => {
    if (!existingQuote) return;
    
    startCaseMutation.mutate({
      quoteId: existingQuote.id,
      notes: caseNotes.trim() || undefined,
    });
  };

  const handleDeleteQuoteClick = async (referral: MyReferral) => {
    const quote = await fetchExistingQuote(referral.assignmentId);
    if (quote) {
      deleteQuoteMutation.mutate({
        assignmentId: referral.assignmentId,
        quoteId: quote.id,
      });
    } else {
      toast({
        title: "No Quote Found",
        description: "No quote found for this referral",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Referrals</CardTitle>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            My Assigned Referrals
            <Badge variant="outline">{referrals.length} active</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No assigned referrals yet.</p>
              <p className="text-sm">Check the available referrals to assign cases to yourself.</p>
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
                        <Dialog open={selectedReferral?.assignmentId === referral.assignmentId} onOpenChange={(open) => {
                          if (!open) {
                            setSelectedReferral(null);
                            setExistingQuote(null);
                            setExistingCase(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                setSelectedReferral(referral);
                                // Load existing quote if status is quoted or accepted
                                if (referral.assignmentStatus === 'quoted' || referral.assignmentStatus === 'accepted') {
                                  const quote = await fetchExistingQuote(referral.assignmentId);
                                  setExistingQuote(quote);
                                  
                                  // If quote exists and is accepted, check for existing case
                                  if (quote && quote.status === 'accepted') {
                                    const existingCase = await fetchExistingCase(quote.id);
                                    setExistingCase(existingCase);
                                  } else {
                                    setExistingCase(null);
                                  }
                                }
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Referral Details - {selectedReferral?.request.requestNumber}</DialogTitle>
                            </DialogHeader>
                            {selectedReferral && (
                              <div className="space-y-6">
                                {/* Client Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Client Name</label>
                                    <p className="text-sm">{selectedReferral.request.firstName} {selectedReferral.request.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm">{selectedReferral.request.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm">{selectedReferral.request.phoneNumber || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Location</label>
                                    <p className="text-sm">{selectedReferral.request.location || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Type</label>
                                    <p className="text-sm">{selectedReferral.request.caseType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Assignment Status</label>
                                    <Badge variant={getStatusBadgeVariant(selectedReferral.assignmentStatus)}>
                                      {selectedReferral.assignmentStatus.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Case Description */}
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Case Description</label>
                                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedReferral.request.caseDescription}</p>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                                    <p className="text-sm">{formatDate(selectedReferral.request.createdAt)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Assigned to You</label>
                                    <p className="text-sm">{formatDate(selectedReferral.assignedAt)}</p>
                                  </div>
                                </div>

                                {/* Assignment Notes */}
                                {selectedReferral.notes && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Assignment Notes</label>
                                    <p className="text-sm mt-1 p-3 bg-blue-50 rounded-md">{selectedReferral.notes}</p>
                                  </div>
                                )}

                                {/* Actions Section */}
                                <div className="border-t pt-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {/* Status Update Actions */}
                                    {selectedReferral.assignmentStatus === 'assigned' && (
                                      <Button 
                                        size="sm"
                                        variant="default"
                                        onClick={() => {
                                          updateStatusMutation.mutate({ 
                                            assignmentId: selectedReferral.assignmentId, 
                                            status: 'under_review' 
                                          }, {
                                            onSuccess: () => {
                                              // Update the selectedReferral state to reflect the new status
                                              setSelectedReferral(prev => prev ? {
                                                ...prev,
                                                assignmentStatus: 'under_review'
                                              } : prev);
                                            }
                                          });
                                        }}
                                        disabled={updateStatusMutation.isPending}
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        Start Review
                                      </Button>
                                    )}
                                    
                                    {/* Information Request */}
                                    {(selectedReferral.assignmentStatus === 'under_review' || selectedReferral.assignmentStatus === 'assigned') && (
                                      <Button 
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsInfoModalOpen(true)}
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Request Info
                                      </Button>
                                    )}
                                    
                                    {/* Submit Quote */}
                                    {(selectedReferral.assignmentStatus === 'ready_to_quote' || selectedReferral.assignmentStatus === 'under_review') && (
                                      <Button 
                                        size="sm"
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={async () => {
                                          // Load fee schedule first, then open modal
                                          if (selectedReferral) {
                                            try {
                                              const feeSchedule = await fetchFeeSchedule(selectedReferral.request.caseType);
                                              
                                              if (feeSchedule) {
                                                setFeeScheduleData(feeSchedule);
                                                // Pre-populate the quote form with fee schedule data
                                                setQuote(prev => ({
                                                  ...prev,
                                                  serviceFee: (feeSchedule.fee / 100).toString(), // Convert from cents to dollars
                                                  description: feeSchedule.notes || `${feeSchedule.feeType === 'flat' ? 'Flat fee' : feeSchedule.feeType} for ${selectedReferral.request.caseType}`,
                                                }));
                                              } else {
                                                // Clear any existing data if no fee schedule found
                                                setFeeScheduleData(null);
                                                setQuote(prev => ({
                                                  ...prev,
                                                  serviceFee: '',
                                                  description: '',
                                                }));
                                              }
                                            } catch (error) {
                                              console.error('Error fetching attorney fee schedule:', error);
                                            }
                                          }
                                          setIsQuoteModalOpen(true);
                                        }}
                                      >
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        Submit Quote
                                      </Button>
                                    )}
                                    
                                    {/* Quote Management Actions */}
                                    {selectedReferral.assignmentStatus === 'quoted' && (
                                      <>
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditQuoteClick(selectedReferral)}
                                          disabled={editQuoteMutation.isPending}
                                        >
                                          <Edit2 className="h-3 w-3 mr-1" />
                                          Edit Quote
                                        </Button>
                                        
                                        <Button 
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleDeleteQuoteClick(selectedReferral)}
                                          disabled={deleteQuoteMutation.isPending}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Delete Quote
                                        </Button>
                                      </>
                                    )}
                                    
                                    {/* Add Note */}
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setIsNotesModalOpen(true)}
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      Add Note
                                    </Button>
                                    
                                    {/* Unassign Action */}
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUnassignClick(selectedReferral)}
                                      disabled={unassignMutation.isPending}
                                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                    >
                                      <UserMinus className="h-3 w-3 mr-1" />
                                      Unassign Myself
                                    </Button>
                                  </div>
                                  
                                  {/* Quote Status and Start Case Section */}
                                  {(selectedReferral.assignmentStatus === 'quoted' || selectedReferral.assignmentStatus === 'accepted') && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <label className="text-xs font-medium text-gray-600">Quote Status:</label>
                                          <div className="mt-1">
                                            <Badge 
                                              variant={
                                                existingQuote?.status === 'accepted' ? 'default' :
                                                existingQuote?.status === 'declined' ? 'destructive' : 
                                                'secondary'
                                              }
                                              className={
                                                existingQuote?.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                existingQuote?.status === 'declined' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                              }
                                            >
                                              {existingQuote?.status === 'pending' ? 'Pending' :
                                               existingQuote?.status === 'accepted' ? 'Accepted' :
                                               existingQuote?.status === 'declined' ? 'Declined' : 
                                               'Unknown'}
                                            </Badge>
                                          </div>
                                        </div>
                                        
                                        {existingQuote?.status === 'accepted' && (
                                          existingCase ? (
                                            <div className="text-sm">
                                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                Case Started: {existingCase.caseNumber}
                                              </Badge>
                                            </div>
                                          ) : (
                                            <Button 
                                              size="sm"
                                              onClick={() => handleStartCaseClick(selectedReferral)}
                                              disabled={startCaseMutation.isPending}
                                              className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              <FileText className="h-3 w-3 mr-1" />
                                              Start Case
                                            </Button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
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

      {/* Request Information Modal */}
      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={infoRequest.subject}
                onChange={(e) => setInfoRequest(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Subject of your information request"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={infoRequest.message}
                onChange={(e) => setInfoRequest(prev => ({ ...prev, message: e.target.value }))}
                placeholder="What additional information do you need from the client?"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsInfoModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitInfoRequest}
                disabled={requestInfoMutation.isPending || !infoRequest.subject || !infoRequest.message}
              >
                {requestInfoMutation.isPending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Quote Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {feeScheduleData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">
                    Fee Schedule Applied: {feeScheduleData.feeType} fee - ${(feeScheduleData.fee / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  Pre-populated from your configured fee schedule for this case type. You can modify as needed.
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="serviceFee">Service Fee ($)</Label>
              <Input
                id="serviceFee"
                type="number"
                step="0.01"
                value={quote.serviceFee}
                onChange={(e) => setQuote(prev => ({ ...prev, serviceFee: e.target.value }))}
                placeholder="0.00"
                className={feeScheduleData ? "border-blue-300 bg-blue-50" : ""}
              />
              {feeScheduleData && (
                <p className="text-xs text-gray-500 mt-1">
                  From your fee schedule: {feeScheduleData.feeType} fee
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                value={quote.description}
                onChange={(e) => setQuote(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the services you will provide"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={quote.terms}
                onChange={(e) => setQuote(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Payment terms, timeline, etc."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until (Optional)</Label>
              <Input
                id="validUntil"
                type="date"
                value={quote.validUntil}
                onChange={(e) => setQuote(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsQuoteModalOpen(false);
                setQuote({ serviceFee: '', description: '', terms: '', validUntil: '' });
                setFeeScheduleData(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitQuote}
                disabled={quoteMutation.isPending || !quote.serviceFee || !quote.description}
                className="bg-green-600 hover:bg-green-700"
              >
                {quoteMutation.isPending ? 'Submitting...' : 'Submit Quote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={isNotesModalOpen} onOpenChange={setIsNotesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Private Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a private note about this referral..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsNotesModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddNote}
                disabled={addNoteMutation.isPending || !note.trim()}
              >
                {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Quote Modal */}
      <Dialog open={isEditQuoteModalOpen} onOpenChange={setIsEditQuoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quote</DialogTitle>
            <DialogDescription>
              Update your quote details for this referral.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editServiceFee">Service Fee ($)</Label>
              <Input
                id="editServiceFee"
                type="number"
                step="0.01"
                value={editQuote.serviceFee}
                onChange={(e) => setEditQuote(prev => ({ ...prev, serviceFee: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Service Description</Label>
              <Textarea
                id="editDescription"
                value={editQuote.description}
                onChange={(e) => setEditQuote(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the services you will provide"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editTerms">Terms & Conditions</Label>
              <Textarea
                id="editTerms"
                value={editQuote.terms}
                onChange={(e) => setEditQuote(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Payment terms, timeline, etc."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editValidUntil">Valid Until (Optional)</Label>
              <Input
                id="editValidUntil"
                type="date"
                value={editQuote.validUntil}
                onChange={(e) => setEditQuote(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsEditQuoteModalOpen(false);
                setEditQuote({ id: 0, serviceFee: '', description: '', terms: '', validUntil: '' });
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditQuoteSubmit}
                disabled={editQuoteMutation.isPending || !editQuote.serviceFee || !editQuote.description}
              >
                {editQuoteMutation.isPending ? 'Updating...' : 'Update Quote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <AlertDialog open={!!unassignWarning} onOpenChange={() => setUnassignWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Confirm Unassignment</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {unassignWarning?.hasQuote ? (
                <>
                  <div className="mb-3">
                    <strong>Warning:</strong> You currently have a quote submitted for this referral.
                  </div>
                  <div className="text-sm">
                    If you unassign yourself from this referral, your quote will be automatically deleted. 
                    This action cannot be undone.
                  </div>
                </>
              ) : (
                <div>
                  Are you sure you want to unassign yourself from this referral? 
                  This action cannot be undone.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                if (unassignWarning) {
                  unassignMutation.mutate(unassignWarning.assignmentId);
                }
              }}
            >
              {unassignWarning?.hasQuote ? 'Unassign and Delete Quote' : 'Unassign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Start Case Modal */}
      <Dialog open={isStartCaseModalOpen} onOpenChange={setIsStartCaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Case</DialogTitle>
            <DialogDescription>
              Create a new case from the accepted quote.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Quote Accepted:</strong> The client has accepted your quote. You can now start the case.
              </p>
              {existingQuote && (
                <p className="text-sm text-green-700 mt-1">
                  Service Fee: {formatCurrency(existingQuote.serviceFee)}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="caseNotes">Case Notes (Optional)</Label>
              <Textarea
                id="caseNotes"
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                placeholder="Add any initial notes for this case..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsStartCaseModalOpen(false);
                setCaseNotes('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleStartCaseSubmit}
                disabled={startCaseMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {startCaseMutation.isPending ? 'Starting Case...' : 'Start Case'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}