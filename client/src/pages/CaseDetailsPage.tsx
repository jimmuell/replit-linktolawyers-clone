import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Download, FileText, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

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

const CaseDetailsPage: React.FC = () => {
  const [match, params] = useRoute('/case-details/:requestNumber');
  const [, navigate] = useLocation();

  const requestNumber = params?.requestNumber;

  // Fetch legal request details
  const { data: request, isLoading } = useQuery<LegalRequest>({
    queryKey: [`/api/legal-requests/${requestNumber}`],
    enabled: !!requestNumber,
  });

  const handleBackToQuotes = () => {
    navigate(`/quotes/${requestNumber}`);
  };

  const handleDownloadPDF = async () => {
    if (!request?.data) return;
    
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Document settings
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;
      
      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize = 10, fontStyle = 'normal', maxWidth = pageWidth - 2 * margin) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5; // Extra spacing after text blocks
      };
      
      // Header
      doc.setFillColor(30, 64, 175); // Blue background
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LinkToLawyers', margin, 25);
      doc.setFontSize(12);
      doc.text('Case Details Report', margin, 35);
      
      yPosition = 55;
      doc.setTextColor(0, 0, 0);
      
      // Case Information
      addText(`Case Number: ${request.data.requestNumber.toUpperCase()}`, 14, 'bold');
      addText(`Generated: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      })}`, 10);
      
      yPosition += 10;
      
      // Client Information Section
      addText('CLIENT INFORMATION', 14, 'bold');
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      addText(`Name: ${request.data.firstName} ${request.data.lastName}`, 11);
      addText(`Email: ${request.data.email}`, 11);
      if (request.data.phoneNumber) {
        addText(`Phone: ${request.data.phoneNumber}`, 11);
      }
      addText(`Case Type: ${request.data.caseType}`, 11);
      if (request.data.location) {
        addText(`Location: ${request.data.location}`, 11);
      }
      if (request.data.city && request.data.state) {
        addText(`City, State: ${request.data.city}, ${request.data.state}`, 11);
      }
      addText(`Status: ${request.data.status}`, 11);
      addText(`Created: ${new Date(request.data.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
        hour: 'numeric', minute: '2-digit', hour12: true
      })}`, 11);
      
      yPosition += 10;
      
      // Case Description Section
      addText('CASE DESCRIPTION', 14, 'bold');
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      addText(request.data.caseDescription, 10, 'normal');
      
      yPosition += 15;
      
      // Important Notice
      addText('IMPORTANT NOTICE', 12, 'bold');
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;
      
      addText('This case summary provides general information only and does not constitute legal advice. For specific legal questions, consult with a qualified immigration attorney.', 9, 'normal');
      
      // Footer
      const totalPages = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 30, pageHeight - 10);
        doc.text('LinkToLawyers - Case Details Report', margin, pageHeight - 10);
      }
      
      // Generate filename with case number and timestamp
      const filename = `Case_${request.data.requestNumber}_${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
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
              <Button 
                onClick={handleDownloadPDF}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
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
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {request.data.caseDescription}
                    </p>
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>

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
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Questions Asked</div>
                  <div className="text-gray-900">7</div>
                </div>
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
    </div>
  );
};

export default CaseDetailsPage;