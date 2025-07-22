import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, User, Mail, Phone, MapPin, FileText, DollarSign, ChevronDown, ChevronUp, Star, Award, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getStatusInfo } from '@shared/statusCodes';

interface TrackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LegalRequest {
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
  updatedAt: string;
}

interface Quote {
  quote: {
    id: number;
    serviceFee: number;
    description: string;
    terms: string;
    validUntil: string;
    status: string;
    sentAt: string;
  };
  attorney: {
    id: number;
    firstName: string;
    lastName: string;
    firmName: string;
    licenseState: string;
    practiceAreas: string[];
    experienceYears: number;
    isVerified: boolean;
    bio: string;
  };
  assignment: {
    id: number;
    status: string;
  };
}

interface AssignedAttorney {
  assignment: {
    id: number;
    status: string;
    assignedAt: string;
  };
  attorney: {
    id: number;
    firstName: string;
    lastName: string;
    firmName?: string;
    licenseState?: string;
    practiceAreas?: string[];
    experienceYears?: number;
    isVerified: boolean;
    bio?: string;
  };
  quoteStatus: 'pending' | 'sent' | 'accepted' | 'declined';
}

export default function TrackRequestModal({ isOpen, onClose }: TrackRequestModalProps) {
  const [requestNumber, setRequestNumber] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'accept' | 'decline';
    quoteId: number;
    attorneyName: string;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: request, isLoading, error, refetch } = useQuery<LegalRequest>({
    queryKey: ['/api/legal-requests', shouldFetch ? requestNumber : 'disabled'],
    queryFn: async () => {
      if (!shouldFetch) {
        throw new Error('Query should not run');
      }
      const response = await fetch(`/api/legal-requests/${requestNumber}`);
      if (!response.ok) {
        throw new Error('Request not found');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: shouldFetch && requestNumber.length > 0,
    retry: false,
  });

  // Fetch assigned attorneys for the request
  const { data: assignedAttorneysData } = useQuery<AssignedAttorney[]>({
    queryKey: ['/api/attorney-referrals/public/request', request?.id, 'attorneys'],
    queryFn: async () => {
      const response = await fetch(`/api/attorney-referrals/public/request/${request!.id}/attorneys`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned attorneys');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!request?.id,
    retry: false,
    staleTime: 0, // Always refetch to get latest assignment status
    gcTime: 0, // Don't cache
  });

  // Fetch quotes for the request
  const { data: quotesData } = useQuery<Quote[]>({
    queryKey: ['/api/attorney-referrals/public/request', request?.id, 'quotes'],
    queryFn: async () => {
      const response = await fetch(`/api/attorney-referrals/public/request/${request!.id}/quotes`);
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!request?.id,
    retry: false,
    staleTime: 0, // Always refetch to get latest quote status
    gcTime: 0, // Don't cache
  });

  const assignedAttorneys = assignedAttorneysData || [];
  const quotes = quotesData || [];

  const handleTrackRequest = () => {
    if (requestNumber.trim()) {
      setShouldFetch(true);
      refetch();
    }
  };

  const handleClose = () => {
    setRequestNumber('');
    setShouldFetch(false);
    setExpandedQuote(null);
    setConfirmDialog(null);
    // Clear any cached error state
    queryClient.removeQueries({ queryKey: ['/api/legal-requests'] });
    onClose();
  };

  // Mutation for updating quote status
  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: number; status: 'accepted' | 'declined' }) => {
      return apiRequest(`/api/attorney-referrals/quotes/${quoteId}/status`, {
        method: 'PATCH',
        body: { status }
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.status === 'accepted' ? 'Quote Accepted' : 'Quote Declined',
        description: variables.status === 'accepted' 
          ? 'You have successfully accepted this quote. The attorney will be notified.'
          : 'You have declined this quote. The attorney will be notified.',
      });
      
      // Invalidate quotes query to refresh the data
      if (request) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/attorney-referrals/public/request', request.id, 'quotes'] 
        });
      }
      setConfirmDialog(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update quote status. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating quote status:', error);
    }
  });

  const handleAcceptQuote = (quoteId: number, attorneyName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'accept',
      quoteId,
      attorneyName
    });
  };

  const handleDeclineQuote = (quoteId: number, attorneyName: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'decline',
      quoteId,
      attorneyName
    });
  };

  const confirmQuoteAction = () => {
    if (confirmDialog) {
      updateQuoteStatusMutation.mutate({
        quoteId: confirmDialog.quoteId,
        status: confirmDialog.type === 'accept' ? 'accepted' : 'declined'
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const toggleQuoteExpansion = (quoteId: number) => {
    setExpandedQuote(expandedQuote === quoteId ? null : quoteId);
  };



  const formatRequestNumber = (value: string) => {
    // Remove any non-alphanumeric characters and convert to lowercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Add "lr-" prefix if not present
    if (cleaned.startsWith('lr')) {
      if (cleaned.length > 2 && cleaned[2] !== '-') {
        return 'lr-' + cleaned.slice(2);
      }
      return cleaned;
    } else if (cleaned.length > 0) {
      return 'lr-' + cleaned;
    }
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRequestNumber(e.target.value);
    setRequestNumber(formatted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Track Your Request</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Enter your legal request number to check the status of your quote request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestNumber">Legal Request Number</Label>
              <form onSubmit={(e) => { e.preventDefault(); handleTrackRequest(); }}>
                <div className="flex space-x-2">
                  <Input
                    id="requestNumber"
                    placeholder="Enter your request number (e.g., lr-123456)"
                    value={requestNumber}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTrackRequest();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    type="button"
                    onClick={handleTrackRequest}
                    disabled={!requestNumber.trim() || isLoading}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Searching...' : 'Track'}
                  </Button>
                </div>
              </form>
            </div>
            
            <p className="text-sm text-gray-500">
              Your request number was provided when you submitted your legal quote request. 
              It should look like "lr-123456".
            </p>
          </div>

          {/* Error State - Only show if user has attempted a search */}
          {error && shouldFetch && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Request Not Found</span>
                </div>
                <p className="mt-2 text-sm text-red-600">
                  We couldn't find a request with number "{requestNumber}". 
                  Please check your request number and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Request Details */}
          {request && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Request Details</span>
                </CardTitle>
                <CardDescription>
                  Request submitted on {format(new Date(request.createdAt), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Request Number</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{request.requestNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <Badge variant={getStatusInfo(request.status).color === 'green' ? 'default' : 
                                   getStatusInfo(request.status).color === 'yellow' ? 'secondary' : 
                                   getStatusInfo(request.status).color === 'red' ? 'destructive' : 'outline'}>
                        {getStatusInfo(request.status).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Client Name</span>
                    </Label>
                    <p className="text-sm">{request.firstName} {request.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </Label>
                    <p className="text-sm">{request.email}</p>
                  </div>
                  {request.phoneNumber && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>Phone</span>
                      </Label>
                      <p className="text-sm">{request.phoneNumber}</p>
                    </div>
                  )}
                  {request.location && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </Label>
                      <p className="text-sm">{request.location}</p>
                    </div>
                  )}

                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Case Type</Label>
                  <p className="text-sm">{request.caseType}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Case Description</Label>
                  <p className="text-sm text-gray-700 leading-relaxed">{request.caseDescription}</p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
                  <p className="text-sm text-blue-800 mb-3">{getStatusInfo(request.status).description}</p>
                  <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {assignedAttorneys.length > 0 ? (
                      <>
                        <li>• {assignedAttorneys.length} attorney(s) have been assigned to your case</li>
                        <li>• Assigned attorneys will review your case and provide personalized quotes</li>
                        <li>• You'll receive email notifications when quotes are available</li>
                        <li>• Check your email (including spam folder) for updates</li>
                      </>
                    ) : (
                      <>
                        <li>• Our system is matching you with qualified attorneys</li>
                        <li>• You'll receive personalized quotes once attorneys are assigned</li>
                        <li>• Check your email (including spam folder) for updates</li>
                        <li>• You can track your request anytime using this number</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Attorneys Section */}
          {request && assignedAttorneys.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Assigned Attorneys ({assignedAttorneys.length})</span>
                </CardTitle>
                <CardDescription>
                  These attorneys have been assigned to your case and will be working on providing you with quotes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignedAttorneys.map((assignedAttorney) => (
                  <div key={assignedAttorney.assignment.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {assignedAttorney.attorney.firstName} {assignedAttorney.attorney.lastName}
                            </span>
                            {assignedAttorney.attorney.isVerified && (
                              <Award className="w-4 h-4 text-blue-500" title="Verified Attorney" />
                            )}
                          </div>
                          {assignedAttorney.attorney.firmName && (
                            <span className="text-sm text-gray-600">
                              at {assignedAttorney.attorney.firmName}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">Assigned on:</span>
                            <span className="text-sm font-medium">
                              {format(new Date(assignedAttorney.assignment.assignedAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <span className="text-sm text-gray-600">Quote Status:</span>
                            <Badge variant={
                              assignedAttorney.quoteStatus === 'sent' ? 'default' :
                              assignedAttorney.quoteStatus === 'accepted' ? 'default' :
                              assignedAttorney.quoteStatus === 'declined' ? 'destructive' :
                              'secondary'
                            }>
                              {assignedAttorney.quoteStatus === 'pending' ? 'Quote Pending' :
                               assignedAttorney.quoteStatus === 'sent' ? 'Quote Sent' :
                               assignedAttorney.quoteStatus === 'accepted' ? 'Quote Accepted' :
                               'Quote Declined'}
                            </Badge>
                          </div>
                        </div>

                        {assignedAttorney.attorney.licenseState && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Licensed in: </span>
                            <span className="text-sm font-medium">{assignedAttorney.attorney.licenseState}</span>
                          </div>
                        )}

                        {assignedAttorney.attorney.experienceYears && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-600">Experience: </span>
                            <span className="text-sm font-medium">{assignedAttorney.attorney.experienceYears} years</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Attorney Quotes Section */}
          {request && quotes.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Attorney Quotes ({quotes.length})</span>
                </CardTitle>
                <CardDescription>
                  Attorneys have provided quotes for your case. Review and compare their proposals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quotes.map((quoteData) => {
                  const isExpanded = expandedQuote === quoteData.quote.id;
                  
                  return (
                    <div key={quoteData.quote.id} className="border rounded-lg p-4 bg-white">
                      {/* Condensed Quote Display */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">
                                {quoteData.attorney.firstName} {quoteData.attorney.lastName}
                              </span>
                              {quoteData.attorney.isVerified && (
                                <Award className="w-4 h-4 text-blue-500" title="Verified Attorney" />
                              )}
                            </div>
                            {quoteData.attorney.firmName && (
                              <span className="text-sm text-gray-600">
                                at {quoteData.attorney.firmName}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-semibold text-green-700">
                                {formatCurrency(quoteData.quote.serviceFee)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {quoteData.attorney.experienceYears}+ years experience
                            </div>
                            <div className="text-sm text-gray-600">
                              {quoteData.attorney.licenseState}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleQuoteExpansion(quoteData.quote.id)}
                          className="ml-4"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Details
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Expanded Quote Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Service Description</Label>
                              <p className="text-sm mt-1">{quoteData.quote.description}</p>
                            </div>
                            
                            {quoteData.quote.terms && (
                              <div>
                                <Label className="text-sm font-medium text-gray-600">Terms & Conditions</Label>
                                <p className="text-sm mt-1">{quoteData.quote.terms}</p>
                              </div>
                            )}
                          </div>

                          {quoteData.quote.validUntil && (
                            <div>
                              <Label className="text-sm font-medium text-gray-600">Quote Valid Until</Label>
                              <p className="text-sm mt-1">
                                {format(new Date(quoteData.quote.validUntil), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          )}

                          {/* Attorney Profile */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <h4 className="font-medium text-gray-900">Attorney Profile</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Experience</Label>
                                <p className="text-sm">{quoteData.attorney.experienceYears} years</p>
                              </div>
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Licensed in</Label>
                                <p className="text-sm">{quoteData.attorney.licenseState}</p>
                              </div>
                            </div>

                            {quoteData.attorney.practiceAreas && quoteData.attorney.practiceAreas.length > 0 && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600">Practice Areas</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {quoteData.attorney.practiceAreas.map((area, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {area}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {quoteData.attorney.bio && (
                              <div>
                                <Label className="text-xs font-medium text-gray-600">About</Label>
                                <p className="text-sm mt-1 text-gray-700">{quoteData.attorney.bio}</p>
                              </div>
                            )}
                          </div>

                          {/* Quote Status Badge and Action Buttons */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs font-medium text-gray-600">Quote Status:</Label>
                              <Badge 
                                variant={
                                  quoteData.quote.status === 'accepted' ? 'default' :
                                  quoteData.quote.status === 'declined' ? 'destructive' : 
                                  'secondary'
                                }
                                className={
                                  quoteData.quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  quoteData.quote.status === 'declined' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {quoteData.quote.status === 'pending' ? 'Pending' :
                                 quoteData.quote.status === 'accepted' ? 'Accepted' :
                                 quoteData.quote.status === 'declined' ? 'Declined' : 
                                 quoteData.quote.status}
                              </Badge>
                            </div>
                            
                            {quoteData.quote.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAcceptQuote(quoteData.quote.id, `${quoteData.attorney.firstName} ${quoteData.attorney.lastName}`)}
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={updateQuoteStatusMutation.isPending}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept Quote
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeclineQuote(quoteData.quote.id, `${quoteData.attorney.firstName} ${quoteData.attorney.lastName}`)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  disabled={updateQuoteStatusMutation.isPending}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Decline Quote
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close Request
          </Button>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog?.isOpen || false} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog?.type === 'accept' ? 'Accept Quote' : 'Decline Quote'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog?.type === 'accept' 
                ? `Are you sure you want to accept the quote from ${confirmDialog?.attorneyName}? This will notify the attorney that you've chosen their services.`
                : `Are you sure you want to decline the quote from ${confirmDialog?.attorneyName}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmQuoteAction}
              disabled={updateQuoteStatusMutation.isPending}
              className={confirmDialog?.type === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {updateQuoteStatusMutation.isPending 
                ? 'Processing...' 
                : confirmDialog?.type === 'accept' ? 'Accept Quote' : 'Decline Quote'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}