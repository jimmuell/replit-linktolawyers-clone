import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Star, MapPin, Briefcase, Shield, DollarSign, Calendar, Users, Award } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Attorney {
  id: number;
  firstName: string;
  lastName: string;
  firmName: string;
  licenseState: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  isVerified: boolean;
  bio: string;
}

interface LegalRequestData {
  id: number;
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  caseType: string;
  caseDescription: string;
  location: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AttorneyAssignment {
  id: number;
  requestId: number;
  attorneyId: number;
  assignedAt: string;
  status: string;
  notes: string | null;
  emailSent: boolean;
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  attorney: Attorney;
}

export default function QuotesPageSpanish() {
  const [match, params] = useRoute('/quotes/:requestNumber/spanish');
  const [location, setLocation] = useLocation();
  const requestNumber = params?.requestNumber;
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showProcessingOverlay, setShowProcessingOverlay] = useState(false);
  const [processingStep, setProcessingStep] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch legal request data
  const { data: request, isLoading: requestLoading, error: requestError } = useQuery({
    queryKey: [`/api/legal-requests/${requestNumber}`],
    enabled: !!requestNumber,
    retry: false,
  });

  // Fetch attorneys for this case type
  const caseType = (request as any)?.data?.caseType;
  const { data: attorneys, isLoading: attorneysLoading } = useQuery({
    queryKey: [`/api/public/attorneys/case-type/${caseType}`],
    enabled: !!caseType,
    retry: false,
  });

  // Fetch assigned attorneys for this request
  const { data: assignedAttorneys, isLoading: assignedLoading } = useQuery({
    queryKey: [`/api/attorney-referrals/public/request/${(request as any)?.data?.id}/attorneys`],
    enabled: !!(request as any)?.data?.id,
    retry: false,
  });

  console.log('Assigned attorneys data:', assignedAttorneys);
  console.log('Assigned attorneys final:', assignedAttorneys);
  console.log('Available attorneys data:', attorneys);
  console.log('Case type for attorney lookup:', caseType);
  console.log('Request data:', request);

  // Pre-select assigned attorneys when data loads
  useEffect(() => {
    if (assignedAttorneys && Array.isArray(assignedAttorneys)) {
      const assignedIds = assignedAttorneys.map((assignment: AttorneyAssignment) => assignment.attorney.id);
      console.log('Pre-selecting assigned attorney IDs:', assignedIds);
      setSelectedQuotes(assignedIds);
    }
  }, [assignedAttorneys]);

  // Assign attorneys mutation
  const assignAttorneysMutation = useMutation({
    mutationFn: async (data: { requestId: number; attorneyIds: number[] }) => {
      return apiRequest(`/api/public/requests/${data.requestId}/attorneys`, {
        method: 'POST',
        body: JSON.stringify({ attorneyIds: data.attorneyIds }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/attorney-referrals/public/request/${(request as any)?.data?.id}/attorneys`] });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest(`/api/public/requests/${requestId}/send-attorney-emails`, {
        method: 'POST',
      });
    },
  });

  const handleToggleQuote = (attorneyId: number) => {
    setSelectedQuotes(prev => 
      prev.includes(attorneyId) 
        ? prev.filter(id => id !== attorneyId)
        : [...prev, attorneyId]
    );
  };

  const getNewlySelectedAttorneys = () => {
    const assignedIds = (assignedAttorneys as any)?.map?.((assignment: AttorneyAssignment) => assignment.attorney.id) || [];
    return selectedQuotes.filter(id => !assignedIds.includes(id));
  };

  const assignAttorneysMutationFn = useMutation({
    mutationFn: async (data: { requestId: number; attorneyIds: number[] }) => {
      return apiRequest(`/api/public/requests/${data.requestId}/attorneys`, {
        method: 'POST',
        body: JSON.stringify({ attorneyIds: data.attorneyIds }),
      });
    },
    onError: (error: any) => {
      console.error('Assignment error:', error);
      toast({
        title: "Error",
        description: error?.message || "Error al asignar abogados. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const sendEmailMutationFn = useMutation({
    mutationFn: async (requestId: number) => {
      return apiRequest(`/api/public/requests/${requestId}/send-attorney-emails`, {
        method: 'POST',
      });
    },
    onError: (error: any) => {
      console.error('Email error:', error);
      toast({
        title: "Error",
        description: error?.message || "Error al enviar notificaciones por email. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const handleConnectWithAttorneys = async () => {
    const newlySelectedAttorneys = getNewlySelectedAttorneys();
    if (!(request as any)?.data || newlySelectedAttorneys.length === 0) return;
    
    // Show full-screen processing overlay immediately
    setShowProcessingOverlay(true);
    setProcessingStep(1);
    setIsAssigning(true);
    
    try {
      console.log('Assigning ALL selected attorneys:', selectedQuotes);
      console.log('Newly selected attorneys:', newlySelectedAttorneys);
      
      // Step 1: Assigning attorneys (show for 2 seconds)
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Assign ALL selected attorneys (both existing and newly selected) to maintain existing assignments
      await assignAttorneysMutation.mutateAsync({
        requestId: (request as any).data.id,
        attorneyIds: selectedQuotes
      });
      
      // Step 2: Sending notifications (show for 3 seconds)
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Then send notification emails to the newly assigned attorneys
      await sendEmailMutation.mutateAsync((request as any).data.id);
      
      // Step 3: Finalizing (show for 1 second)
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to success page or show completion
      setLocation(`/quotes/${requestNumber}/success-spanish`);
      
    } catch (error: any) {
      console.error('Error assigning attorneys:', error);
      setShowProcessingOverlay(false);
      toast({
        title: "Error",
        description: error.message || "Error al asignar abogados. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmRequest = () => {
    setShowConfirmDialog(false);
    // Optional: Navigate to tracking or home page
  };

  const handleBackToHome = () => {
    setLocation('/es');
  };

  if (requestLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (requestError || !(request as any)?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Solicitud No Encontrada</h1>
          <p className="text-gray-600 mb-6">No pudimos encontrar una solicitud con ese número.</p>
          <Button onClick={handleBackToHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const getCaseTypeDisplayName = (caseType: string) => {
    const mapping: { [key: string]: string } = {
      'family-based-immigrant-visa-immediate-relative': 'Visa de Inmigrante Basada en Familia - Pariente Inmediato',
      'family-based-immigrant-visa-family-preference': 'Visa de Inmigrante Basada en Familia - Categoría de Preferencia Familiar',
      'family-based-immigrant-visa-waivers': 'Visa de Inmigrante Basada en Familia - Exenciones',
      'k1-fiance-visa': 'Visa K-1 de Prometido(a)',
      'citizenship-naturalization-n400': 'Ciudadanía y Naturalización - Naturalización (N-400)',
      'citizenship-naturalization-n600': 'Ciudadanía y Naturalización - Ciudadanía a través de Padres (N-600)',
      'asylum-affirmative': 'Asilo - Asilo Afirmativo',
      'asylum-defensive': 'Asilo - Asilo Defensivo',
      'deportation-defense': 'Defensa de Deportación / Procesos de Remoción',
      'vawa': 'Ley de Violencia Contra la Mujer (VAWA)',
      'other': 'Otro'
    };
    return mapping[caseType] || caseType;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={handleBackToHome}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
            <div className="text-sm text-gray-500">
              Solicitud #{requestNumber?.toUpperCase()}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cotizaciones de Abogados para {(request as any).data.firstName} {(request as any).data.lastName}
          </h1>
          <p className="text-gray-600">
            Revisa y selecciona los abogados con los que te gustaría conectarte para tu caso de {getCaseTypeDisplayName((request as any).data.caseType) as string}.
          </p>
        </div>

        {/* Case Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Resumen del Caso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-medium text-gray-700">Tipo de Caso:</span>
                <p className="text-gray-900">{getCaseTypeDisplayName((request as any).data.caseType)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Ubicación:</span>
                <p className="text-gray-900">{(request as any).data.location || 'No especificada'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha de Solicitud:</span>
                <p className="text-gray-900">{new Date((request as any).data.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="font-medium text-gray-700">Descripción del Caso:</span>
              <p className="text-gray-900 mt-1">{(request as any).data.caseDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Selected Attorneys Section */}
        {assignedAttorneys && (assignedAttorneys as any).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Abogados Asignados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(assignedAttorneys as any).map((assignment: AttorneyAssignment) => (
                <Card key={assignment.id} className="border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {assignment.attorney.firstName} {assignment.attorney.lastName}
                        </h3>
                        {assignment.attorney.isVerified && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        Seleccionado
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{assignment.attorney.firmName}</p>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{assignment.attorney.licenseState}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
                      <Calendar className="w-3 h-3" />
                      <span>{assignment.attorney.yearsOfExperience} años de experiencia</span>
                    </div>
                    
                    {assignment.emailSent && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Email Enviado
                        </Badge>
                        <span className="text-xs">
                          {assignment.emailSentAt && new Date(assignment.emailSentAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Attorneys */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Abogados Disponibles</h2>
          
          {attorneysLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : attorneys && (attorneys as any).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(attorneys as any).map((attorney: Attorney) => (
                <Card key={attorney.id} className={`cursor-pointer transition-all ${
                  selectedQuotes.includes(attorney.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {attorney.firstName} {attorney.lastName}
                        </h3>
                        {attorney.isVerified && (
                          <Shield className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <Checkbox
                        checked={selectedQuotes.includes(attorney.id)}
                        onCheckedChange={() => handleToggleQuote(attorney.id)}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{attorney.firmName}</p>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{attorney.licenseState}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{attorney.yearsOfExperience} años de experiencia</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
                      <DollarSign className="w-3 h-3" />
                      <span>${attorney.hourlyRate}/hora</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{attorney.bio}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {attorney.practiceAreas.slice(0, 2).map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {attorney.practiceAreas.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{attorney.practiceAreas.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay abogados disponibles</h3>
                <p className="text-gray-600">
                  Actualmente no hay abogados disponibles para este tipo de caso. Por favor, inténtalo de nuevo más tarde.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Connect Button */}
        {getNewlySelectedAttorneys().length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={handleConnectWithAttorneys}
              disabled={isAssigning}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 shadow-lg"
            >
{isAssigning ? 'Procesando solicitud...' : `Conectar con ${getNewlySelectedAttorneys().length} Abogado${getNewlySelectedAttorneys().length === 1 ? '' : 's'} Seleccionado${getNewlySelectedAttorneys().length === 1 ? '' : 's'}`}
            </Button>
          </div>
        )}

        {/* Processing Overlay */}
        {showProcessingOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                {processingStep === 1 && (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Asignando Abogados</h3>
                    <p className="text-gray-600">Te estamos conectando con los abogados seleccionados...</p>
                  </>
                )}
                {processingStep === 2 && (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enviando Notificaciones</h3>
                    <p className="text-gray-600">Notificando a los abogados sobre tu caso...</p>
                  </>
                )}
                {processingStep === 3 && (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Finalizando Solicitud</h3>
                    <p className="text-gray-600">Completando tu selección de abogados...</p>
                  </>
                )}
              </div>
              <div className="flex space-x-2 justify-center mb-4">
                <div className={`w-2 h-2 rounded-full ${processingStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${processingStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${processingStep >= 3 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-sm text-gray-500">Por favor, espera mientras procesamos tu solicitud...</p>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>¡Abogados Notificados Exitosamente!</DialogTitle>
              <DialogDescription>
                Tus abogados seleccionados han sido notificados y te contactarán pronto para discutir tu caso y proporcionar sus cotizaciones.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-600 font-bold">
                Por favor, revisa tu carpeta de spam o correo no deseado si no ves el email en tu bandeja de entrada.
              </p>
              <p className="text-sm text-gray-600">
                Los abogados seleccionados también han sido notificados y te contactarán directamente dentro de 24 horas.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleConfirmRequest} className="bg-black hover:bg-gray-800 text-white">
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}