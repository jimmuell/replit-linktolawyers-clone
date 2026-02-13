import { useMemo, useState, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Download, FileText, Users, Calendar, Upload, File, Image, Trash2, Loader2, CheckSquare, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
    location?: string;
    city?: string;
    state?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface StructuredIntake {
  success: boolean;
  data: {
    id: number;
    requestNumber: string;
    formResponses: Record<string, any>;
    [key: string]: any;
  };
}

const CaseDetailsPage: React.FC = () => {
  const [match, params] = useRoute('/case-details/:requestNumber');
  const [, navigate] = useLocation();

  const requestNumber = params?.requestNumber;
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDocConfirm, setDeleteDocConfirm] = useState<number | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<number>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: request, isLoading } = useQuery<LegalRequest>({
    queryKey: ['/api/legal-requests', requestNumber],
    queryFn: () => fetch(`/api/legal-requests/${requestNumber}`).then(r => r.json()),
    enabled: !!requestNumber,
  });

  const { data: structuredIntake } = useQuery<StructuredIntake>({
    queryKey: ['/api/structured-intakes', requestNumber],
    queryFn: () => fetch(`/api/structured-intakes/${requestNumber}`).then(r => r.json()),
    enabled: !!requestNumber,
  });

  const { data: documentsData, refetch: refetchDocuments } = useQuery({
    queryKey: ['/api/case-documents', requestNumber],
    queryFn: async () => {
      const response = await fetch(`/api/case-documents/${requestNumber}`);
      if (!response.ok) return { data: [] };
      return response.json();
    },
    enabled: !!requestNumber,
  });

  const documents = documentsData?.data || [];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !requestNumber) return;
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const response = await fetch(`/api/case-documents/${requestNumber}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Upload failed');
        }
      }
      toast({ title: "Success", description: `${files.length} file(s) uploaded successfully` });
      refetchDocuments();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message || "Failed to upload file", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(`/api/case-documents/${documentId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Document deleted successfully" });
      refetchDocuments();
      setDeleteDocConfirm(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete document", variant: "destructive" });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <File className="h-4 w-4 text-red-500" />;
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const questionsCount = useMemo(() => {
    if (!structuredIntake?.data?.formResponses) return null;
    return Object.keys(structuredIntake.data.formResponses).length;
  }, [structuredIntake]);

  const handleBackToQuotes = () => {
    navigate(`/quotes/${requestNumber}`);
  };

  const handleOpenDownloadModal = () => {
    setSelectedDocIds(new Set(documents.map((doc: any) => doc.id)));
    setIsDownloadModalOpen(true);
  };

  const handleToggleDoc = (docId: number) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedDocIds.size === documents.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(documents.map((doc: any) => doc.id)));
    }
  };

  const generatePdfBlob = async (): Promise<Blob> => {
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
      noticeYellow: [254, 252, 232] as [number, number, number],
      noticeBorder: [250, 204, 21] as [number, number, number],
      noticeText: [133, 100, 4] as [number, number, number],
    };

    const checkPage = (needed: number) => {
      if (y + needed > pageHeight - footerHeight) {
        doc.addPage();
        y = 25;
      }
    };

    const setColor = (color: [number, number, number]) => {
      doc.setTextColor(color[0], color[1], color[2]);
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

    const rd = request!.data;
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
    doc.text('Case Details Report', marginLeft, 30);

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
    doc.text(`${rd.firstName} ${rd.lastName}`, marginLeft + 10, y + 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const createdDate = new Date(rd.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(createdDate, marginLeft + 10, y + 22);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const caseTypeLabel = getCaseTypeLabel(rd.caseType);
    const badgeWidth = doc.getTextWidth(caseTypeLabel) + 8;
    doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.roundedRect(marginLeft + 10, y + 25, badgeWidth, 7, 2, 2, 'F');
    setColor(COLORS.primaryBlue);
    doc.text(caseTypeLabel, marginLeft + 14, y + 30);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.white);
    const reqLabel = 'Request Number';
    const reqLabelW = doc.getTextWidth(reqLabel);
    doc.text(reqLabel, marginLeft + contentWidth - 10 - reqLabelW, y + 12);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const reqNum = rd.requestNumber.toUpperCase();
    const reqNumW = doc.getTextWidth(reqNum);
    doc.text(reqNum, marginLeft + contentWidth - 10 - reqNumW, y + 22);
    y += clientCardHeight + 12;

    drawSectionHeader('Client Information');
    const colWidth = contentWidth / 2;
    const col1X = marginLeft + 5;
    const col2X = marginLeft + colWidth + 5;

    let savedY = y;
    drawInfoRow('Full Name', `${rd.firstName} ${rd.lastName}`, col1X, colWidth);
    let after1 = y;
    y = savedY;
    drawInfoRow('Email Address', rd.email, col2X, colWidth);
    y = Math.max(after1, y);

    savedY = y;
    drawInfoRow('Case Type', getCaseTypeLabel(rd.caseType), col1X, colWidth);
    after1 = y;
    y = savedY;
    drawInfoRow('Request Date', createdDate, col2X, colWidth);
    y = Math.max(after1, y);

    if (rd.phoneNumber) {
      savedY = y;
      drawInfoRow('Phone Number', rd.phoneNumber, col1X, colWidth);
      after1 = y;
      y = savedY;
      if (rd.location) drawInfoRow('Location', rd.location, col2X, colWidth);
      else if (rd.city && rd.state) drawInfoRow('City, State', `${rd.city}, ${rd.state}`, col2X, colWidth);
      y = Math.max(after1, y);
    }

    doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
    doc.line(marginLeft, y, marginLeft + contentWidth, y);
    y += 10;

    drawSectionHeader('Case Summary');
    const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
    const plainDesc = stripTags(rd.caseDescription);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    setColor(COLORS.darkGray);
    const descLines = doc.splitTextToSize(plainDesc, contentWidth - 10);
    descLines.forEach((line: string) => {
      checkPage(6);
      doc.text(line, marginLeft + 5, y);
      y += 4.5;
    });
    y += 10;

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
    const noticeLines = doc.splitTextToSize('This intake summary provides general information only and does not constitute legal advice. For specific legal questions, consult with a qualified immigration attorney.', contentWidth - 20);
    noticeLines.forEach((line: string, idx: number) => {
      doc.text(line, marginLeft + 14, y + 14 + idx * 3.5);
    });

    const totalPages = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
      doc.line(marginLeft, pageHeight - 18, pageWidth - marginRight, pageHeight - 18);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      setColor(COLORS.mediumGray);
      doc.text('LinkToLawyers  \u00B7  Case Details Report  \u00B7  Confidential', marginLeft, pageHeight - 12);
      const pageText = `Page ${i} of ${totalPages}`;
      const pageTextWidth = doc.getTextWidth(pageText);
      doc.text(pageText, pageWidth - marginRight - pageTextWidth, pageHeight - 12);
    }

    return doc.output('blob');
  };

  const handleDownloadSelected = async () => {
    if (!request?.data) return;
    const selected = documents.filter((doc: any) => selectedDocIds.has(doc.id));

    setIsDownloading(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const pdfBlob = await generatePdfBlob();
      zip.file(`LinkToLawyers_Case_${request.data.requestNumber.toUpperCase()}.pdf`, pdfBlob);

      const docsFolder = zip.folder('Documents');
      for (const doc of selected) {
        const response = await fetch(`/api/case-documents/${doc.id}/download`);
        if (!response.ok) throw new Error(`Failed to download ${doc.fileName}`);
        const blob = await response.blob();
        docsFolder!.file(doc.fileName, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LinkToLawyers_Case_${request.data.requestNumber.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const totalFiles = selected.length + 1;
      toast({ title: "Download started", description: `ZIP with Case Summary PDF + ${selected.length} document(s)` });
      setIsDownloadModalOpen(false);
    } catch (error: any) {
      toast({ title: "Download failed", description: error.message || "Failed to download documents", variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!request?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Case not found</p>
          <Button onClick={handleBackToQuotes} className="mt-4">
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCaseTypeLabel = (caseType: string) => {
    switch (caseType?.toLowerCase()) {
      case 'family immigration':
      case 'family':
        return 'Family';
      case 'asylum':
        return 'Asylum';
      case 'naturalization / citizenship':
      case 'naturalization':
        return 'Naturalization';
      default:
        return caseType || 'Immigration';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToQuotes}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quotes</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileText className="w-3 h-3 mr-1" />
                Case Summary
              </Badge>
              {documents.length > 0 && (
                <Button 
                  onClick={handleOpenDownloadModal}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Documents
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Header Card */}
            <Card className="bg-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{request.data.firstName} {request.data.lastName}</h1>
                    <p className="text-blue-100 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(request.data.createdAt)}
                    </p>
                    <Badge className="bg-white text-blue-600 mt-2">
                      {getCaseTypeLabel(request.data.caseType)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">Request Number</div>
                    <div className="text-xl font-bold">{request.data.requestNumber.toUpperCase()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Users className="w-5 h-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Full Name</div>
                    <div className="text-gray-900">{request.data.firstName} {request.data.lastName}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Email Address</div>
                    <div className="text-gray-900">{request.data.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Case Type</div>
                    <div className="text-gray-900">{getCaseTypeLabel(request.data.caseType)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Consultation Date</div>
                    <div className="text-gray-900">{formatDate(request.data.createdAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <FileText className="w-5 h-5" />
                  Case Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div 
                      className="text-gray-700 leading-relaxed [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_strong]:font-semibold [&_span]:text-gray-600"
                      dangerouslySetInnerHTML={{ __html: request.data.caseDescription }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-700">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleBackToQuotes}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quotes
                </Button>
                {documents.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={handleOpenDownloadModal}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Documents
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={isUploading}
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Uploading...' : 'Upload Documents'}
                </Button>
              </CardContent>
            </Card>

            {documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-700 flex items-center gap-2">
                    Documents
                    <Badge variant="secondary" className="text-xs">{documents.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border text-sm">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getFileIcon(doc.fileType)}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate text-sm">{doc.fileName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            window.open(`/api/case-documents/${doc.id}/download`, '_blank');
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => setDeleteDocConfirm(doc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Case Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-700">Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Case Number</div>
                  <div className="text-gray-900 font-mono">{request.data.requestNumber.toUpperCase()}</div>
                </div>
                {questionsCount !== null && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Questions Asked</div>
                    <div className="text-gray-900">{questionsCount}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Created</div>
                  <div className="text-gray-900">{new Date(request.data.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
                  <Badge variant={request.data.status === 'under_review' ? 'secondary' : 'default'}>
                    {request.data.status === 'under_review' ? 'Complete' : request.data.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-yellow-800 mb-1">Important Notice</div>
                    <p className="text-sm text-yellow-700">
                      This intake summary provides general information only and does not constitute legal advice. For specific legal questions, consult with a qualified immigration attorney.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Download Documents
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <Checkbox
                  checked={selectedDocIds.size === documents.length && documents.length > 0}
                  onCheckedChange={handleToggleAll}
                />
                Select All ({documents.length} files)
              </label>
              <span className="text-xs text-gray-500">
                {selectedDocIds.size} selected
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {documents.map((doc: any) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedDocIds.has(doc.id)}
                    onCheckedChange={() => handleToggleDoc(doc.id)}
                  />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getFileIcon(doc.fileType)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 italic">
            The Case Summary PDF is always included in the download.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDownloadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDownloadSelected}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Download ZIP ({selectedDocIds.size + 1} files)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDocConfirm} onOpenChange={(open) => !open && setDeleteDocConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDocConfirm && deleteDocumentMutation.mutate(deleteDocConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CaseDetailsPage;