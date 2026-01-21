import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, UserPlus, Search, Filter, FileText, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

interface TranscriptEntry {
  nodeId: string;
  question: string;
  answer: string;
  nodeType: string;
  timestamp?: string;
}

interface FormResponses {
  answers: Record<string, string>;
  additionalDetails?: string;
  transcript?: TranscriptEntry[];
  submittedAt: string;
}

interface StructuredIntake {
  id: number;
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  state: string | null;
  caseType: string;
  role: string | null;
  formResponses: FormResponses;
  attorneyIntakeSummary: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionsListProps {
  title: string;
  showAssignButton?: boolean;
}

export default function SubmissionsList({ title, showAssignButton = false }: SubmissionsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState<StructuredIntake | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissionsResponse, isLoading } = useQuery<{ success: boolean; data: StructuredIntake[] }>({
    queryKey: ['/api/structured-intakes'],
    retry: false,
  });

  const { data: caseTypesData } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/case-types'],
    retry: false,
  });

  const submissions = submissionsResponse?.data || [];
  const caseTypes = caseTypesData?.data || [];

  const assignMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      return await apiRequest(`/api/attorney-referrals/assign-submission/${submissionId}`, {
        method: 'POST',
        body: {},
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submission assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/structured-intakes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-referrals/my-referrals'] });
      setSelectedSubmission(null);
      setIsDetailsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign submission",
        variant: "destructive",
      });
    },
  });

  const filteredSubmissions = submissions.filter((submission) => {
    const searchMatch = !searchQuery || 
      submission.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.caseType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const caseTypeMatch = caseTypeFilter === 'all' || submission.caseType === caseTypeFilter;
    const stateMatch = stateFilter === 'all' || submission.state === stateFilter;
    
    return searchMatch && caseTypeMatch && stateMatch;
  });

  const uniqueStates = [...new Set(submissions.map(s => s.state).filter(Boolean))];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'completed': return 'default';
      case 'assigned': return 'outline';
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

  const getNodeTypeLabel = (nodeType: string): string => {
    const typeMap: Record<string, string> = {
      'start': 'Start',
      'yesNo': 'Yes No',
      'text': 'Text',
      'textInput': 'Text',
      'multipleChoice': 'Multiple Choice',
      'choice': 'Multiple Choice',
      'end': 'End',
      'completion': 'End',
      'success': 'End',
    };
    return typeMap[nodeType] || nodeType;
  };

  const handleViewDetails = (submission: StructuredIntake) => {
    setSelectedSubmission(submission);
    setIsDetailsOpen(true);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">{filteredSubmissions.length} submissions</Badge>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
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
                  <SelectItem value="all">All Case Types</SelectItem>
                  {caseTypes.map((caseType: any) => (
                    <SelectItem key={caseType.id} value={caseType.value}>
                      {caseType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state as string}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No submissions found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Case Type</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.requestNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.firstName} {submission.lastName}</div>
                          <div className="text-sm text-gray-500">{submission.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={submission.caseType}>
                          {submission.caseType}
                        </div>
                      </TableCell>
                      <TableCell>{submission.state || 'Not specified'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(submission.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          
                          {showAssignButton && (
                            <Button 
                              size="sm"
                              onClick={() => assignMutation.mutate(submission.id)}
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Submission Details - {selectedSubmission?.requestNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Client Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm">{selectedSubmission.firstName} {selectedSubmission.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{selectedSubmission.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm">{selectedSubmission.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">State</label>
                    <p className="text-sm">{selectedSubmission.state || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Case Type</label>
                    <p className="text-sm">{selectedSubmission.caseType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={getStatusBadgeVariant(selectedSubmission.status)}>
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedSubmission.formResponses?.transcript && selectedSubmission.formResponses.transcript.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-3">User Journey</h4>
                  <div className="space-y-3">
                    {selectedSubmission.formResponses.transcript.map((entry, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {getNodeTypeLabel(entry.nodeType)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-900">{entry.question}</div>
                          {entry.answer && (
                            <div className="text-sm text-blue-600 mt-1">Response: {entry.answer}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubmission.attorneyIntakeSummary && (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-2">Intake Summary</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.attorneyIntakeSummary}</p>
                </div>
              )}

              {showAssignButton && (
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={() => assignMutation.mutate(selectedSubmission.id)}
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
    </>
  );
}
