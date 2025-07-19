import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, UserPlus, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LegalRequest } from '@shared/schema';

interface ReferralListProps {
  title: string;
  endpoint: string;
  showAssignButton?: boolean;
}

export default function ReferralList({ title, endpoint, showAssignButton = false }: ReferralListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedReferral, setSelectedReferral] = useState<LegalRequest | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch referrals
  const { data: referralsData, isLoading } = useQuery({
    queryKey: [endpoint, { caseType: caseTypeFilter, location: locationFilter, sortBy, sortOrder }],
    retry: false,
  });

  // Fetch case types for filter dropdown
  const { data: caseTypesData } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
  });

  const referrals = referralsData?.data || [];
  const caseTypes = caseTypesData?.data || [];

  // Assign referral mutation
  const assignMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest(`/api/attorney-referrals/assign/${requestId}`, {
        method: 'POST',
        body: {},
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Referral assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      setSelectedReferral(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign referral",
        variant: "destructive",
      });
    },
  });

  // Filter referrals based on search query
  const filteredReferrals = referrals.filter((referral: LegalRequest) => {
    const searchMatch = !searchQuery || 
      referral.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.caseDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    return searchMatch;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'under_review': return 'secondary';
      case 'attorney_matching': return 'outline';
      case 'quotes_requested': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{filteredReferrals.length} referrals</Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search referrals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Case Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Case Types</SelectItem>
                {caseTypes.map((caseType: any) => (
                  <SelectItem key={caseType.id} value={caseType.value}>
                    {caseType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Locations</SelectItem>
              {/* Add common locations here */}
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="Texas">Texas</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="Florida">Florida</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredReferrals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No referrals found matching your criteria.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral: LegalRequest) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.requestNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referral.firstName} {referral.lastName}</div>
                        <div className="text-sm text-gray-500">{referral.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={referral.caseType}>
                        {referral.caseType}
                      </div>
                    </TableCell>
                    <TableCell>{referral.location || 'Not specified'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(referral.status)}>
                        {referral.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(referral.createdAt)}</TableCell>
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
                              <DialogTitle>Referral Details - {selectedReferral?.requestNumber}</DialogTitle>
                            </DialogHeader>
                            {selectedReferral && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Client Name</label>
                                    <p className="text-sm">{selectedReferral.firstName} {selectedReferral.lastName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <p className="text-sm">{selectedReferral.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Phone</label>
                                    <p className="text-sm">{selectedReferral.phoneNumber || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Location</label>
                                    <p className="text-sm">{selectedReferral.location || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Case Type</label>
                                    <p className="text-sm">{selectedReferral.caseType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <Badge variant={getStatusBadgeVariant(selectedReferral.status)}>
                                      {selectedReferral.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Case Description</label>
                                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedReferral.caseDescription}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Submitted</label>
                                  <p className="text-sm">{formatDate(selectedReferral.createdAt)}</p>
                                </div>
                                {showAssignButton && (
                                  <div className="flex justify-end pt-4 border-t">
                                    <Button 
                                      onClick={() => assignMutation.mutate(selectedReferral.id)}
                                      disabled={assignMutation.isPending}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      {assignMutation.isPending ? 'Assigning...' : 'Assign to Me'}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {showAssignButton && (
                          <Button 
                            size="sm"
                            onClick={() => assignMutation.mutate(referral.id)}
                            disabled={assignMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        )}
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
  );
}