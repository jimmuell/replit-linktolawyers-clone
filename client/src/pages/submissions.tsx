import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import AdminNavbar from '@/components/AdminNavbar';
import { Eye, Trash2, Download, FileText, MessageSquare, ChevronRight, ChevronDown, CheckCircle2, MapPin } from 'lucide-react';
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
  timestamp: string;
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

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Group submissions by case type
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

  const calculateCompletionTime = (submission: StructuredIntake): string => {
    const transcript = submission.formResponses?.transcript;
    if (!transcript || transcript.length < 2) return 'N/A';
    
    const firstTimestamp = new Date(transcript[0].timestamp).getTime();
    const lastTimestamp = new Date(transcript[transcript.length - 1].timestamp).getTime();
    const diffMs = lastTimestamp - firstTimestamp;
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
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

  const exportToCSV = (formGroup: FormGroup) => {
    const headers = ['Request Number', 'Name', 'Email', 'Phone', 'State', 'Status', 'Submitted At'];
    const rows = formGroup.submissions.map(s => [
      s.requestNumber,
      `${s.firstName} ${s.lastName}`,
      s.email,
      s.phoneNumber || '',
      s.state || '',
      s.status,
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
    <div className="min-h-screen bg-[#1a1f2e]">
      <AdminNavbar title="Submissions" />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">All Submissions</h1>
            <p className="text-gray-400 mt-1">
              {totalSubmissions} total submission{totalSubmissions !== 1 ? 's' : ''} across {totalForms} form{totalForms !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-[#242938] rounded-lg border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-[1fr,120px,140px,120px] gap-4 px-6 py-3 border-b border-gray-700 text-sm text-gray-400">
              <div>Form Name</div>
              <div>Status</div>
              <div>Submissions</div>
              <div>Last Updated</div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading submissions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400">Error loading submissions. Please try again.</p>
              </div>
            ) : formGroups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No submissions found.</p>
              </div>
            ) : (
              formGroups.map((formGroup) => (
                <div key={formGroup.caseType} className="border-b border-gray-700 last:border-b-0">
                  <div 
                    className="grid grid-cols-[1fr,120px,140px,120px] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-[#2a303f] transition-colors"
                    onClick={() => toggleFormExpansion(formGroup.caseType)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-cyan-500" />
                      <span className="text-white font-medium">{formGroup.displayName}</span>
                      {expandedForms.has(formGroup.caseType) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <Badge className="bg-cyan-600 hover:bg-cyan-600 text-white">Published</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      {formGroup.submissions.length}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(formGroup.latestSubmission), { addSuffix: true })}
                    </div>
                  </div>

                  {expandedForms.has(formGroup.caseType) && (
                    <div className="bg-[#1e2330] px-6 py-4 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium">
                          {formGroup.submissions.length} Submission{formGroup.submissions.length !== 1 ? 's' : ''}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-300 border-gray-600 hover:bg-gray-700"
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-gray-300 border-gray-600 hover:bg-gray-700"
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
                            className="flex items-center justify-between bg-[#242938] rounded-lg px-4 py-3"
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
                                  <span className="text-white font-medium">
                                    {format(new Date(submission.createdAt), 'MMM d, yyyy, h:mm a')}
                                  </span>
                                  <span className="text-gray-400 text-sm">
                                    Completed in {calculateCompletionTime(submission)}
                                  </span>
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {Object.keys(submission.formResponses?.answers || {}).length} responses • {submission.formResponses?.transcript?.length || 0} nodes visited
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-300 hover:text-white hover:bg-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(submission);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1f2e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Submission Details
            </DialogTitle>
            <p className="text-gray-400 text-sm">
              Form: {selectedSubmission?.caseType}
            </p>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 mt-4">
              {/* Submission Information */}
              <div className="bg-[#242938] rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  Submission Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Submitted At</div>
                    <div className="text-white">
                      {format(new Date(selectedSubmission.createdAt), 'MMM d, yyyy, h:mm:ss a')}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Completion Time</div>
                    <div className="text-white">{calculateCompletionTime(selectedSubmission)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">Nodes Visited</div>
                    <div className="text-white">{selectedSubmission.formResponses?.transcript?.length || 0}</div>
                  </div>
                </div>
              </div>

              {/* User Journey */}
              {selectedSubmission.formResponses?.transcript && selectedSubmission.formResponses.transcript.length > 0 && (
                <div className="bg-[#242938] rounded-lg p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    User Journey
                  </h3>
                  <div className="space-y-4">
                    {selectedSubmission.formResponses.transcript.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          {index < selectedSubmission.formResponses.transcript!.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-600 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="bg-gray-700 text-gray-200">
                              {getNodeTypeLabel(entry.nodeType)}
                            </Badge>
                            <span className="text-gray-500 text-sm">
                              {format(new Date(entry.timestamp), 'HH:mm:ss')}
                            </span>
                          </div>
                          <div className="text-white mb-1">{entry.question}</div>
                          {entry.answer && (
                            <div className="text-cyan-400 text-sm">Response: {entry.answer}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Responses */}
              <div className="bg-[#242938] rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  All Responses
                </h3>
                <div className="space-y-4">
                  {Object.entries(selectedSubmission.formResponses?.answers || {}).map(([nodeId, value]) => (
                    <div key={nodeId} className="border-b border-gray-700 pb-3 last:border-b-0 last:pb-0">
                      <div className="text-gray-400 text-sm font-mono mb-1">{nodeId}</div>
                      <div className="text-white">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1a1f2e] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400">
            Are you sure you want to delete this submission? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
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
