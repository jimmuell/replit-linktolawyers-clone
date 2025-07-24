import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface TrackRequestModalSpanishProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackRequestModalSpanish({ isOpen, onClose }: TrackRequestModalSpanishProps) {
  const [requestNumber, setRequestNumber] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleTrackRequest = () => {
    const trimmedRequestNumber = requestNumber.trim();
    
    if (!trimmedRequestNumber) {
      toast({
        title: "Número de Solicitud Requerido",
        description: "Por favor, ingresa un número de solicitud para rastrear.",
        variant: "destructive",
      });
      return;
    }

    // Close modal and navigate to Spanish quotes page
    handleClose();
    setLocation(`/quotes/${trimmedRequestNumber}/spanish`);
  };

  const handleClose = () => {
    setRequestNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rastrea Tu Solicitud Legal</DialogTitle>
          <DialogDescription>
            Ingresa tu número de solicitud para ver las cotizaciones de abogados disponibles.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requestNumber">Número de Solicitud</Label>
            <Input
              id="requestNumber"
              type="text"
              placeholder="ej: LR-123456"
              value={requestNumber}
              onChange={(e) => setRequestNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackRequest()}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTrackRequest} 
              className="flex-1"
              disabled={!requestNumber.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Rastrear Solicitud
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}