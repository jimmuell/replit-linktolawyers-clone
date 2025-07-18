import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Clock, User, Mail, Phone, MapPin, FileText, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusInfoSpanish } from '@shared/statusCodes';

interface TrackRequestModalSpanishProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LegalRequest {
  id: number;
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  caseType: string;
  caseDescription: string;
  urgencyLevel: string;
  budgetRange: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrackRequestModalSpanish({ isOpen, onClose }: TrackRequestModalSpanishProps) {
  const [requestNumber, setRequestNumber] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: request, isLoading, error, refetch } = useQuery<LegalRequest>({
    queryKey: ['/api/legal-requests', requestNumber],
    queryFn: async () => {
      const response = await fetch(`/api/legal-requests/${requestNumber}`);
      if (!response.ok) {
        throw new Error('Request not found');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: shouldFetch && requestNumber.length > 0,
    retry: false,
  });

  const handleTrackRequest = () => {
    if (requestNumber.trim()) {
      setShouldFetch(true);
      refetch();
    }
  };

  const handleClose = () => {
    setRequestNumber('');
    setShouldFetch(false);
    onClose();
  };

  const getUrgencyBadgeSpanish = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'moderate':
        return <Badge variant="secondary">Moderada</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return <Badge variant="outline">{urgency || 'No especificado'}</Badge>;
    }
  };

  const getBudgetRangeSpanish = (budgetRange: string) => {
    const budgetMap: { [key: string]: string } = {
      '0-1000': '$0 - $1,000',
      '1000-2500': '$1,000 - $2,500',
      '2500-5000': '$2,500 - $5,000',
      '5000-10000': '$5,000 - $10,000',
      '10000+': '$10,000+',
    };
    return budgetMap[budgetRange] || budgetRange;
  };

  const getCaseTypeSpanish = (caseType: string) => {
    const caseTypeMap: { [key: string]: string } = {
      'fam-imm-immediate': 'Visa de Inmigrante Basada en Familia (Familiar Inmediato)',
      'fam-imm-preference': 'Visa de Inmigrante Basada en Familia (Categoría de Preferencia)',
      'fam-imm-waiver': 'Visa de Inmigrante Basada en Familia (Perdón)',
      'k1-fiance': 'Visa de Prometido(a) K-1',
      'citizenship-naturalization': 'Ciudadanía y Naturalización (N-400)',
      'citizenship-certificate': 'Certificado de Ciudadanía (N-600)',
      'asylum-affirmative': 'Asilo (Afirmativo)',
      'asylum-defensive': 'Asilo (Defensivo)',
      'deportation-defense': 'Defensa contra Deportación',
      'vawa': 'Ley de Violencia contra las Mujeres (VAWA)',
      'other': 'Otro',
    };
    return caseTypeMap[caseType] || caseType;
  };

  const formatRequestNumber = (value: string) => {
    // Remove any non-alphanumeric characters and convert to lowercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Add "lr-" prefix if not present
    if (cleaned.startsWith('lr')) {
      if (cleaned.length > 2 && cleaned[2] !== '-') {
        return 'lr-' + cleaned.slice(2);
      }
      return cleaned;
    } else if (cleaned.length > 0) {
      return 'lr-' + cleaned;
    }
    return cleaned;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRequestNumber(e.target.value);
    setRequestNumber(formatted);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Rastrea Tu Solicitud</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Ingresa tu número de solicitud legal para verificar el estado de tu cotización
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestNumber">Número de Solicitud Legal</Label>
              <div className="flex space-x-2">
                <Input
                  id="requestNumber"
                  placeholder="Ingresa tu número de solicitud (ej: lr-123456)"
                  value={requestNumber}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrackRequest}
                  disabled={!requestNumber.trim() || isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? 'Buscando...' : 'Rastrear'}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Tu número de solicitud fue proporcionado cuando enviaste tu solicitud de cotización legal. 
              Debe verse como "lr-123456".
            </p>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-700">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Solicitud No Encontrada</span>
                </div>
                <p className="mt-2 text-sm text-red-600">
                  No pudimos encontrar una solicitud con el número "{requestNumber}". 
                  Por favor verifica tu número de solicitud e intenta nuevamente.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Request Details */}
          {request && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Detalles de la Solicitud</span>
                </CardTitle>
                <CardDescription>
                  Solicitud enviada el {format(new Date(request.createdAt), 'd \'de\' MMMM \'de\' yyyy', { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Número de Solicitud</Label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{request.requestNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Estado</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <Badge variant={getStatusInfoSpanish(request.status).color === 'green' ? 'default' : 
                                   getStatusInfoSpanish(request.status).color === 'yellow' ? 'secondary' : 
                                   getStatusInfoSpanish(request.status).color === 'red' ? 'destructive' : 'outline'}>
                        {getStatusInfoSpanish(request.status).label}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Nombre del Cliente</span>
                    </Label>
                    <p className="text-sm">{request.firstName} {request.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>Correo Electrónico</span>
                    </Label>
                    <p className="text-sm">{request.email}</p>
                  </div>
                  {request.phoneNumber && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>Teléfono</span>
                      </Label>
                      <p className="text-sm">{request.phoneNumber}</p>
                    </div>
                  )}
                  {request.location && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Ubicación</span>
                      </Label>
                      <p className="text-sm">{request.location}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Nivel de Urgencia</Label>
                    <div>{getUrgencyBadgeSpanish(request.urgencyLevel)}</div>
                  </div>
                  {request.budgetRange && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Rango de Presupuesto</span>
                      </Label>
                      <p className="text-sm">{getBudgetRangeSpanish(request.budgetRange)}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Tipo de Caso</Label>
                  <p className="text-sm">{getCaseTypeSpanish(request.caseType)}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Descripción del Caso</Label>
                  <p className="text-sm text-gray-700 leading-relaxed">{request.caseDescription}</p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Estado Actual</h4>
                  <p className="text-sm text-blue-800 mb-3">{getStatusInfoSpanish(request.status).description}</p>
                  <h4 className="font-medium text-blue-900 mb-2">¿Qué Sigue?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Nuestro sistema te está conectando con abogados calificados</li>
                    <li>• Recibirás cotizaciones personalizadas en 24-48 horas</li>
                    <li>• Revisa tu correo electrónico (incluyendo la carpeta de spam) para actualizaciones</li>
                    <li>• Puedes rastrear tu solicitud en cualquier momento usando este número</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}