import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface TrackRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackRequestModal({ isOpen, onClose }: TrackRequestModalProps) {
  const [searchType, setSearchType] = useState<'dropdown' | 'manual'>('manual');
  const [selectedRequest, setSelectedRequest] = useState<string>('');
  const [manualRequestNumber, setManualRequestNumber] = useState<string>('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch available structured intakes for dropdown
  const { data: structuredIntakes, isLoading } = useQuery<{data: Array<{id: number, requestNumber: string, firstName: string, lastName: string, caseType: string, status: string}>}>({
    queryKey: ['/api/structured-intakes/public'],
    enabled: isOpen,
  });

  const handleTrackRequest = () => {
    const requestNumber = searchType === 'dropdown' ? selectedRequest : manualRequestNumber.trim();
    
    if (!requestNumber) {
      toast({
        title: "Request Number Required",
        description: "Please select or enter a request number to track.",
        variant: "destructive",
      });
      return;
    }

    // Close modal and navigate to QuotesPage
    onClose();
    setLocation(`/quotes/${requestNumber}`);
  };

  const handleClose = () => {
    // Reset form state
    setSearchType('manual');
    setSelectedRequest('');
    setManualRequestNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Track Your Request</span>
          </DialogTitle>
          <DialogDescription>
            Enter your legal request number to view available attorneys and quotes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>How would you like to search?</Label>
            <Select value={searchType} onValueChange={(value: 'dropdown' | 'manual') => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dropdown">Select from recent requests</SelectItem>
                <SelectItem value="manual">Enter request number manually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchType === 'dropdown' ? (
            <div className="space-y-2">
              <Label>Select Request</Label>
              <Select value={selectedRequest} onValueChange={setSelectedRequest} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Loading intakes..." : "Choose a request"} />
                </SelectTrigger>
                <SelectContent>
                  {structuredIntakes?.data?.map((intake: any) => (
                    <SelectItem key={intake.id} value={intake.requestNumber}>
                      {intake.requestNumber} - {intake.firstName} {intake.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="requestNumber">Request Number</Label>
              <Input
                id="requestNumber"
                placeholder="Enter your request number (e.g., LR-123456)"
                value={manualRequestNumber}
                onChange={(e) => setManualRequestNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTrackRequest();
                  }
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleTrackRequest} className="bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4 mr-2" />
              Track Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}