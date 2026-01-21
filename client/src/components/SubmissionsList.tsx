import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, UserPlus, Search, Filter, FileText, Clock, Trash2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use different endpoint for attorneys (showAssignButton) vs admins
  const apiEndpoint = showAssignButton ? '/api/attorney-referrals/available' : '/api/structured-intakes';

  const { data: submissionsResponse, isLoading } = useQuery<{ success: boolean; data: StructuredIntake[] }>({
    queryKey: [apiEndpoint],
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
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
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

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return await apiRequest('/api/structured-intakes/bulk-delete', {
        method: 'POST',
        body: { ids },
      });
    },
    onSuccess: (_, deletedIds) => {
      toast({
        title: "Success",
        description: `${deletedIds.length} submission(s) deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      setSelectedIds(new Set());
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete submissions",
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    deleteMutation.mutate(Array.from(selectedIds));
  };

  const uniqueStates = Array.from(new Set(submissions.map(s => s.state).filter((s): s is string => s !== null)));

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

  const calculateCompletionTime = (submission: StructuredIntake): string => {
    const transcript = submission.formResponses?.transcript;
    if (!transcript || transcript.length < 2) return 'N/A';
    
    const firstEntry = transcript[0];
    const lastEntry = transcript[transcript.length - 1];
    
    if (!firstEntry.timestamp || !lastEntry.timestamp) return 'N/A';
    
    try {
      const firstTimestamp = new Date(firstEntry.timestamp).getTime();
      const lastTimestamp = new Date(lastEntry.timestamp).getTime();
      
      if (isNaN(firstTimestamp) || isNaN(lastTimestamp)) return 'N/A';
      
      const diffMs = lastTimestamp - firstTimestamp;
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      
      if (diffMins > 0) {
        return `${diffMins}m ${diffSecs}s`;
      }
      return `${diffSecs}s`;
    } catch {
      return 'N/A';
    }
  };

  const formatTimestamp = (timestamp: string | undefined): string => {
    if (!timestamp) return '--:--:--';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '--:--:--';
      return format(date, 'HH:mm:ss');
    } catch {
      return '--:--:--';
    }
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

            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            )}
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredSubmissions.length > 0 && selectedIds.size === filteredSubmissions.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
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
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(submission.id)}
                          onCheckedChange={(checked) => handleSelectOne(submission.id, checked as boolean)}
                        />
                      </TableCell>
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
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Submission Details
            </DialogTitle>
            <p className="text-gray-500 text-sm">
              Form: {selectedSubmission?.caseType}
            </p>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 mt-4">
              {/* Submission Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Submission Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Submitted At</div>
                    <div className="text-gray-900 font-medium">
                      {format(new Date(selectedSubmission.createdAt), 'MMM d, yyyy, h:mm:ss a')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Completion Time</div>
                    <div className="text-gray-900 font-medium">{calculateCompletionTime(selectedSubmission)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Nodes Visited</div>
                    <div className="text-gray-900 font-medium">{selectedSubmission.formResponses?.transcript?.length || 0}</div>
                  </div>
                </div>
              </div>

              {/* User Journey */}
              {selectedSubmission.formResponses?.transcript && selectedSubmission.formResponses.transcript.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <FileText className="w-5 h-5 text-gray-500" />
                    User Journey
                  </h3>
                  <div className="space-y-4">
                    {selectedSubmission.formResponses.transcript.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          {index < selectedSubmission.formResponses.transcript!.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">
                              {getNodeTypeLabel(entry.nodeType)}
                            </Badge>
                            <span className="text-gray-400 text-sm">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <div className="text-gray-900 mb-1">{entry.question}</div>
                          {entry.answer && (
                            <div className="text-blue-600 text-sm">Response: {entry.answer}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Responses */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  All Responses
                </h3>
                <div className="space-y-4">
                  {Object.entries(selectedSubmission.formResponses?.answers || {}).map(([nodeId, value]) => (
                    <div key={nodeId} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                      <div className="text-gray-400 text-sm font-mono mb-1">{nodeId}</div>
                      <div className="text-gray-900">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              {showAssignButton && (
                <div className="flex justify-end pt-4">
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
