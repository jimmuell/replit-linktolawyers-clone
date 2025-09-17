import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface TrackRequestModalSpanishProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackRequestModalSpanish({ isOpen, onClose }: TrackRequestModalSpanishProps) {
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
        title: "Número de Solicitud Requerido",
        description: "Por favor, selecciona o ingresa un número de solicitud para rastrear.",
        variant: "destructive",
      });
      return;
    }

    // Close modal and navigate to Spanish quotes page
    handleClose();
    setLocation(`/quotes/${requestNumber}/spanish`);
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
          <DialogTitle>Rastrea Tu Solicitud Legal</DialogTitle>
          <DialogDescription>
            Ingresa tu número de solicitud para ver las cotizaciones de abogados disponibles.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>¿Cómo quieres buscar?</Label>
            <Select value={searchType} onValueChange={(value: 'dropdown' | 'manual') => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dropdown">Seleccionar de solicitudes recientes</SelectItem>
                <SelectItem value="manual">Ingresar número manualmente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchType === 'dropdown' ? (
            <div className="space-y-2">
              <Label>Seleccionar Solicitud</Label>
              <Select value={selectedRequest} onValueChange={setSelectedRequest} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoading ? "Cargando solicitudes..." : "Elegir una solicitud"} />
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
              <Label htmlFor="requestNumber">Número de Solicitud</Label>
              <Input
                id="requestNumber"
                type="text"
                placeholder="ej: LR-123456"
                value={manualRequestNumber}
                onChange={(e) => setManualRequestNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrackRequest()}
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleTrackRequest} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={searchType === 'dropdown' ? !selectedRequest : !manualRequestNumber.trim()}
            >
              <Search className="w-4 h-4 mr-2" />
              Rastrear Solicitud
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}