import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, X } from 'lucide-react';

interface EmailPreview {
  subject: string;
  html: string;
  text: string;
}

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailPreview: EmailPreview | null;
  recipientEmail: string;
  onSendEmail: () => void;
  isSending: boolean;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  emailPreview,
  recipientEmail,
  onSendEmail,
  isSending
}: EmailPreviewModalProps) {
  if (!emailPreview) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Headers */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">To:</span>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{recipientEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Subject:</span>
                <span className="text-sm">{emailPreview.subject}</span>
              </div>
            </div>
          </div>
          
          {/* Email Content Tabs */}
          <Tabs defaultValue="html" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html">HTML Preview</TabsTrigger>
              <TabsTrigger value="text">Plain Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="html" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <div 
                  className="max-h-[400px] overflow-y-auto p-4"
                  dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="mt-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <pre className="text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                  {emailPreview.text}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={onSendEmail}
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}