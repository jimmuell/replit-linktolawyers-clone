import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import HierarchicalCaseTypeSelect from "@/components/HierarchicalCaseTypeSelect";

interface SpanishLegalRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpanishLegalRequestForm({ isOpen, onClose }: SpanishLegalRequestFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    caseType: '',
    email: '',
    phoneNumber: '',
    caseDescription: '',
    location: '',
    captcha: '',
    agreeToTerms: false
  });

  const [prefillChecked, setPrefillChecked] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [currentRequestNumber, setCurrentRequestNumber] = useState<string>('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  // Fetch case types for dropdown
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
  });

  const caseTypes = caseTypesData?.data || [];

  // Generate request number when form opens
  const generateRequestNumber = () => {
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `lr-${randomNumber}`;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if form has any data
  const hasFormData = () => {
    return Object.entries(formData).some(([key, value]) => {
      if (key === 'agreeToTerms') return false;
      return value !== '' && value !== false;
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrefillToggle = (checked: boolean) => {
    setPrefillChecked(checked);
    if (checked) {
      setFormData({
        firstName: 'María',
        lastName: 'González',
        caseType: 'family-based-immigrant-visa-immediate-relative',
        email: 'linktolawyers.us@gmail.com',
        phoneNumber: '(555) 123-4567',
        caseDescription: 'Necesito ayuda con la petición de visa de inmigrante para mi esposo. Él está actualmente en México y queremos reunirnos lo antes posible. Tenemos todos los documentos necesarios incluyendo acta de matrimonio, certificados de nacimiento y documentos financieros, pero necesitamos orientación profesional sobre el proceso completo y expectativas realistas de tiempo.',
        location: 'Miami, FL',
        captcha: '4',
        agreeToTerms: true
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        caseType: '',
        email: '',
        phoneNumber: '',
        caseDescription: '',
        urgencyLevel: '',
        budgetRange: '',
        location: '',
        captcha: '',
        agreeToTerms: false
      });
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      if (hasFormData() && !submittedRequestNumber) {
        setIsCancelDialogOpen(true);
      } else {
        onClose();
      }
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      caseType: '',
      email: '',
      phoneNumber: '',
      caseDescription: '',
      location: '',
      captcha: '',
      agreeToTerms: false
    });
    setSubmittedRequestNumber(null);
    setPrefillChecked(false);
    setCurrentRequestNumber('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.captcha !== '4') {
      setCaptchaError('Por favor, responde correctamente la pregunta de verificación');
      return;
    }

    setIsSubmitting(true);
    setCaptchaError(null);

    try {
      const response = await apiRequest('/api/legal-requests', {
        method: 'POST',
        body: { ...formData, requestNumber: currentRequestNumber }
      });

      const result = await response.json();

      if (result.success) {
        setSubmittedRequestNumber(result.data.requestNumber);
        
        // Send Spanish confirmation email
        try {
          await apiRequest(`/api/legal-requests/${result.data.requestNumber}/send-confirmation-spanish`, {
            method: 'POST',
            body: {}
          });
        } catch (emailError) {
          console.error('Error sending Spanish confirmation email:', emailError);
        }

        toast({
          title: "¡Solicitud enviada exitosamente!",
          description: "Hemos recibido tu solicitud legal y nos pondremos en contacto contigo pronto.",
        });
      } else {
        throw new Error(result.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting legal request:', error);
      toast({
        title: "Error",
        description: "Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (open && !currentRequestNumber) {
          setCurrentRequestNumber(generateRequestNumber());
        }
        handleModalClose(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              {submittedRequestNumber ? "Tus Cotizaciones Están En Camino" : "Solicita Tu Cotización Gratuita"}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              {submittedRequestNumber 
                ? "Te estamos conectando con abogados calificados a nivel nacional para proporcionarte cotizaciones personalizadas para tu caso"
                : "Cuéntanos sobre tu caso de inmigración y obtén cotizaciones personalizadas de abogados calificados"
              }
            </DialogDescription>
          </DialogHeader>
          
          {currentRequestNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">Número de Solicitud Legal:</span>
                <span className="text-sm font-mono font-bold text-blue-900">{currentRequestNumber}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Este número será asignado a tu solicitud al enviarla
              </p>
            </div>
          )}
          
          {!submittedRequestNumber && (
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="prefill-spanish"
                checked={prefillChecked}
                onCheckedChange={handlePrefillToggle}
              />
              <Label htmlFor="prefill-spanish" className="text-sm font-medium">
                Rellenar formulario con datos de ejemplo
              </Label>
            </div>
          )}

          {submittedRequestNumber ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ¡Solicitud Enviada Exitosamente!
                </h3>
                <p className="text-green-700 mb-3">
                  Tu solicitud legal ha sido enviada y asignada el siguiente número:
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-3 inline-flex items-center gap-2">
                  <span className="text-xl font-mono font-bold text-green-800">
                    {submittedRequestNumber}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(submittedRequestNumber)}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                    title="Copiar al portapapeles"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-3">
                  Por favor, guarda este número para tus registros.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    📧 <strong>¡Email de confirmación enviado!</strong> Por favor, revisa tu bandeja de entrada y las carpetas de spam/no deseado para los detalles de confirmación.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setSubmittedRequestNumber(null);
                  onClose();
                  setPrefillChecked(false);
                  setIsCopied(false);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    caseType: '',
                    email: '',
                    phoneNumber: '',
                    caseDescription: '',
                    location: '',
                    captcha: '',
                    agreeToTerms: false
                  });
                }}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    placeholder="Nombre"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Apellido"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="caseType">Tipo de Caso</Label>
                <HierarchicalCaseTypeSelect
                  caseTypes={caseTypes}
                  value={formData.caseType}
                  onValueChange={(value) => handleInputChange('caseType', value)}
                  loading={caseTypesLoading}
                  placeholder="Elige el tipo de caso..."
                  isSpanish={true}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Correo Electrónico"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Número de Teléfono (Opcional)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Número de Teléfono (Opcional)"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="caseDescription">Descripción del Caso (Mínimo 100 caracteres)</Label>
                <Textarea
                  id="caseDescription"
                  placeholder="Por favor, describe tu situación migratoria, incluyendo cualquier circunstancia específica, fechas límite o inquietudes que tengas..."
                  value={formData.caseDescription}
                  onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                  rows={4}
                  minLength={100}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.caseDescription.length}/100 caracteres mínimo
                </p>
              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Tu Ubicación (Ciudad, Estado)</Label>
                  <Input
                    id="location"
                    placeholder="ej., Los Ángeles, CA"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="captcha">Verifica que eres humano</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono bg-gray-100 px-3 py-2 rounded border">7 - 3 = ?</span>
                    <Input
                      id="captcha"
                      placeholder="Respuesta"
                      value={formData.captcha}
                      onChange={(e) => {
                        handleInputChange('captcha', e.target.value);
                        if (captchaError) {
                          setCaptchaError(null);
                        }
                      }}
                      className={`w-20 ${captchaError ? 'border-red-500' : formData.captcha === '4' ? 'border-green-500' : ''}`}
                      required
                    />
                    {formData.captcha === '4' && (
                      <span className="text-green-600 font-medium">¡Correcto!</span>
                    )}
                  </div>
                  {captchaError && (
                    <p className="text-red-500 text-sm mt-1">{captchaError}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agree-spanish"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                  />
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p>
                      Al hacer clic en Enviar, aceptas compartir tu información con un bufete de abogados y consientes ser contactado por ellos. 
                      Serás emparejado con una firma más cercana a tu código postal. Ciertas consultas pueden requerir una revisión manual 
                      en la cual te contactaremos antes de emparejarte con un bufete. Tu información no será tratada como confidencial ni 
                      creará una relación abogado-cliente. Aceptas nuestros <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y 
                      nuestra <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-400 hover:bg-gray-500 text-white py-3 rounded-md"
                disabled={!formData.agreeToTerms || isSubmitting || formData.captcha !== '4'}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Formulario de Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que quieres cancelar? Toda la información que has ingresado será eliminada y no se podrá recuperar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCancelDialogOpen(false)}>
              Continuar Editando
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-red-600 hover:bg-red-700">
              Sí, Eliminar Todos los Datos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}