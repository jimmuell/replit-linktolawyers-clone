import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, MessageSquare, DollarSign, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MyReferral {
  assignmentId: number;
  assignmentStatus: string;
  assignedAt: string;
  notes: string;
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

export default function MyReferralsList() {
  const [selectedReferral, setSelectedReferral] = useState<MyReferral | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [infoRequest, setInfoRequest] = useState({ subject: '', message: '' });
  const [quote, setQuote] = useState({ serviceFee: '', description: '', terms: '', validUntil: '' });
  const [note, setNote] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch my referrals
  const { data: referralsData, isLoading } = useQuery({
    queryKey: ['/api/attorney-referrals/my-referrals'],
    retry: false,
  });

  const referrals = referralsData?.data || [];

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
      setIsQuoteModalOpen(false);
      setQuote({ serviceFee: '', description: '', terms: '', validUntil: '' });
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
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedReferral(referral)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Referral Details - {selectedReferral?.request.requestNumber}</DialogTitle>
                              </DialogHeader>
                              {selectedReferral && (
                                <div className="space-y-4">
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
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Description</label>
                                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedReferral.request.caseDescription}</p>
                                  </div>
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
                                  {selectedReferral.notes && (
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">Assignment Notes</label>
                                      <p className="text-sm mt-1 p-3 bg-blue-50 rounded-md">{selectedReferral.notes}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {referral.assignmentStatus === 'assigned' && (
                            <Button 
                              size="sm"
                              variant="default"
                              onClick={() => updateStatusMutation.mutate({ 
                                assignmentId: referral.assignmentId, 
                                status: 'under_review' 
                              })}
                              disabled={updateStatusMutation.isPending}
                            >
                              Start Review
                            </Button>
                          )}
                          
                          {(referral.assignmentStatus === 'under_review' || referral.assignmentStatus === 'assigned') && (
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReferral(referral);
                                setIsInfoModalOpen(true);
                              }}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Request Info
                            </Button>
                          )}
                          
                          {(referral.assignmentStatus === 'ready_to_quote' || referral.assignmentStatus === 'under_review') && (
                            <Button 
                              size="sm"
                              variant="default"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedReferral(referral);
                                setIsQuoteModalOpen(true);
                              }}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Quote
                            </Button>
                          )}
                          
                          <Button 
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedReferral(referral);
                              setIsNotesModalOpen(true);
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Note
                          </Button>
                        </div>
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
            <div>
              <Label htmlFor="serviceFee">Service Fee ($)</Label>
              <Input
                id="serviceFee"
                type="number"
                step="0.01"
                value={quote.serviceFee}
                onChange={(e) => setQuote(prev => ({ ...prev, serviceFee: e.target.value }))}
                placeholder="0.00"
              />
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
              <Button variant="outline" onClick={() => setIsQuoteModalOpen(false)}>
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
    </>
  );
}