import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Star, CheckCircle, Clock, DollarSign, Users, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Quote {
  id: number;
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
  quoteAmount?: number;
  quoteSentAt?: string;
  service_fee?: number;
  description?: string;
  terms?: string;
  valid_until?: string;
}

interface LegalRequest {
  success: boolean;
  data: {
    id: number;
    requestNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    caseType: string;
    caseDescription: string;
    location: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function QuotesPage() {
  const [match, params] = useRoute('/quotes/:requestNumber');
  const requestNumber = params?.requestNumber;
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch request details
  const { data: request } = useQuery<LegalRequest>({
    queryKey: ['/api/legal-requests', requestNumber],
    enabled: !!requestNumber,
  });

  // Fetch case types for display mapping
  const { data: caseTypesResponse } = useQuery<{success: boolean, data: {value: string, label: string}[]}>({
    queryKey: ['/api/case-types'],
  });

  const caseTypes = caseTypesResponse?.data || [];

  // Fetch available attorneys by case type (same as admin dashboard)
  const { data: availableAttorneys, isLoading: attorneysLoading } = useQuery<any[]>({
    queryKey: ['/api/public/attorneys/case-type', request?.data?.caseType],
    enabled: !!request?.data?.caseType,
  });

  // Mutation to assign attorneys to request (using public endpoint)
  const assignAttorneysMutation = useMutation({
    mutationFn: async ({ requestId, attorneyIds }: { requestId: number; attorneyIds: number[] }) => {
      return apiRequest(`/api/public/requests/${requestId}/attorneys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attorneyIds })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-requests'] });
    }
  });

  // Mutation to send attorney notification emails (using public endpoint)
  const sendEmailMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest(`/api/public/requests/${requestId}/send-attorney-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
  });

  const handleConnectWithAttorneys = async () => {
    if (!request?.data || selectedQuotes.length === 0) return;
    
    setIsAssigning(true);
    
    try {
      // First, assign attorneys to the request
      await assignAttorneysMutation.mutateAsync({
        requestId: request.data.id,
        attorneyIds: selectedQuotes
      });
      
      // Then send notification emails to the assigned attorneys
      await sendEmailMutation.mutateAsync(request.data.id);
      
      toast({
        title: "Success",
        description: `${selectedQuotes.length} attorney(s) have been assigned and notified.`
      });
      
      // Show confirmation dialog
      setShowConfirmDialog(true);
      
    } catch (error: any) {
      console.error('Error assigning attorneys:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign attorneys. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmRequest = () => {
    // TODO: Implement actual quote request logic
    console.log('Quote request confirmed for attorneys:', selectedQuotes);
    setShowConfirmDialog(false);
    // Reset selections after confirmation
    setSelectedQuotes([]);
  };

  const handleSaveAndReturn = () => {
    setIsSaved(true);
    // Add a slight delay to show the checkmark before navigating
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const handleQuoteSelection = (quoteId: number) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  if (!match || !requestNumber) {
    return <div>Invalid request</div>;
  }

  // Filter attorneys that have quotes/assignments for this case type
  const availableAttorneysWithQuotes = availableAttorneys || [];

  // Get human-readable case type
  const getCaseTypeLabel = (caseTypeValue: string) => {
    const caseType = caseTypes?.find(ct => ct.value === caseTypeValue);
    return caseType?.label || caseTypeValue;
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSaveAndReturn}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              <span>Save & Return Later</span>
            </Button>

            <h1 className="text-xl font-semibold text-gray-900">
              Available Attorneys
            </h1>

            <div className="text-sm text-gray-500">
              {availableAttorneysWithQuotes.length} attorneys available
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quote Summary */}
        {request?.data && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quote Summary for {request.data.firstName} {request.data.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-600">Case Type:</span>
                  <p className="text-sm text-gray-900 mt-1">{getCaseTypeLabel(request.data.caseType)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Timeline:</span>
                  <p className="text-sm text-gray-900 mt-1">3-6 months</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Budget:</span>
                  <p className="text-sm text-gray-900 mt-1">5k-10k</p>
                </div>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  Review the quotes below and select the attorneys you'd like to connect with. Selected attorneys will be notified of your 
                  interest and will contact you directly to schedule consultations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Attorneys - matching admin dashboard format exactly */}
        {attorneysLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attorneys...</p>
          </div>
        ) : availableAttorneysWithQuotes.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No attorneys available for this case type</p>
            <p className="text-sm text-gray-500 mt-2">
              Please ensure attorneys have fee schedules set up for "{getCaseTypeLabel(request?.data?.caseType || '')}"
            </p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-medium mb-3">Available Attorneys ({availableAttorneysWithQuotes.length})</h3>
              <div className="space-y-6">
                {availableAttorneysWithQuotes.map((attorney: any) => (
                  <Card key={attorney.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            id={`attorney-${attorney.id}`}
                            checked={selectedQuotes.includes(attorney.id)}
                            onCheckedChange={() => handleQuoteSelection(attorney.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {attorney.firstName} {attorney.lastName}
                              </h3>
                              {attorney.isVerified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{attorney.firmName}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                {attorney.licenseState}
                              </span>
                              <span className="text-sm text-gray-500">
                                {attorney.experienceYears}+ years
                              </span>
                              {attorney.isVerified && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-500">5 (30 reviews)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ${attorney.fee ? (attorney.fee / 100).toLocaleString() : '1,555'}
                          </div>
                          <div className="text-sm text-gray-500">${attorney.hourlyRate ? (attorney.hourlyRate / 100).toLocaleString() : '195'}/hour</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-6">
                        {attorney.bio || `With ${attorney.experienceYears} years of experience in immigration law, I'm committed to providing you with expert legal representation tailored to your specific needs.`}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Timeline</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">2-4 weeks</p>

                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">Specialties</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {attorney.practiceAreas?.map((area: string, index: number) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                  {area}
                                </span>
                              )) || (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                    Immigration Law
                                  </span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                    Deportation Defense
                                  </span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                    Asylum Cases
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Payment Options</span>
                          </div>
                          <div className="ml-6 space-y-1">
                            <p className="text-sm text-gray-900">Hourly</p>
                            <p className="text-sm text-gray-900">Flat Fee</p>
                          </div>

                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">What's Included</span>
                            <div className="ml-6 mt-2 space-y-1">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Initial consultation and case assessment</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Legal strategy development</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Document preparation and review</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Filing of all necessary forms</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Regular case updates and communication</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Floating Action Button */}
        {selectedQuotes.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Button 
              size="lg" 
              className="bg-black hover:bg-gray-800 text-white rounded-lg px-8 py-4 shadow-lg"
              onClick={handleConnectWithAttorneys}
              disabled={isAssigning}
            >
              {isAssigning ? 'Assigning attorneys...' : `Selected attorneys (${selectedQuotes.length})`}
            </Button>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirmation Email Sent!</DialogTitle>
              <DialogDescription>
                We've sent you a confirmation email with all the details about your selected attorneys.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-600 font-bold">
                Please check your spam or junk folder if you don't see the email in your inbox.
              </p>
              <p className="text-sm text-gray-600">
                The selected attorneys have also been notified and will contact you directly within 24 hours.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleConfirmRequest} className="bg-black hover:bg-gray-800 text-white">
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}