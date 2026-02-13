import { useMemo } from 'react';
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

  const questionsCount = useMemo(() => {
    if (!structuredIntake?.data?.formResponses) return null;
    return Object.keys(structuredIntake.data.formResponses).length;
  }, [structuredIntake]);

  const handleBackToQuotes = () => {
    navigate(`/quotes/${requestNumber}`);
  };

  const handleDownloadPDF = async () => {
    if (!request?.data) return;
    
    try {
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

      const checkPage = (needed: number) => {
        if (y + needed > pageHeight - footerHeight) {
          doc.addPage();
          y = 25;
        }
      };

      const setColor = (color: [number, number, number]) => {
        doc.setTextColor(color[0], color[1], color[2]);
      };

      const drawSectionHeader = (title: string, iconChar?: string) => {
        checkPage(20);
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.roundedRect(marginLeft, y, contentWidth, 12, 1.5, 1.5, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setColor(COLORS.darkGray);
        const labelX = marginLeft + 5;
        doc.text(title, labelX, y + 8);
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

      // ─── PAGE HEADER (Blue Banner) ───
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
      doc.setFont('helvetica', 'normal');
      const genDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      const dateText = `Generated: ${genDate}`;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - marginRight - dateWidth, 30);

      y = headerHeight + 10;

      // ─── CLIENT HEADER CARD (Blue card mirroring the page) ───
      const clientCardHeight = 36;
      doc.setFillColor(COLORS.primaryBlue[0], COLORS.primaryBlue[1], COLORS.primaryBlue[2]);
      doc.roundedRect(marginLeft, y, contentWidth, clientCardHeight, 3, 3, 'F');

      setColor(COLORS.white);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`${request.data.firstName} ${request.data.lastName}`, marginLeft + 10, y + 14);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const createdDate = new Date(request.data.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      doc.text(createdDate, marginLeft + 10, y + 22);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const caseTypeLabel = getCaseTypeLabel(request.data.caseType);
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
      const reqNum = request.data.requestNumber.toUpperCase();
      const reqNumW = doc.getTextWidth(reqNum);
      doc.text(reqNum, marginLeft + contentWidth - 10 - reqNumW, y + 22);

      y += clientCardHeight + 12;

      // ─── CLIENT INFORMATION SECTION ───
      drawSectionHeader('Client Information');

      const colWidth = contentWidth / 2;
      const col1X = marginLeft + 5;
      const col2X = marginLeft + colWidth + 5;

      const savedY = y;
      drawInfoRow('Full Name', `${request.data.firstName} ${request.data.lastName}`, col1X, colWidth);
      const afterCol1Row1 = y;
      y = savedY;
      drawInfoRow('Email Address', request.data.email, col2X, colWidth);
      y = Math.max(afterCol1Row1, y);

      const savedY2 = y;
      drawInfoRow('Case Type', getCaseTypeLabel(request.data.caseType), col1X, colWidth);
      const afterCol1Row2 = y;
      y = savedY2;
      drawInfoRow('Consultation Date', createdDate, col2X, colWidth);
      y = Math.max(afterCol1Row2, y);

      if (request.data.phoneNumber) {
        const savedY3 = y;
        drawInfoRow('Phone Number', request.data.phoneNumber, col1X, colWidth);
        const afterCol1Row3 = y;
        y = savedY3;
        if (request.data.location) {
          drawInfoRow('Location', request.data.location, col2X, colWidth);
        } else if (request.data.city && request.data.state) {
          drawInfoRow('City, State', `${request.data.city}, ${request.data.state}`, col2X, colWidth);
        }
        y = Math.max(afterCol1Row3, y);
      } else if (request.data.location) {
        drawInfoRow('Location', request.data.location, col1X, colWidth);
      } else if (request.data.city && request.data.state) {
        drawInfoRow('City, State', `${request.data.city}, ${request.data.state}`, col1X, colWidth);
      }

      doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
      doc.line(marginLeft, y, marginLeft + contentWidth, y);
      y += 10;

      // ─── CASE SUMMARY SECTION ───
      drawSectionHeader('Case Summary');

      const descBoxX = marginLeft + 3;
      const descBoxWidth = contentWidth - 6;
      const descPadding = 8;
      const descTextWidth = descBoxWidth - descPadding * 2;

      const parseHtmlToBlocks = (html: string) => {
        const blocks: Array<{type: string; text: string; items?: string[]; level?: number}> = [];
        const decoded = html
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&nbsp;/g, ' ');

        const stripTags = (s: string) => s.replace(/<[^>]+>/g, '').trim();

        const tokens: Array<{index: number; type: string; content: string; items?: string[]}> = [];

        let m;
        const h4Re = /<h4[^>]*>([\s\S]*?)<\/h4>/gi;
        while ((m = h4Re.exec(decoded)) !== null) {
          tokens.push({ index: m.index, type: 'heading', content: stripTags(m[1]) });
        }

        const olRe = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
        while ((m = olRe.exec(decoded)) !== null) {
          const items: string[] = [];
          let li;
          const liRe2 = /<li[^>]*>([\s\S]*?)<\/li>/gi;
          while ((li = liRe2.exec(m[1])) !== null) {
            items.push(stripTags(li[1]));
          }
          tokens.push({ index: m.index, type: 'orderedList', content: '', items });
        }

        const ulRe = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
        while ((m = ulRe.exec(decoded)) !== null) {
          const items: string[] = [];
          let li;
          const liRe3 = /<li[^>]*>([\s\S]*?)<\/li>/gi;
          while ((li = liRe3.exec(m[1])) !== null) {
            items.push(stripTags(li[1]));
          }
          tokens.push({ index: m.index, type: 'unorderedList', content: '', items });
        }

        const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        while ((m = pRe.exec(decoded)) !== null) {
          const text = stripTags(m[1]);
          if (text) {
            tokens.push({ index: m.index, type: 'paragraph', content: text });
          }
        }

        tokens.sort((a, b) => a.index - b.index);

        if (tokens.length === 0) {
          const plain = stripTags(decoded).replace(/\n{3,}/g, '\n\n').trim();
          if (plain) {
            blocks.push({ type: 'paragraph', text: plain });
          }
        } else {
          tokens.forEach(t => {
            if (t.type === 'heading') {
              blocks.push({ type: 'heading', text: t.content });
            } else if (t.type === 'orderedList' && t.items) {
              blocks.push({ type: 'orderedList', text: '', items: t.items });
            } else if (t.type === 'unorderedList' && t.items) {
              blocks.push({ type: 'unorderedList', text: '', items: t.items });
            } else if (t.type === 'paragraph') {
              blocks.push({ type: 'paragraph', text: t.content });
            }
          });
        }

        return blocks;
      };

      const blocks = parseHtmlToBlocks(request.data.caseDescription);

      const textX = descBoxX + descPadding;

      const computeBlockHeight = (block: {type: string; text: string; items?: string[]}, isFirst: boolean) => {
        let h = 0;
        if (block.type === 'heading') {
          if (!isFirst) h += 5;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          const hLines = doc.splitTextToSize(block.text, descTextWidth);
          h += hLines.length * 6 + 2;
        } else if (block.type === 'orderedList' || block.type === 'unorderedList') {
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'normal');
          (block.items || []).forEach(item => {
            const iLines = doc.splitTextToSize(item, descTextWidth - 15);
            h += iLines.length * 4.5 + 1.5;
          });
          h += 2;
        } else {
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'normal');
          const pLines = doc.splitTextToSize(block.text, descTextWidth);
          h += pLines.length * 4.5 + 3;
        }
        return h;
      };

      let totalDescHeight = descPadding * 2;
      blocks.forEach((block, idx) => {
        totalDescHeight += computeBlockHeight(block, idx === 0);
      });

      const maxBoxOnPage = pageHeight - footerHeight - y;
      if (totalDescHeight <= maxBoxOnPage) {
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
        doc.roundedRect(descBoxX, y, descBoxWidth, totalDescHeight, 2, 2, 'FD');
      } else {
        const firstPageBoxHeight = maxBoxOnPage;
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
        doc.roundedRect(descBoxX, y, descBoxWidth, firstPageBoxHeight, 2, 2, 'FD');
      }

      y += descPadding;

      const drawContinuationBox = () => {
        const remainingOnNewPage = pageHeight - footerHeight - 25;
        doc.setFillColor(COLORS.lightGray[0], COLORS.lightGray[1], COLORS.lightGray[2]);
        doc.setDrawColor(COLORS.borderGray[0], COLORS.borderGray[1], COLORS.borderGray[2]);
        doc.roundedRect(descBoxX, 25, descBoxWidth, remainingOnNewPage, 2, 2, 'FD');
      };

      const checkPageDesc = (needed: number) => {
        if (y + needed > pageHeight - footerHeight) {
          doc.addPage();
          y = 25;
          drawContinuationBox();
          y += descPadding;
        }
      };

      blocks.forEach((block, blockIdx) => {
        if (block.type === 'heading') {
          checkPageDesc(16);
          if (blockIdx > 0) y += 5;
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          setColor(COLORS.black);
          const hLines = doc.splitTextToSize(block.text, descTextWidth);
          hLines.forEach((line: string) => {
            checkPageDesc(7);
            doc.text(line, textX, y);
            y += 6;
          });
          y += 2;
        } else if (block.type === 'orderedList' || block.type === 'unorderedList') {
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'normal');
          setColor(COLORS.darkGray);
          (block.items || []).forEach((item, idx) => {
            checkPageDesc(8);
            const prefix = block.type === 'orderedList' ? `${idx + 1}.` : '\u2022';
            doc.setFont('helvetica', 'bold');
            doc.text(prefix, textX + 2, y);
            doc.setFont('helvetica', 'normal');
            const itemLines = doc.splitTextToSize(item, descTextWidth - 15);
            itemLines.forEach((line: string) => {
              checkPageDesc(6);
              doc.text(line, textX + 12, y);
              y += 4.5;
            });
            y += 1.5;
          });
          y += 2;
        } else {
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'normal');
          setColor(COLORS.darkGray);
          const pLines = doc.splitTextToSize(block.text, descTextWidth);
          pLines.forEach((line: string) => {
            checkPageDesc(6);
            doc.text(line, textX, y);
            y += 4.5;
          });
          y += 3;
        }
      });

      y += descPadding;
      y += 10;

      // ─── IMPORTANT NOTICE ───
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
      setColor(COLORS.noticeText);
      const noticeLines = doc.splitTextToSize(
        'This intake summary provides general information only and does not constitute legal advice. For specific legal questions, consult with a qualified immigration attorney.',
        contentWidth - 20
      );
      noticeLines.forEach((line: string, idx: number) => {
        doc.text(line, marginLeft + 14, y + 14 + idx * 3.5);
      });

      y += noticeHeight + 10;

      // ─── FOOTER ON ALL PAGES ───
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
      
      const filename = `LinkToLawyers_Case_${request.data.requestNumber.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
    </div>
  );
};

export default CaseDetailsPage;