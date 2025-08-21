import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Star, MapPin, Briefcase, Shield, DollarSign, Calendar, Users, Award, CheckCircle, Clock, Mail } from 'lucide-react';
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



  // Pre-select assigned attorneys when data loads
  useEffect(() => {
    if (assignedAttorneys && Array.isArray(assignedAttorneys)) {
      const assignedIds = assignedAttorneys.map((assignment: AttorneyAssignment) => assignment.attorney.id);

      setSelectedQuotes(assignedIds);
    }
  }, [assignedAttorneys]);

  // Assign attorneys mutation
  const assignAttorneysMutation = useMutation({
    mutationFn: async (data: { requestId: number; attorneyIds: number[] }) => {
      return apiRequest(`/api/public/requests/${data.requestId}/attorneys`, {
        method: 'POST',
        body: { attorneyIds: data.attorneyIds },
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





  const handleConnectWithAttorneys = async () => {
    const newlySelectedAttorneys = getNewlySelectedAttorneys();
    if (!(request as any)?.data || newlySelectedAttorneys.length === 0) return;
    
    // Show full-screen processing overlay immediately
    setShowProcessingOverlay(true);
    setProcessingStep(1);
    setIsAssigning(true);
    
    try {
      // Debug: console.log('Assigning ALL selected attorneys:', selectedQuotes);
      // Debug: console.log('Newly selected attorneys:', newlySelectedAttorneys);
      
      // Step 1: Assigning attorneys (show for 2 seconds)
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Assign ALL selected attorneys (both existing and newly selected) to maintain existing assignments
      await assignAttorneysMutation.mutateAsync({
        requestId: (request as any).data.id,
        attorneyIds: selectedQuotes
      });
      
      // Debug: console.log('Attorneys assigned successfully');
      
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
    // Instantly position at top without visible scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
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
            Revisa y selecciona los abogados con los que te gustaría conectarte para tu caso de {getCaseTypeDisplayName((request as any)?.data?.caseType) || ''}.
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
                <span className="font-medium text-gray-700">Correo Electrónico:</span>
                <p className="text-gray-900">{(request as any).data.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Teléfono:</span>
                <p className="text-gray-900">{(request as any).data.phoneNumber}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <span className="font-medium text-gray-700">Ubicación:</span>
                <p className="text-gray-900">{(request as any).data.location || 'No especificada'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Fecha de Solicitud:</span>
                <p className="text-gray-900">
                  {new Date((request as any).data.createdAt).toLocaleDateString('es-ES')} a las {new Date((request as any).data.createdAt).toLocaleTimeString('es-ES')}
                </p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Abogados Seleccionados ({(assignedAttorneys as any).length})</h2>
            <div className="space-y-6">
              {(assignedAttorneys as any).map((assignment: AttorneyAssignment) => {
                const attorney = assignment.attorney;
                return (
                  <Card key={assignment.id} className="border border-blue-200 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {attorney.firstName} {attorney.lastName}
                              </h3>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Seleccionado
                              </span>
                              {attorney.isVerified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verificado
                                </span>
                              )}
                              {assignment.emailSent && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Notificado
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{attorney.firmName}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                {attorney.licenseState}
                              </span>
                              <span className="text-sm text-gray-500">
                                {attorney.yearsOfExperience}+ años
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            Proporcionará cotización
                          </div>
                          <div className="text-sm text-gray-500">Contacto en 24hrs</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-6">
                        {attorney.bio}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">Especialidades</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {attorney.practiceAreas?.map((area: string, index: number) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {area === 'Immigration Law' ? 'Ley de Inmigración' :
                                   area === 'Corporate Law' ? 'Derecho Corporativo' :
                                   area === 'Criminal Law' ? 'Derecho Penal' : area}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">Próximos Pasos</span>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">El abogado ha sido notificado</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span className="text-xs text-gray-600">El abogado te contactará en 24 horas</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Se programará consulta gratuita</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Attorneys - matching admin dashboard format exactly */}
        {attorneysLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando abogados...</p>
          </div>
        ) : (() => {
          // Filter out already assigned attorneys to prevent duplication
          const assignedAttorneyIds = (assignedAttorneys as any)?.map?.((assignment: AttorneyAssignment) => assignment.attorney.id) || [];
          const availableAttorneys = (attorneys as any)?.filter?.((attorney: Attorney) => !assignedAttorneyIds.includes(attorney.id)) || [];
          
          return availableAttorneys.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay abogados adicionales disponibles para este tipo de caso</p>
              <p className="text-sm text-gray-500 mt-2">
                Ya has seleccionado todos los abogados disponibles para "{getCaseTypeDisplayName((request as any)?.data?.caseType || '')}"
              </p>
            </div>
          ) : (
            <>
              <div>
                <h3 className="font-medium mb-3">Abogados Adicionales ({availableAttorneys.length})</h3>
                <div className="space-y-6">
                  {availableAttorneys.map((attorney: Attorney) => (
                  <Card 
                    key={attorney.id} 
                    className={`border transition-all duration-200 cursor-pointer hover:shadow-md ${
                      selectedQuotes.includes(attorney.id) 
                        ? 'border-blue-500 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleToggleQuote(attorney.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            id={`attorney-${attorney.id}`}
                            checked={selectedQuotes.includes(attorney.id)}
                            onCheckedChange={() => handleToggleQuote(attorney.id)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {attorney.firstName} {attorney.lastName}
                              </h3>
                              {attorney.isVerified && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Verificado
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{attorney.firmName}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">
                                {attorney.licenseState}
                              </span>
                              <span className="text-sm text-gray-500">
                                {attorney.yearsOfExperience}+ años
                              </span>
                              {attorney.isVerified && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-500">5 (30 reseñas)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ${(attorney as any).fee ? ((attorney as any).fee / 100).toLocaleString() : '1,555'}
                          </div>
                          <div className="text-sm text-gray-500">${attorney.hourlyRate}/hora</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-6">
                        {attorney.bio || `Con ${attorney.yearsOfExperience} años de experiencia en derecho de inmigración, estoy comprometido a brindarte representación legal experta adaptada a tus necesidades específicas.`}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Cronograma</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">2-4 semanas</p>

                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">Especialidades</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {attorney.practiceAreas?.map((area: string, index: number) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                  {area}
                                </span>
                              )) || (
                                <>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                    Derecho de Inmigración
                                  </span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                    Defensa de Deportación
                                  </span>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                                    Casos de Asilo
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Opciones de Pago</span>
                          </div>
                          <div className="ml-6 space-y-1">
                            <p className="text-sm text-gray-900">Tarifa fija disponible</p>
                            <p className="text-sm text-gray-900">Plan de pagos</p>
                            <p className="text-sm text-gray-900">Consulta gratuita</p>
                          </div>

                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-600">Próximos Pasos</span>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">El abogado será notificado</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-blue-500" />
                                <span className="text-xs text-gray-600">El abogado te contactará en 24 horas</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-gray-600">Se programará consulta gratuita</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

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