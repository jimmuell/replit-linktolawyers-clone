import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, User, Mail, Phone, MapPin, FileText, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
  urgencyLevel: string;
  budgetRange: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrackRequestModal({ isOpen, onClose }: TrackRequestModalProps) {
  const [requestNumber, setRequestNumber] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: request, isLoading, error, refetch } = useQuery<LegalRequest>({
    queryKey: ['/api/legal-requests', requestNumber],
    queryFn: async () => {
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

  const handleTrackRequest = () => {
    if (requestNumber.trim()) {
      setShouldFetch(true);
      refetch();
    }
  };

  const handleClose = () => {
    setRequestNumber('');
    setShouldFetch(false);
    onClose();
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'moderate':
        return <Badge variant="secondary">Moderate</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency || 'Not specified'}</Badge>;
    }
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
              <div className="flex space-x-2">
                <Input
                  id="requestNumber"
                  placeholder="Enter your request number (e.g., lr-123456)"
                  value={requestNumber}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrackRequest}
                  disabled={!requestNumber.trim() || isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? 'Searching...' : 'Track'}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Your request number was provided when you submitted your legal quote request. 
              It should look like "lr-123456".
            </p>
          </div>

          {/* Error State */}
          {error && (
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Urgency Level</Label>
                    <div>{getUrgencyBadge(request.urgencyLevel)}</div>
                  </div>
                  {request.budgetRange && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Budget Range</span>
                      </Label>
                      <p className="text-sm">{request.budgetRange}</p>
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
                    <li>• Our system is matching you with qualified attorneys</li>
                    <li>• You'll receive personalized quotes</li>
                    <li>• Check your email (including spam folder) for updates</li>
                    <li>• You can track your request anytime using this number</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}