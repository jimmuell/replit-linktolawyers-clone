import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, Star, CheckCircle, Clock, DollarSign, Users } from 'lucide-react';
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
    queryKey: ['/api/attorneys/case-type', request?.data?.caseType],
    enabled: !!request?.data?.caseType,
  });

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
              onClick={handleBackToForm}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Form</span>
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableAttorneysWithQuotes.map((attorney: any) => (
                  <div key={attorney.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`attorney-${attorney.id}`}
                          checked={selectedQuotes.includes(attorney.id)}
                          onCheckedChange={() => handleQuoteSelection(attorney.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">
                              {attorney.firstName} {attorney.lastName}
                            </h4>
                            {attorney.isVerified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {attorney.firmName} • {attorney.licenseState}
                          </p>
                          <p className="text-sm text-gray-500">
                            {attorney.experienceYears}+ years experience
                          </p>
                          {attorney.practiceAreas && attorney.practiceAreas.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {attorney.practiceAreas.map((area: string, index: number) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {area}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ${attorney.feeSchedule?.flatFee?.toLocaleString() || 'Quote Available'}
                        </div>
                        <p className="text-sm text-gray-500">
                          {attorney.feeSchedule?.feeType || 'Contact for details'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        {selectedQuotes.length > 0 && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleConnectWithAttorneys}
            >
              Request Quotes from Selected Attorneys ({selectedQuotes.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}