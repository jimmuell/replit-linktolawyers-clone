import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import AdminNavbar from '@/components/AdminNavbar';
import { Eye, Trash2, Download, FileText, MessageSquare, ChevronRight, ChevronDown, CheckCircle2, Clock, UserPlus, UserMinus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';

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

interface AssignedAttorney {
  assignmentId: number;
  attorneyId: number;
  firstName: string;
  lastName: string;
  email: string;
  firmName: string;
  status: string;
  emailSent: boolean;
  emailSentAt: string | null;
  assignedAt: string;
}

interface Attorney {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  firmName: string;
  isVerified: boolean;
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
  assignedAttorneys: AssignedAttorney[];
}

interface FormGroup {
  caseType: string;
  displayName: string;
  submissions: StructuredIntake[];
  latestSubmission: string;
}

export default function SubmissionsPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<StructuredIntake | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<number[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAttorneyIds, setSelectedAttorneyIds] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const { data: intakesResponse, isLoading, error } = useQuery<{ success: boolean; data: StructuredIntake[] }>({
    queryKey: ['/api/structured-intakes'],
    retry: false,
  });

  const intakes = intakesResponse?.data || [];

  const { data: attorneysResponse } = useQuery<Attorney[]>({
    queryKey: ['/api/attorneys'],
    retry: false,
  });

  const allAttorneys: Attorney[] = Array.isArray(attorneysResponse) ? attorneysResponse : [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/structured-intakes/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/structured-intakes'] });
      toast({
        title: "Submission deleted",
        description: "The submission has been successfully deleted.",
      });
      setIsDeleteModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedSubmission(null);
    },
    onError: () => {
      toast({
        title: "Failed to delete submission",
        description: "An error occurred while deleting the submission.",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return await apiRequest('/api/structured-intakes/bulk-delete', {
        method: 'POST',
        body: { ids },
      });
    },
    onSuccess: (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ['/api/structured-intakes'] });
      toast({
        title: "Submissions deleted",
        description: `${deletedIds.length} submission(s) have been successfully deleted.`,
      });
      setSelectedSubmissionIds([]);
    },
    onError: () => {
      toast({
        title: "Failed to delete submissions",
        description: "An error occurred while deleting the submissions.",
        variant: "destructive",
      });
    },
  });

  const assignAttorneysMutation = useMutation({
    mutationFn: async ({ submissionId, attorneyIds }: { submissionId: number; attorneyIds: number[] }) => {
      return await apiRequest(`/api/structured-intakes/${submissionId}/attorneys`, {
        method: 'POST',
        body: { attorneyIds },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/structured-intakes'] });
      toast({
        title: "Attorneys updated",
        description: "Attorney assignments have been updated successfully.",
      });
      setIsAssignModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to update attorneys",
        description: "An error occurred while updating attorney assignments.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (selectedSubmission && intakes.length > 0) {
      const updated = intakes.find(i => i.id === selectedSubmission.id);
      if (updated) {
        setSelectedSubmission(updated);
      }
    }
  }, [intakes]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const formGroups: FormGroup[] = Object.values(
    intakes.reduce((acc: Record<string, FormGroup>, intake) => {
      const caseType = intake.caseType;
      if (!acc[caseType]) {
        acc[caseType] = {
          caseType,
          displayName: caseType,
          submissions: [],
          latestSubmission: intake.createdAt,
        };
      }
      acc[caseType].submissions.push(intake);
      if (new Date(intake.createdAt) > new Date(acc[caseType].latestSubmission)) {
        acc[caseType].latestSubmission = intake.createdAt;
      }
      return acc;
    }, {})
  );

  const totalSubmissions = intakes.length;
  const totalForms = formGroups.length;

  const toggleFormExpansion = (caseType: string) => {
    setExpandedForms(prev => {
      const next = new Set(prev);
      if (next.has(caseType)) {
        next.delete(caseType);
      } else {
        next.add(caseType);
      }
      return next;
    });
  };

  const handleViewDetails = (submission: StructuredIntake) => {
    setSelectedSubmission(submission);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (submission: StructuredIntake) => {
    setSelectedSubmission(submission);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedSubmission) {
      deleteMutation.mutate(selectedSubmission.id);
    }
  };

  const handleOpenAssignModal = () => {
    if (selectedSubmission) {
      setSelectedAttorneyIds(selectedSubmission.assignedAttorneys.map(a => a.attorneyId));
      setIsAssignModalOpen(true);
    }
  };

  const handleSaveAssignments = () => {
    if (selectedSubmission) {
      assignAttorneysMutation.mutate({
        submissionId: selectedSubmission.id,
        attorneyIds: selectedAttorneyIds,
      });
    }
  };

  const handleUnassignAttorney = (attorneyId: number) => {
    if (selectedSubmission) {
      const newIds = selectedSubmission.assignedAttorneys
        .map(a => a.attorneyId)
        .filter(id => id !== attorneyId);
      assignAttorneysMutation.mutate({
        submissionId: selectedSubmission.id,
        attorneyIds: newIds,
      });
    }
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
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    } catch {
      return 'N/A';
    }
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

  const exportToCSV = (formGroup: FormGroup) => {
    const headers = ['Request Number', 'Name', 'Email', 'Phone', 'State', 'Status', 'Assigned Attorneys', 'Submitted At'];
    const rows = formGroup.submissions.map(s => [
      s.requestNumber,
      `${s.firstName} ${s.lastName}`,
      s.email,
      s.phoneNumber || '',
      s.state || '',
      s.status,
      s.assignedAttorneys?.map(a => `${a.firstName} ${a.lastName}`).join('; ') || 'Unassigned',
      format(new Date(s.createdAt), 'MMM d, yyyy h:mm a')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formGroup.caseType}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Submissions" />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">All Submissions</h1>
            <p className="text-gray-600 mt-1">
              {totalSubmissions} total submission{totalSubmissions !== 1 ? 's' : ''} across {totalForms} form{totalForms !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr,120px,140px,120px] gap-4 px-6 py-3 border-b border-gray-200 text-sm text-gray-500 font-medium bg-gray-50">
              <div>Form Name</div>
              <div>Status</div>
              <div>Submissions</div>
              <div>Last Updated</div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading submissions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading submissions. Please try again.</p>
              </div>
            ) : formGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No submissions found.</p>
              </div>
            ) : (
              formGroups.map((formGroup) => (
                <div key={formGroup.caseType} className="border-b border-gray-200 last:border-b-0">
                  <div 
                    className="grid grid-cols-[1fr,120px,140px,120px] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFormExpansion(formGroup.caseType)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-900 font-medium">{formGroup.displayName}</span>
                      {expandedForms.has(formGroup.caseType) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      {formGroup.submissions.length}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(formGroup.latestSubmission), { addSuffix: true })}
                    </div>
                  </div>

                  {expandedForms.has(formGroup.caseType) && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-900 font-medium">
                          {formGroup.submissions.length} Submission{formGroup.submissions.length !== 1 ? 's' : ''}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const ids = formGroup.submissions.map(s => s.id);
                              setSelectedSubmissionIds(prev => 
                                prev.length === ids.length && ids.every(id => prev.includes(id))
                                  ? []
                                  : ids
                              );
                            }}
                          >
                            Select All
                          </Button>
                          {selectedSubmissionIds.length > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                bulkDeleteMutation.mutate(selectedSubmissionIds);
                              }}
                              disabled={bulkDeleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete ({selectedSubmissionIds.length})
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToCSV(formGroup);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {formGroup.submissions.map((submission) => (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3"
                          >
                            <div className="flex items-center gap-4">
                              <Checkbox
                                checked={selectedSubmissionIds.includes(submission.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedSubmissionIds(prev =>
                                    checked
                                      ? [...prev, submission.id]
                                      : prev.filter(id => id !== submission.id)
                                  );
                                }}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-blue-700 font-semibold text-sm">{submission.requestNumber}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-900 font-medium">
                                    {format(new Date(submission.createdAt), 'MMM d, yyyy, h:mm a')}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    Completed in {calculateCompletionTime(submission)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">
                                    {Object.keys(submission.formResponses?.answers || {}).length} responses • {submission.formResponses?.transcript?.length || 0} nodes visited
                                  </span>
                                  <span className="text-gray-300">•</span>
                                  {submission.assignedAttorneys && submission.assignedAttorneys.length > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-green-700">
                                      <Users className="w-3 h-3" />
                                      {submission.assignedAttorneys.length} attorney{submission.assignedAttorneys.length !== 1 ? 's' : ''} assigned
                                    </span>
                                  ) : (
                                    <span className="text-orange-600">Unassigned</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(submission);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(submission);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
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

              {/* Attorney Assignments */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Users className="w-5 h-5 text-gray-500" />
                    Assigned Attorneys
                  </h3>
                  <Button size="sm" onClick={handleOpenAssignModal}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Manage Attorneys
                  </Button>
                </div>
                {selectedSubmission.assignedAttorneys && selectedSubmission.assignedAttorneys.length > 0 ? (
                  <div className="space-y-3">
                    {selectedSubmission.assignedAttorneys.map((attorney) => (
                      <div key={attorney.attorneyId} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{attorney.firstName} {attorney.lastName}</div>
                          <div className="text-sm text-gray-500">{attorney.email}</div>
                          {attorney.firmName && <div className="text-sm text-gray-400">{attorney.firmName}</div>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <Badge variant={attorney.emailSent ? 'default' : 'secondary'} className="text-xs">
                              {attorney.emailSent ? 'Email Sent' : 'Not Notified'}
                            </Badge>
                            <div className="text-xs text-gray-400 mt-1">
                              Assigned {formatDistanceToNow(new Date(attorney.assignedAt), { addSuffix: true })}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleUnassignAttorney(attorney.attorneyId)}
                            disabled={assignAttorneysMutation.isPending}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No attorneys assigned yet</p>
                    <p className="text-xs text-gray-400">Click "Manage Attorneys" to assign attorneys to this submission</p>
                  </div>
                )}
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
                  {Object.entries(selectedSubmission.formResponses?.answers || {}).map(([nodeId, value]) => {
                    let displayValue: string;
                    if (value === null || value === undefined) {
                      displayValue = 'N/A';
                    } else if (typeof value === 'object') {
                      const entries = Object.entries(value as Record<string, unknown>);
                      if (entries.length === 1 && entries[0][0] === 'started') {
                        displayValue = '(started)';
                      } else {
                        displayValue = entries.map(([k, v]) => `${k}: ${v}`).join(', ');
                      }
                    } else {
                      displayValue = String(value);
                    }
                    
                    return (
                      <div key={nodeId} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                        <div className="text-gray-400 text-sm font-mono mb-1">{nodeId}</div>
                        <div className="text-gray-900">{displayValue}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Submission
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Attorneys Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Manage Attorney Assignments
            </DialogTitle>
            <p className="text-gray-500 text-sm">
              Select attorneys to assign to submission {selectedSubmission?.requestNumber}
            </p>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {allAttorneys.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No attorneys available</p>
            ) : (
              allAttorneys.map((attorney) => {
                const isSelected = selectedAttorneyIds.includes(attorney.id);
                return (
                  <div
                    key={attorney.id}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedAttorneyIds(prev =>
                        isSelected
                          ? prev.filter(id => id !== attorney.id)
                          : [...prev, attorney.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={isSelected} />
                      <div>
                        <div className="font-medium text-gray-900">{attorney.firstName} {attorney.lastName}</div>
                        <div className="text-sm text-gray-500">{attorney.email}</div>
                        {attorney.firmName && <div className="text-xs text-gray-400">{attorney.firmName}</div>}
                      </div>
                    </div>
                    {attorney.isVerified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">{selectedAttorneyIds.length} attorney{selectedAttorneyIds.length !== 1 ? 's' : ''} selected</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveAssignments}
                disabled={assignAttorneysMutation.isPending}
              >
                {assignAttorneysMutation.isPending ? 'Saving...' : 'Save Assignments'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this submission? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
