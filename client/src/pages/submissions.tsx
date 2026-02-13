import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import AdminNavbar from '@/components/AdminNavbar';
import { Eye, Trash2, Download, FileText, MessageSquare, ChevronRight, ChevronDown, CheckCircle2, Clock, UserPlus, UserMinus, Users, AlertTriangle, Loader2, Package } from 'lucide-react';
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
  source: 'admin' | 'self';
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
  const [relatedCounts, setRelatedCounts] = useState<{ referralAssignments: number; quotes: number; cases: number; attorneyNotes: number } | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);

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

  const handleDeleteClick = async (submission: StructuredIntake) => {
    setSelectedSubmission(submission);
    setRelatedCounts(null);
    setIsLoadingCounts(true);
    setIsDeleteModalOpen(true);
    try {
      const response = await fetch(`/api/structured-intakes/${submission.id}/related-counts`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('sessionId')}` },
      });
      if (response.ok) {
        const result = await response.json();
        setRelatedCounts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch related counts:', error);
    } finally {
      setIsLoadingCounts(false);
    }
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

  const handleDownloadReferralPackage = async () => {
    if (!selectedSubmission) return;
    setIsGeneratingPackage(true);

    try {
      const submission = selectedSubmission;
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 25;
      const marginRight = 25;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const footerHeight = 25;
      let y = 0;

      const COLORS = {
        primaryBlue: [30, 64, 175] as [number, number, number],
        darkBlue: [20, 45, 130] as [number, number, number],
        white: [255, 255, 255] as [number, number, number],
        black: [33, 33, 33] as [number, number, number],
        darkGray: [55, 65, 81] as [number, number, number],
        mediumGray: [107, 114, 128] as [number, number, number],
        lightGray: [243, 244, 246] as [number, number, number],
        borderGray: [209, 213, 219] as [number, number, number],
        accentBlue: [239, 246, 255] as [number, number, number],
        noticeYellow: [254, 252, 232] as [number, number, number],
        noticeBorder: [250, 204, 21] as [number, number, number],
        noticeText: [133, 100, 4] as [number, number, number],
      };

      const setColor = (color: [number, number, number]) => {
        doc.setTextColor(color[0], color[1], color[2]);
      };

      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - footerHeight) {
          doc.addPage();
          y = 25;
        }
      };

      const drawSectionHeader = (title: string) => {
        checkPage(20);
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.roundedRect(marginLeft, y, contentWidth, 12, 1.5, 1.5, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setColor(COLORS.darkGray);
        doc.text(title, marginLeft + 5, y + 8);
        y += 18;
      };

      const drawInfoRow = (label: string, value: string, xStart: number, rowWidth: number) => {
        checkPage(14);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        setColor(COLORS.mediumGray);
        doc.text(label, xStart, y);
        y += 4.5;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        setColor(COLORS.black);
        const lines = doc.splitTextToSize(value, rowWidth - 5);
        lines.forEach((line: string) => {
          checkPage(6);
          doc.text(line, xStart, y);
          y += 5;
        });
        y += 3;
      };

      const headerHeight = 48;
      doc.setFillColor(COLORS.primaryBlue[0], COLORS.primaryBlue[1], COLORS.primaryBlue[2]);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      doc.setFillColor(COLORS.darkBlue[0], COLORS.darkBlue[1], COLORS.darkBlue[2]);
      doc.rect(0, headerHeight - 3, pageWidth, 3, 'F');

      setColor(COLORS.white);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('LinkToLawyers', marginLeft, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Referral Summary', marginLeft, 30);

      doc.setFontSize(9);
      const genDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const dateText = `Generated: ${genDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - marginRight - dateWidth, 30);

      y = headerHeight + 10;

      const clientCardHeight = 36;
      doc.setFillColor(COLORS.primaryBlue[0], COLORS.primaryBlue[1], COLORS.primaryBlue[2]);
      doc.roundedRect(marginLeft, y, contentWidth, clientCardHeight, 3, 3, 'F');

      setColor(COLORS.white);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${submission.firstName} ${submission.lastName}`, marginLeft + 10, y + 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const createdDate = format(new Date(submission.createdAt), 'EEEE, MMMM d, yyyy');
      doc.text(createdDate, marginLeft + 10, y + 22);

      doc.setFontSize(8);
      setColor(COLORS.white);
      const reqLabel = 'Request Number';
      const reqLabelW = doc.getTextWidth(reqLabel);
      doc.text(reqLabel, marginLeft + contentWidth - 10 - reqLabelW, y + 12);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      const reqNum = submission.requestNumber.toUpperCase();
      const reqNumW = doc.getTextWidth(reqNum);
      doc.text(reqNum, marginLeft + contentWidth - 10 - reqNumW, y + 22);

      y += clientCardHeight + 12;

      drawSectionHeader('Client Information');

      const colWidth = contentWidth / 2;
      const col1X = marginLeft + 5;
      const col2X = marginLeft + colWidth + 5;

      let savedY = y;
      drawInfoRow('Full Name', `${submission.firstName} ${submission.lastName}`, col1X, colWidth);
      let afterCol1 = y;
      y = savedY;
      drawInfoRow('Email Address', submission.email, col2X, colWidth);
      y = Math.max(afterCol1, y);

      savedY = y;
      drawInfoRow('Phone Number', submission.phoneNumber || 'N/A', col1X, colWidth);
      afterCol1 = y;
      y = savedY;
      drawInfoRow('State', submission.state || 'N/A', col2X, colWidth);
      y = Math.max(afterCol1, y);

      savedY = y;
      drawInfoRow('Case Type', submission.caseType, col1X, colWidth);
      afterCol1 = y;
      y = savedY;
      drawInfoRow('Role', submission.role || 'N/A', col2X, colWidth);
      y = Math.max(afterCol1, y);

      drawInfoRow('Submission Date', format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a'), col1X, contentWidth);

      doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
      doc.line(marginLeft, y, marginLeft + contentWidth, y);
      y += 10;

      if (submission.attorneyIntakeSummary) {
        drawSectionHeader('Case Summary');

        const stripHtml = (html: string) => {
          return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<\/h[1-6]>/gi, '\n\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        };

        const summaryText = stripHtml(submission.attorneyIntakeSummary);
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        setColor(COLORS.darkGray);
        const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 10);
        summaryLines.forEach((line: string) => {
          checkPage(6);
          doc.text(line, marginLeft + 5, y);
          y += 4.5;
        });
        y += 10;
      }

      const transcript = submission.formResponses?.transcript;
      if (transcript && transcript.length > 0) {
        drawSectionHeader('User Journey');

        transcript.forEach((entry: TranscriptEntry, idx: number) => {
          checkPage(20);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          setColor(COLORS.mediumGray);
          doc.text(`Step ${idx + 1}`, marginLeft + 5, y);
          y += 5;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          setColor(COLORS.black);
          const qLines = doc.splitTextToSize(entry.question || 'N/A', contentWidth - 10);
          qLines.forEach((line: string) => {
            checkPage(5);
            doc.text(line, marginLeft + 5, y);
            y += 4.5;
          });

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          setColor(COLORS.darkGray);
          const aLines = doc.splitTextToSize(entry.answer || 'N/A', contentWidth - 10);
          aLines.forEach((line: string) => {
            checkPage(5);
            doc.text(line, marginLeft + 5, y);
            y += 4.5;
          });
          y += 4;
        });
        y += 6;
      }

      checkPage(30);
      const noticeHeight = 22;
      doc.setFillColor(COLORS.noticeYellow[0], COLORS.noticeYellow[1], COLORS.noticeYellow[2]);
      doc.setDrawColor(COLORS.noticeBorder[0], COLORS.noticeBorder[1], COLORS.noticeBorder[2]);
      doc.roundedRect(marginLeft, y, contentWidth, noticeHeight, 2, 2, 'FD');
      doc.setFillColor(COLORS.noticeBorder[0], COLORS.noticeBorder[1], COLORS.noticeBorder[2]);
      doc.circle(marginLeft + 8, y + 7, 1.5, 'F');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      setColor(COLORS.noticeText);
      doc.text('Important Notice', marginLeft + 14, y + 8);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const noticeLines = doc.splitTextToSize(
        'This referral summary provides general information only and does not constitute legal advice. For specific legal questions, consult with a qualified immigration attorney.',
        contentWidth - 20
      );
      noticeLines.forEach((line: string, idx: number) => {
        doc.text(line, marginLeft + 14, y + 14 + idx * 3.5);
      });
      y += noticeHeight + 10;

      const totalPages = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
        doc.line(marginLeft, pageHeight - 18, pageWidth - marginRight, pageHeight - 18);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        setColor(COLORS.mediumGray);
        doc.text('LinkToLawyers  \u00B7  Referral Summary  \u00B7  Confidential', marginLeft, pageHeight - 12);
        const pageText = `Page ${i} of ${totalPages}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        doc.text(pageText, pageWidth - marginRight - pageTextWidth, pageHeight - 12);
      }

      const pdfBlob = doc.output('blob');
      const pdfFileName = `Referral_Summary_${submission.requestNumber}.pdf`;

      let docsResponse;
      try {
        docsResponse = await fetch(`/api/case-documents/${submission.requestNumber}`);
      } catch {
        docsResponse = null;
      }

      let documents: any[] = [];
      if (docsResponse && docsResponse.ok) {
        const docsData = await docsResponse.json();
        documents = docsData?.data || [];
      }

      if (documents.length > 0) {
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        zip.file(pdfFileName, pdfBlob);

        for (const docItem of documents) {
          try {
            const docResponse = await fetch(`/api/case-documents/${docItem.id}/download`);
            if (docResponse.ok) {
              const docBlob = await docResponse.blob();
              zip.file(docItem.fileName || `document_${docItem.id}`, docBlob);
            }
          } catch (err) {
            console.error(`Failed to fetch document ${docItem.id}:`, err);
          }
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LinkToLawyers_Referral_${submission.requestNumber}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfFileName;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Package downloaded",
        description: documents.length > 0
          ? `ZIP file with PDF summary and ${documents.length} document(s) downloaded.`
          : "Referral summary PDF downloaded.",
      });
    } catch (error) {
      console.error('Error generating referral package:', error);
      toast({
        title: "Download failed",
        description: "An error occurred while generating the referral package.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPackage(false);
    }
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{attorney.firstName} {attorney.lastName}</span>
                            <Badge variant="outline" className={`text-xs ${attorney.source === 'self' ? 'border-purple-300 text-purple-700' : 'border-blue-300 text-blue-700'}`}>
                              {attorney.source === 'self' ? 'Self-assigned' : 'Admin-assigned'}
                            </Badge>
                          </div>
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

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  onClick={handleDownloadReferralPackage}
                  disabled={isGeneratingPackage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGeneratingPackage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing Package...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Download Referral Package
                    </>
                  )}
                </Button>
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
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete submission <strong>{selectedSubmission?.requestNumber}</strong>? This action cannot be undone.
            </p>

            {isLoadingCounts ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Checking related records...</span>
              </div>
            ) : relatedCounts && (relatedCounts.referralAssignments > 0 || relatedCounts.quotes > 0 || relatedCounts.cases > 0 || relatedCounts.attorneyNotes > 0) ? (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800 mb-2">The following related records will also be permanently deleted:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {relatedCounts.referralAssignments > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {relatedCounts.referralAssignments} attorney referral assignment{relatedCounts.referralAssignments !== 1 ? 's' : ''}
                    </li>
                  )}
                  {relatedCounts.quotes > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {relatedCounts.quotes} quote{relatedCounts.quotes !== 1 ? 's' : ''}
                    </li>
                  )}
                  {relatedCounts.cases > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {relatedCounts.cases} case{relatedCounts.cases !== 1 ? 's' : ''}
                    </li>
                  )}
                  {relatedCounts.attorneyNotes > 0 && (
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full" />
                      {relatedCounts.attorneyNotes} attorney note{relatedCounts.attorneyNotes !== 1 ? 's' : ''}
                    </li>
                  )}
                </ul>
              </div>
            ) : relatedCounts ? (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">No related records found. Only the submission will be deleted.</p>
              </div>
            ) : null}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending || isLoadingCounts}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
