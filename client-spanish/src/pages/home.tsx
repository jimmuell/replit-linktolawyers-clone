import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit3, CheckSquare, DollarSign, Handshake, ChevronUp, Mail, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import LoginModal from "@/components/LoginModal";
import HierarchicalCaseTypeSelect from "@/components/HierarchicalCaseTypeSelect";
import EmailPreviewModal from "@/components/EmailPreviewModal";
import TrackRequestModal from "@/components/TrackRequestModal";
import { generateConfirmationEmail } from "@/lib/emailTemplates";
import NavbarSpanish from "@/components/NavbarSpanish";
import { Link } from "wouter";
import girlThinkingImage from "@assets/girl-final_1752714322954.png";

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTrackRequestModalOpen, setIsTrackRequestModalOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [formData, setFormData] = useState({
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

  const [prefillChecked, setPrefillChecked] = useState(false);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [currentRequestNumber, setCurrentRequestNumber] = useState<string>('');
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; html: string; text: string } | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/admin-dashboard';
    }
  }, [user]);

  // Fetch case types for dropdown
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types'],
    retry: false,
  });

  const caseTypes = caseTypesData?.data || [];



  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'how-it-works', 'about'];
      const scrollPosition = window.scrollY + 100;

      // Show/hide scroll to top button
      setShowScrollToTop(window.scrollY > 300);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    return formData.firstName || formData.lastName || formData.email || formData.phoneNumber || 
           formData.caseType || formData.caseDescription || formData.urgencyLevel || 
           formData.budgetRange || formData.location || formData.captcha;
  };

  // Handle modal close (cancel)
  const handleModalClose = (open: boolean) => {
    if (!open && hasFormData() && !submittedRequestNumber) {
      // Show warning dialog if form has data and hasn't been submitted
      setIsCancelDialogOpen(true);
    } else {
      // Safe to close
      setIsQuoteModalOpen(open);
      if (!open) {
        // Reset everything when closing
        setSubmittedRequestNumber(null);
        setPrefillChecked(false);
        setIsCopied(false);
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
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    setIsQuoteModalOpen(false);
    setSubmittedRequestNumber(null);
    setPrefillChecked(false);
    setIsCopied(false);
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
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: `Request number ${text} has been copied to your clipboard.`,
      });
      // Reset the copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please manually copy the request number.",
        variant: "destructive",
      });
    }
  };

  const handlePrefillToggle = (checked: boolean) => {
    setPrefillChecked(checked);
    if (checked) {
      setFormData({
        firstName: 'John',
        lastName: 'Doe',
        caseType: 'family-based-immigrant-visa-immediate-relative',
        email: 'linktolawyers.us@gmail.com',
        phoneNumber: '(555) 123-4567',
        caseDescription: 'I need assistance with filing a family-based immigrant visa petition for my spouse. We have been married for 2 years and have all the required documentation ready. Looking for guidance on the process and timeline.',
        urgencyLevel: 'moderate',
        budgetRange: '2500-5000',
        location: 'Los Angeles, CA',
        captcha: '4',
        agreeToTerms: false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous captcha error
    setCaptchaError(null);
    
    // Validate captcha
    if (formData.captcha !== '4') {
      setCaptchaError('Please solve the captcha correctly. 7 - 3 = ?');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/legal-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requestNumber: currentRequestNumber
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSubmittedRequestNumber(result.data.requestNumber);
        
        // Automatically send confirmation email using production template
        try {
          const emailResponse = await fetch(`/api/legal-requests/${result.data.requestNumber}/send-confirmation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Don't send emailTemplate - let the backend use the production template
            })
          });
          
          const emailResult = await emailResponse.json();
          
          if (emailResult.success) {
            // Show success message with email sent confirmation
            toast({
              title: "Request submitted successfully!",
              description: `Your request ${result.data.requestNumber} has been submitted and a confirmation email has been sent to ${formData.email}. Please check your inbox and spam folder.`,
            });
            
            // Keep the modal open but show success state
            setSubmittedRequestNumber(result.data.requestNumber);
            // Don't close modal - let user close it manually after reading the confirmation
          } else {
            // Request was created but email failed
            toast({
              title: "Request submitted",
              description: `Your request ${result.data.requestNumber} has been submitted successfully, but we couldn't send the confirmation email. Please save your request number for tracking.`,
              variant: "destructive",
            });
            // Keep the modal open but show success state
            setSubmittedRequestNumber(result.data.requestNumber);
            // Don't close modal - let user close it manually after reading the confirmation
          }
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Request was created but email failed
          toast({
            title: "Request submitted",
            description: `Your request ${result.data.requestNumber} has been submitted successfully, but we couldn't send the confirmation email. Please save your request number for tracking.`,
            variant: "destructive",
          });
          // Keep the modal open but show success state
          setSubmittedRequestNumber(result.data.requestNumber);
          // Don't close modal - let user close it manually after reading the confirmation
        }
      } else {
        alert('Error submitting request: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async (emailAddress: string) => {
    if (!emailPreview || !submittedRequestNumber) return;
    
    setIsSendingEmail(true);
    
    try {
      const response = await apiRequest(`/api/legal-requests/${submittedRequestNumber}/send-confirmation`, {
        method: 'POST',
        body: { 
          emailTemplate: emailPreview,
          overrideEmail: emailAddress 
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Email sent successfully!",
          description: `Confirmation email has been sent to ${emailAddress}`,
        });
        setIsEmailPreviewOpen(false);
      } else {
        toast({
          title: "Failed to send email",
          description: result.error || "An error occurred while sending the email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: "An error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <NavbarSpanish 
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        setIsLoginModalOpen={setIsLoginModalOpen}
        hideUserDropdown={true}
      />
      <div className="min-h-screen bg-white w-full">

      {/* Hero Section */}
      <section id="home" className="bg-white py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-stretch min-h-[600px]">
            <div className="mb-8 lg:mb-0 flex flex-col justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Encuentra Tu Abogado de Inmigración
                </h1>
                <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6 leading-relaxed">
                  Compara Y Negocia Honorarios Legales<br />
                  De Bufetes en Todo el País
                </h2>
                
                <p className="text-lg text-gray-600 mb-6 max-w-lg">
                  En LinkToLawyers, conectamos a personas que buscan servicios legales expertos con profesionales que pueden proporcionarlos, utilizando nuestro Algoritmo de Emparejamiento Inteligente con IA.
                </p>
                
                <p className="text-gray-600 mb-8 max-w-lg">
                  Nuestra plataforma simplifica el proceso de encontrar y conectar con abogados experimentados, asegurando que recibas el mejor apoyo legal adaptado a tu situación única, a un precio asequible.
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 max-w-lg">
                  Toma control de tus gastos legales hoy. Compara cotizaciones de múltiples abogados, negocia precios justos y toma decisiones confiadas sobre tu representación legal. Comienza tu camino hacia servicios legales asequibles ahora.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  ¡Obtén una Cotización Legal Gratuita!
                </Button>
                <Button 
                  variant="outline"
                  className="border-black text-black hover:bg-gray-50 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                  onClick={() => setIsTrackRequestModalOpen(true)}
                >
                  Rastrea Tu Solicitud
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center items-center">
              <img 
                src={girlThinkingImage} 
                alt="Free Legal Quotes - Professional woman thinking about legal options with thought bubbles showing Law Firm A ($1,200), Law Firm B ($1,750), and Law Firm C ($2,500) for Immigration Law, Personal Injury, Criminal Law, and Family Law services" 
                className="max-w-lg w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
          <div className="text-justify">
            <p className="text-lg text-gray-700 leading-relaxed">
              Deja de gastar de más en servicios legales. Encontrar el abogado correcto no debería ser complicado ni costarte un ojo de la cara. Estamos aquí para ayudarte a tomar una decisión inteligente y conectarte con abogados a un precio justo. Nuestra plataforma te permite comparar honorarios y negociar con los mejores bufetes locales y nacionales. Es crucial comparar bufetes y costos antes de seleccionar un abogado. Comparar precios legales de múltiples bufetes es la mejor manera de ahorrar. Compara honorarios de abogados sin complicaciones y evita gastos innecesarios. Tienes el control - no hay consultas hasta que estés preparado para avanzar.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo Funciona LinkToLawyers</h2>
            <p className="text-lg text-gray-600">4 Pasos Simples Para Conectar con Expertos Legales Calificados</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="step-icon">
                <Edit3 className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 1: Llena una Solicitud</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                En LinkToLawyers, la integridad es primordial. Garantizamos que tu información nunca será vendida a spammers, asegurando que no recibas emails no deseados o llamadas telefónicas no solicitadas. Ten la seguridad de que tu privacidad está completamente protegida con nuestro servicio completamente confidencial. Tu confianza es importante para nosotros, y estamos comprometidos a mantener los más altos estándares de seguridad y privacidad en todas nuestras interacciones.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="step-icon">
                <CheckSquare className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 2: Elección Real</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                Somos un servicio imparcial que te permite comparar precios de bufetes de abogados en todo el país. LinkToLawyers agrega información de precios de bufetes en cada código postal y estado. Usando tecnología avanzada de IA, analizamos tus necesidades para emparejarte con bufetes adecuados en todo EE.UU. Nuestra misión es asegurar que obtengas el mejor trato posible. Despídete de pagar de más por servicios legales.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="step-icon">
                <DollarSign className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 3: Comienza a Ahorrar</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                Trabajamos con bufetes de diferentes tamaños para brindarte opciones extensas. Nuestro motor de búsqueda comparativo simplifica encontrar el abogado perfecto. Los servicios legales pueden variar, así que recomendamos comparar varios bufetes, al menos 3-5. Nuestra plataforma asegura tarifas competitivas para ayudarte a encontrar el mejor valor. Ten en cuenta que las tarifas proporcionadas son solo para propósitos de comparación.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center">
              <div className="step-icon">
                <Handshake className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Paso 4: ¿No Satisfecho?</h3>
              <p className="text-gray-600 text-sm leading-relaxed text-justify">
                En LinkToLawyers, entendemos la importancia de precios justos para servicios legales. No deberías tener que pagar un ojo de la cara por servicios legales. Si no estás satisfecho con los honorarios de tu abogado, siéntete libre de negociar un precio que funcione mejor para ti y se ajuste cómodamente dentro de tu presupuesto. Nos esforzamos por asegurar que recibas servicios legales de calidad a un precio que puedas permitirte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Acerca de LinkToLawyers</h2>
            <p className="text-lg text-gray-600 mb-8">Conectándote con Servicios Legales Expertos</p>
            
            <div>
              <p className="text-gray-700 leading-relaxed text-justify">
                LinkToLawyers fue creado para empoderar a los consumidores en la toma de decisiones informadas al elegir un abogado, una decisión que puede impactar profundamente tu vida. Priorizamos educar a los consumidores porque creemos que un consumidor bien informado es un consumidor satisfecho. Al fomentar relaciones de trabajo con bufetes de todos los tamaños, ofrecemos a los consumidores una gama completa de opciones. Nuestra plataforma comparativa impulsada por IA permite a los consumidores comparar honorarios de abogados a nivel nacional, y negociar precios con abogados, asegurando que reciban el mejor valor. Nuestro objetivo es emparejar a los consumidores con un abogado que los defenderá apasionadamente, tomando en cuenta sus necesidades únicas, y recibir los precios más competitivos.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Introduction */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Introducción</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "En LinkToLawyers, nuestra misión es simplificar el proceso de asegurar asistencia legal confiable y experimentada. Estamos dedicados a cerrar la brecha entre individuos que necesitan apoyo legal y los profesionales que pueden proporcionarlo."
              </p>
            </div>
            
            {/* Our Mission */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "Nuestra misión es optimizar la conexión entre individuos que buscan servicios legales y profesionales legales calificados. Nuestro objetivo es hacer que la asistencia legal sea accesible, eficiente y adaptada a las necesidades específicas de cada usuario."
              </p>
            </div>
            
            {/* Our Vision */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "Visionamos un mundo donde todos tengan acceso a asistencia legal experta, independientemente de su ubicación o antecedentes. Al aprovechar la tecnología, nos esforzamos por crear una plataforma que empodere a los individuos para navegar las complejidades de la ley con confianza."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">LinkToLawyers</h3>
              <p className="text-gray-600 text-sm">© 2024 LinkToLawyers</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Guía Legal</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Directorio de Abogados</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Artículos Legales</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Casos de Estudio</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contáctanos</a></li>
                <li><a href="mailto:info@linktolawyers.com" className="hover:text-primary transition-colors">info@linktolawyers.com</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Chat en Vivo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Política de Cookies</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Descargo de Responsabilidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              LinkToLawyers conecta clientes con abogados calificados a nivel nacional. No somos un bufete de abogados y no proporcionamos asesoramiento legal.
            </p>
          </div>
        </div>
      </footer>

      {/* Free Quote Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={(open) => {
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
                ? "Te estamos conectando con abogados calificados a nivel nacional para proporcionar cotizaciones personalizadas para tu caso"
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
                id="prefill"
                checked={prefillChecked}
                onCheckedChange={handlePrefillToggle}
              />
              <Label htmlFor="prefill" className="text-sm font-medium">
                Llenar formulario con datos de ejemplo
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
                  Tu solicitud legal ha sido enviada y se le ha asignado el siguiente número:
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-3 inline-flex items-center gap-2">
                  <span className="text-xl font-mono font-bold text-green-800">
                    {submittedRequestNumber}
                  </span>
                  <button
                    onClick={() => handleCopyToClipboard(submittedRequestNumber)}
                    className="flex items-center justify-center w-8 h-8 rounded-md bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 transition-colors"
                    title="Copy to clipboard"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-green-600 mt-3">
                  Por favor guarda este número para tus registros.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    📧 <strong>¡Email de confirmación enviado!</strong> Por favor revisa tu bandeja de entrada y carpetas de spam para los detalles de confirmación.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => {
                  setSubmittedRequestNumber(null);
                  setIsQuoteModalOpen(false);
                  setIsEmailPreviewOpen(false);
                  setEmailPreview(null);
                  setPrefillChecked(false); // Reset the prefill checkbox
                  setIsCopied(false); // Reset copy state
                  // Reset form
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
                placeholder="Elige tipo de caso..."
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
                <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Número de Teléfono"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="caseDescription">Descripción del Caso</Label>
              <Textarea
                id="caseDescription"
                placeholder="Por favor describe tu situación de inmigración, incluyendo cualquier circunstancia específica, fechas límite, o preocupaciones que tengas..."
                value={formData.caseDescription}
                onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nivel de Urgencia</Label>
                <RadioGroup value={formData.urgencyLevel} onValueChange={(value) => handleInputChange('urgencyLevel', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-urgent" id="not-urgent" />
                    <Label htmlFor="not-urgent">No urgente (6+ meses)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate">Moderado (3-6 meses)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="urgent" />
                    <Label htmlFor="urgent">Urgente (1-3 meses)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="immediate" id="immediate" />
                    <Label htmlFor="immediate">Inmediato (menos de 1 mes)</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="budgetRange">Rango de Presupuesto</Label>
                <Select value={formData.budgetRange} onValueChange={(value) => handleInputChange('budgetRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona rango de presupuesto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1000">Menos de $1,000</SelectItem>
                    <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                    <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="over-10000">Más de $10,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Tu Ubicación (Ciudad, Estado)</Label>
                <Input
                  id="location"
                  placeholder="ej., Los Angeles, CA"
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
                      // Clear error when user starts typing
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
                  id="agree"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  <p>
                    Al hacer clic en Enviar, aceptas compartir tu información con un bufete de abogados y consientes ser contactado por ellos. Serás 
                    emparejado con un bufete más cercano a tu código postal. Ciertas consultas pueden requerir una revisión manual en la cual te 
                    contactaremos antes de emparejarte con un bufete. Tu información no será tratada como confidencial ni creará una relación 
                    abogado-cliente. Aceptas nuestros <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> y 
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

      {/* Login Modal */}
      <LoginModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        emailPreview={emailPreview}
        recipientEmail={formData.email}
        onSendEmail={handleSendEmail}
        isSending={isSendingEmail}
      />

      {/* Track Request Modal */}
      <TrackRequestModal
        isOpen={isTrackRequestModalOpen}
        onClose={() => setIsTrackRequestModalOpen(false)}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Formulario de Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cancelar? Toda la información que has ingresado será eliminada y no se podrá recuperar.
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

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
      </div>
    </>
  );
}
