import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Star, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery } from '@tanstack/react-query';

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
  id: number;
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  caseType: string;
  description: string;
  preferredLanguage: string;
  status: string;
  submittedAt: string;
}

export default function QuotesPage() {
  const [match, params] = useRoute('/quotes/:requestNumber');
  const requestNumber = params?.requestNumber;
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([]);

  // Fetch request details
  const { data: request } = useQuery<LegalRequest>({
    queryKey: ['/api/legal-requests', requestNumber],
    enabled: !!requestNumber,
  });

  // Fetch attorney assignments
  const { data: quotesResponse, isLoading: quotesLoading, error: quotesError } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ['/api/attorney-referrals/public/request', request?.id, 'attorneys'],
    enabled: !!request?.id,
  });

  // Transform the API response to match the expected Quote[] format
  const quotesData: Quote[] = quotesResponse?.data?.map((item: any) => ({
    id: item.assignment.id,
    assignment: item.assignment,
    attorney: item.attorney,
    quoteStatus: item.quoteStatus,
    quoteAmount: item.quoteAmount,
    quoteSentAt: item.quoteSentAt
  })) || [];

  const handleConnectWithAttorneys = () => {
    // TODO: Implement attorney connection logic
    // This could involve updating quote status to "accepted" for selected attorneys
    // and sending notifications to selected attorneys
    console.log('Connecting with selected attorneys:', selectedQuotes);
    alert(`Connecting with ${selectedQuotes.length} selected attorney(s). They will be notified of your interest and will contact you directly.`);
  };

  const handleBackToForm = () => {
    window.location.href = '/';
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

  const quotedAttorneys = quotesData?.filter(q => q.quoteStatus === 'sent') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToForm}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Form</span>
            </Button>

            <h1 className="text-xl font-semibold text-gray-900">
              Your Attorney Quotes
            </h1>

            <div className="text-sm text-gray-500">
              {quotedAttorneys.length} quotes found
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quote Summary */}
        {request && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quote Summary for {request.firstName} {request.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-600">Case Type:</span>
                  <p className="text-sm text-gray-900 mt-1">{request.caseType}</p>
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

        {/* Attorney Quotes */}
        <div className="space-y-6">
          {quotedAttorneys.map((quote) => (
            <Card key={quote.assignment.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Checkbox
                      checked={selectedQuotes.includes(quote.assignment.id)}
                      onCheckedChange={() => handleQuoteSelection(quote.assignment.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {quote.attorney.firstName} {quote.attorney.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{quote.attorney.firmName}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500">
                              {quote.attorney.licenseState}
                            </span>
                            <span className="text-sm text-gray-500">
                              {quote.attorney.experienceYears}+ years
                            </span>
                            {quote.attorney.isVerified && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-500">(30 reviews)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ${quote.quoteAmount?.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">$345/hour</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-3">
                        {quote.attorney.bio}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Timeline</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">2-4 weeks</p>

                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">Specialties</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {quote.attorney.practiceAreas?.map((area, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Button */}
        {selectedQuotes.length > 0 && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleConnectWithAttorneys}
            >
              Connect with Selected Attorneys ({selectedQuotes.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}