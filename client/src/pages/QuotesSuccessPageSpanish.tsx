import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Mail, Phone, Clock } from 'lucide-react';

export default function QuotesSuccessPageSpanish() {
  const [match, params] = useRoute('/quotes/:requestNumber/success-spanish');
  const [location, setLocation] = useLocation();
  const requestNumber = params?.requestNumber;

  const handleBackToHome = () => {
    setLocation('/es');
    // Instantly position at top without visible scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Abogados Notificados Exitosamente!</h1>
          <p className="text-lg text-gray-600">
            Tus abogados seleccionados han sido notificados sobre tu caso y te contactarán pronto.
          </p>
        </div>

        {/* Request Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Detalles de la Solicitud</span>
            </CardTitle>
            <CardDescription>
              Tu número de solicitud legal para referencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Número de Solicitud Legal</p>
              <p className="text-2xl font-bold text-gray-900">{requestNumber?.toUpperCase()}</p>
              <p className="text-sm text-gray-500 mt-2">
                Guarda este número para rastrear el estado de tu solicitud
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>¿Qué Sigue?</CardTitle>
            <CardDescription>
              Esto es lo que puedes esperar en los próximos días
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Confirmaciones por Email</h4>
                <p className="text-sm text-gray-600">
                  Recibirás confirmaciones por email en breve. Revisa tu carpeta de spam si no los ves en tu bandeja de entrada.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Contacto del Abogado</h4>
                <p className="text-sm text-gray-600">
                  Tus abogados seleccionados te contactarán directamente dentro de 24-48 horas para discutir los detalles de tu caso y proporcionar cotizaciones personalizadas.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Consultas Iniciales</h4>
                <p className="text-sm text-gray-600">
                  Programa consultas con los abogados para discutir la estrategia de tu caso, honorarios y cronograma esperado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notas Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Revisa tu Carpeta de Spam:</strong> Las notificaciones por email pueden terminar en tu carpeta de spam o correo no deseado. Por favor, revísala si no recibes emails dentro de 15 minutos.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Múltiples Cotizaciones:</strong> Recibirás cotizaciones individuales de cada abogado seleccionado. Compara sus honorarios, experiencia y enfoque antes de tomar tu decisión.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Sin Obligación:</strong> Recibir cotizaciones no te obliga a contratar ningún abogado. Tómate tu tiempo para revisar todas las opciones.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center">
          <Button 
            onClick={handleBackToHome} 
            className="bg-black hover:bg-gray-800 text-white px-8 py-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}