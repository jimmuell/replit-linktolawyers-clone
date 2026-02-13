import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, MessageSquare, DollarSign, FileText, Edit2, Trash2, UserMinus, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AttorneyAppBar from '@/components/AttorneyAppBar';

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

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'assigned': return 'secondary' as const;
    case 'under_review': return 'default' as const;
    case 'info_requested': return 'outline' as const;
    case 'ready_to_quote': return 'default' as const;
    case 'quoted': return 'default' as const;
    case 'accepted': return 'default' as const;
    case 'rejected': return 'destructive' as const;
    default: return 'secondary' as const;
  }
};

export default function ReferralDetailsPage() {
  const params = useParams<{ assignmentId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const assignmentId = parseInt(params.assignmentId || '0');

  const [activeTab, setActiveTab] = useState('details');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoRequest, setInfoRequest] = useState({ subject: '', message: '' });
  const [unassignWarning, setUnassignWarning] = useState<{ hasQuote: boolean } | null>(null);
  const [note, setNote] = useState('');
  const [quote, setQuote] = useState({ serviceFee: '', description: '', terms: '', validUntil: '' });
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [editQuote, setEditQuote] = useState({ id: 0, serviceFee: '', description: '', terms: '', validUntil: '' });
  const [deleteQuoteConfirm, setDeleteQuoteConfirm] = useState<{ quoteId: number } | null>(null);
  const [isStartCaseModalOpen, setIsStartCaseModalOpen] = useState(false);
  const [caseNotes, setCaseNotes] = useState('');

  const { data: referralsData, isLoading } = useQuery({
    queryKey: ['/api/attorney-referrals/my-referrals'],
    queryFn: async () => {
      const response = await fetch('/api/attorney-referrals/my-referrals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch referrals');
      return response.json();
    },
    retry: false,
  });

  const referral: MyReferral | undefined = referralsData?.data?.find(
    (r: MyReferral) => r.assignmentId === assignmentId
  );

  const { data: notesData, refetch: refetchNotes } = useQuery({
    queryKey: ['/api/attorney-referrals/assignment', assignmentId, 'notes'],
    queryFn: async () => {
      const response = await fetch(`/api/attorney-referrals/assignment/${assignmentId}/notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) return { data: [] };
      return response.json();
    },
    enabled: !!assignmentId,
  });

  const { data: quotesData, refetch: refetchQuotes } = useQuery({
    queryKey: ['/api/attorney-referrals/assignment', assignmentId, 'quotes'],
    queryFn: async () => {
      const response = await fetch(`/api/attorney-referrals/assignment/${assignmentId}/quotes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) return { data: [] };
      const text = await response.text();
      if (!text) return { data: [] };
      return JSON.parse(text);
    },
    enabled: !!assignmentId,
  });

  const existingQuote = quotesData?.data?.[0] || null;

  const { data: feeScheduleData } = useQuery({
    queryKey: ['/api/attorney-referrals/fee-schedule', referral?.request?.caseType],
    queryFn: async () => {
      const response = await fetch(`/api/attorney-referrals/fee-schedule/${referral!.request.caseType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    },
    enabled: !!referral?.request?.caseType && !existingQuote && (referral?.assignmentStatus === 'ready_to_quote' || referral?.assignmentStatus === 'under_review'),
  });

  const { data: casesData } = useQuery({
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
    enabled: !!existingQuote && existingQuote.status === 'accepted',
  });

  const existingCase = casesData?.data?.find((c: any) => c.quoteId === existingQuote?.id || c.quote_id === existingQuote?.id) || null;

  useEffect(() => {
    if (feeScheduleData && !existingQuote && quote.serviceFee === '' && quote.description === '') {
      setQuote({
        serviceFee: feeScheduleData.defaultFee ? (feeScheduleData.defaultFee / 100).toString() : '',
        description: feeScheduleData.description || '',
        terms: feeScheduleData.terms || '',
        validUntil: '',
      });
    }
  }, [feeScheduleData, existingQuote]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/status`, {
        method: 'PATCH',
        body: { status },
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" });
    },
  });

  const requestInfoMutation = useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/request-info`, {
        method: 'POST',
        body: { subject, message },
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Information request sent to client" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      setIsInfoModalOpen(false);
      setInfoRequest({ subject: '', message: '' });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to send information request", variant: "destructive" });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/unassign`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({ title: "Unassigned Successfully", description: "Successfully unassigned from request" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/available'] });
      setUnassignWarning(null);
      setLocation('/attorney-dashboard');
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to unassign from request", variant: "destructive" });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ noteText }: { noteText: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/note`, {
        method: 'POST',
        body: { note: noteText, isPrivate: true },
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Note added successfully" });
      setNote('');
      refetchNotes();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to add note", variant: "destructive" });
    },
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: { serviceFee: number; description: string; terms: string; validUntil?: string }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/quote`, {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Quote submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      refetchQuotes();
      setQuote({ serviceFee: '', description: '', terms: '', validUntil: '' });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to submit quote", variant: "destructive" });
    },
  });

  const editQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, data }: { quoteId: number; data: any }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/quote/${quoteId}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Quote Updated", description: "Your quote has been updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      refetchQuotes();
      setIsEditingQuote(false);
      setEditQuote({ id: 0, serviceFee: '', description: '', terms: '', validUntil: '' });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update quote", variant: "destructive" });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async ({ quoteId }: { quoteId: number }) => {
      return await apiRequest(`/api/attorney-referrals/assignment/${assignmentId}/quote/${quoteId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({ title: "Quote Deleted", description: "Your quote has been deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      refetchQuotes();
      setDeleteQuoteConfirm(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete quote", variant: "destructive" });
    },
  });

  const startCaseMutation = useMutation({
    mutationFn: async ({ quoteId, notes }: { quoteId: number; notes?: string }) => {
      return await apiRequest('/api/attorney-referrals/cases/start', {
        method: 'POST',
        body: { quoteId, notes },
      });
    },
    onSuccess: () => {
      toast({ title: "Case Started", description: "Case has been created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/cases'] });
      setIsStartCaseModalOpen(false);
      setCaseNotes('');
    },
    onError: (error: Error) => {
      const isAlreadyExists = error.message?.toLowerCase().includes('already exists');
      toast({
        title: isAlreadyExists ? "Case Already Started" : "Error",
        description: isAlreadyExists ? "A case has already been created for this quote." : (error.message || "Failed to start case"),
        variant: isAlreadyExists ? "default" : "destructive",
      });
      if (isAlreadyExists) {
        setIsStartCaseModalOpen(false);
        setCaseNotes('');
        queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/cases'] });
      }
    },
  });

  const handleUnassignClick = async () => {
    try {
      const response = await fetch(`/api/attorney-referrals/assignment/${assignmentId}/quotes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionId')}` },
      });
      let hasQuote = false;
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          hasQuote = !!(data.data && data.data.length > 0);
        }
      }
      setUnassignWarning({ hasQuote });
    } catch {
      setUnassignWarning({ hasQuote: false });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AttorneyAppBar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AttorneyAppBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Referral Not Found</h2>
            <p className="text-gray-500 mb-6">The referral you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => setLocation('/attorney-dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const notes = notesData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AttorneyAppBar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setLocation('/attorney-dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-gray-900">
            Referral #{referral.request.requestNumber}
          </h1>
          <div className="w-32" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="quote" className="gap-1.5">
              <DollarSign className="h-4 w-4" />
              Quote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Client Name</Label>
                      <p className="font-medium">{referral.request.firstName} {referral.request.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Email</Label>
                      <p className="font-medium">{referral.request.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Phone</Label>
                      <p className="font-medium">{referral.request.phoneNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Location</Label>
                      <p className="font-medium">{referral.request.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-sm text-gray-500">Case Type</Label>
                      <p className="font-medium">{referral.request.caseType}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Assignment Status</Label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(referral.assignmentStatus)}>
                          {referral.assignmentStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm text-gray-500">Case Description</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{referral.request.caseDescription}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500">Submitted</Label>
                      <p className="text-sm">{formatDate(referral.request.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Assigned</Label>
                      <p className="text-sm">{formatDate(referral.assignedAt)}</p>
                    </div>
                  </div>

                  {referral.notes && (
                    <div className="mt-4">
                      <Label className="text-sm text-gray-500">Assignment Notes</Label>
                      <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <p className="text-sm text-blue-900">{referral.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {referral.assignmentStatus === 'assigned' && (
                      <Button
                        onClick={() => updateStatusMutation.mutate({ status: 'under_review' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {updateStatusMutation.isPending ? 'Updating...' : 'Start Review'}
                      </Button>
                    )}

                    {(referral.assignmentStatus === 'under_review' || referral.assignmentStatus === 'assigned') && (
                      <Button variant="outline" onClick={() => setIsInfoModalOpen(true)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Request Info
                      </Button>
                    )}

                    <Button variant="destructive" onClick={handleUnassignClick}>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Unassign Myself
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No notes yet</p>
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {notes.map((n: any) => (
                        <div key={n.id} className="p-3 bg-gray-50 rounded-md border">
                          <p className="text-sm whitespace-pre-wrap">{n.note}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatDate(n.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Label>Add Note</Label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Type your note here..."
                      className="mt-2"
                      rows={3}
                    />
                    <Button
                      className="mt-3"
                      onClick={() => addNoteMutation.mutate({ noteText: note.trim() })}
                      disabled={!note.trim() || addNoteMutation.isPending}
                    >
                      {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quote">
            <Card>
              <CardHeader>
                <CardTitle>Quote</CardTitle>
              </CardHeader>
              <CardContent>
                {existingQuote ? (
                  <div className="space-y-4">
                    {isEditingQuote ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Service Fee ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editQuote.serviceFee}
                            onChange={(e) => setEditQuote({ ...editQuote, serviceFee: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={editQuote.description}
                            onChange={(e) => setEditQuote({ ...editQuote, description: e.target.value })}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Terms</Label>
                          <Textarea
                            value={editQuote.terms}
                            onChange={(e) => setEditQuote({ ...editQuote, terms: e.target.value })}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Valid Until (optional)</Label>
                          <Input
                            type="date"
                            value={editQuote.validUntil}
                            onChange={(e) => setEditQuote({ ...editQuote, validUntil: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => editQuoteMutation.mutate({
                              quoteId: editQuote.id,
                              data: {
                                serviceFee: Math.round(parseFloat(editQuote.serviceFee) * 100),
                                description: editQuote.description,
                                terms: editQuote.terms,
                                validUntil: editQuote.validUntil || undefined,
                              },
                            })}
                            disabled={editQuoteMutation.isPending}
                          >
                            {editQuoteMutation.isPending ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditingQuote(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-gray-500">Service Fee</Label>
                            <p className="text-lg font-semibold">{formatCurrency(existingQuote.serviceFee)}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Quote Status</Label>
                            <div className="mt-1">
                              <Badge variant={getStatusBadgeVariant(existingQuote.status)}>
                                {existingQuote.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {existingQuote.description && (
                          <div>
                            <Label className="text-sm text-gray-500">Description</Label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{existingQuote.description}</p>
                          </div>
                        )}

                        {existingQuote.terms && (
                          <div>
                            <Label className="text-sm text-gray-500">Terms</Label>
                            <p className="text-sm mt-1 whitespace-pre-wrap">{existingQuote.terms}</p>
                          </div>
                        )}

                        {existingQuote.validUntil && (
                          <div>
                            <Label className="text-sm text-gray-500">Valid Until</Label>
                            <p className="text-sm mt-1">{formatDate(existingQuote.validUntil)}</p>
                          </div>
                        )}

                        {existingQuote.status === 'quoted' && (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditQuote({
                                  id: existingQuote.id,
                                  serviceFee: (existingQuote.serviceFee / 100).toString(),
                                  description: existingQuote.description || '',
                                  terms: existingQuote.terms || '',
                                  validUntil: existingQuote.validUntil || '',
                                });
                                setIsEditingQuote(true);
                              }}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Quote
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => setDeleteQuoteConfirm({ quoteId: existingQuote.id })}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Quote
                            </Button>
                          </div>
                        )}

                        {existingQuote.status === 'accepted' && (
                          <div className="pt-4 border-t">
                            {existingCase ? (
                              <div className="p-4 bg-green-50 rounded-md border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                  <span className="font-medium text-green-900">Case Already Created</span>
                                </div>
                                <p className="text-sm text-green-800">
                                  Case #{existingCase.caseNumber} has been created for this quote.
                                </p>
                              </div>
                            ) : (
                              <Button onClick={() => setIsStartCaseModalOpen(true)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Start Case
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {(referral.assignmentStatus === 'ready_to_quote' || referral.assignmentStatus === 'under_review') ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Service Fee ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={quote.serviceFee}
                            onChange={(e) => setQuote({ ...quote, serviceFee: e.target.value })}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={quote.description}
                            onChange={(e) => setQuote({ ...quote, description: e.target.value })}
                            placeholder="Describe the services included..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Terms</Label>
                          <Textarea
                            value={quote.terms}
                            onChange={(e) => setQuote({ ...quote, terms: e.target.value })}
                            placeholder="Payment terms, conditions..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Valid Until (optional)</Label>
                          <Input
                            type="date"
                            value={quote.validUntil}
                            onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={() => submitQuoteMutation.mutate({
                            serviceFee: Math.round(parseFloat(quote.serviceFee) * 100),
                            description: quote.description,
                            terms: quote.terms,
                            validUntil: quote.validUntil || undefined,
                          })}
                          disabled={!quote.serviceFee || !quote.description || submitQuoteMutation.isPending}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          {submitQuoteMutation.isPending ? 'Submitting...' : 'Submit Quote'}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No quote submitted yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Status must be "under review" or "ready to quote" to submit a quote
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Information</DialogTitle>
            <DialogDescription>Send a request for additional information to the client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Input
                value={infoRequest.subject}
                onChange={(e) => setInfoRequest({ ...infoRequest, subject: e.target.value })}
                placeholder="Subject of your request"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={infoRequest.message}
                onChange={(e) => setInfoRequest({ ...infoRequest, message: e.target.value })}
                placeholder="What information do you need?"
                className="mt-1"
                rows={4}
              />
            </div>
            <Button
              onClick={() => requestInfoMutation.mutate({ subject: infoRequest.subject, message: infoRequest.message })}
              disabled={!infoRequest.subject || !infoRequest.message || requestInfoMutation.isPending}
              className="w-full"
            >
              {requestInfoMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!unassignWarning} onOpenChange={(open) => !open && setUnassignWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Unassignment
            </AlertDialogTitle>
            <AlertDialogDescription>
              {unassignWarning?.hasQuote
                ? "Are you sure you want to unassign yourself? This will also delete any quotes you've submitted for this referral."
                : "Are you sure you want to unassign yourself from this referral?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => unassignMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {unassignMutation.isPending ? 'Unassigning...' : unassignWarning?.hasQuote ? 'Unassign and Delete Quote' : 'Unassign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteQuoteConfirm} onOpenChange={(open) => !open && setDeleteQuoteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuoteConfirm && deleteQuoteMutation.mutate({ quoteId: deleteQuoteConfirm.quoteId })}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteQuoteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isStartCaseModalOpen} onOpenChange={setIsStartCaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Case</DialogTitle>
            <DialogDescription>Create a new case from this accepted quote.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Case Notes (optional)</Label>
              <Textarea
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                placeholder="Add any initial case notes..."
                className="mt-1"
                rows={3}
              />
            </div>
            <Button
              onClick={() => existingQuote && startCaseMutation.mutate({ quoteId: existingQuote.id, notes: caseNotes.trim() || undefined })}
              disabled={startCaseMutation.isPending}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {startCaseMutation.isPending ? 'Starting Case...' : 'Start Case'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}