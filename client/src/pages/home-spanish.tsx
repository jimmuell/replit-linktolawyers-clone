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
import girlThinkingSpanishImage from "@assets/thinking_girl_ai_6_1752847930839.jpg";

export default function HomeSpanish() {
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

  return (
    <div className="bg-white">
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
                  De Firmas Jurídicas En Todo El País
                </h2>
                
                <p className="text-lg text-gray-600 mb-6 max-w-lg">
                  En LinkToLawyers, cerramos la brecha entre individuos que buscan servicios legales expertos y los profesionales que pueden brindarlos, utilizando nuestro Algoritmo de Emparejamiento Inteligente con IA.
                </p>
                
                <p className="text-gray-600 mb-8 max-w-lg">
                  Nuestra plataforma simplifica el proceso de encontrar y conectar con abogados experimentados, asegurando que recibas el mejor apoyo legal adaptado a tu situación única, a un precio asequible.
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 max-w-lg">
                  Toma control de tus gastos legales hoy. Compara cotizaciones de múltiples abogados, negocia precios justos y toma decisiones informadas sobre tu representación legal. Comienza tu camino hacia servicios legales asequibles ahora.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                  onClick={() => setIsQuoteModalOpen(true)}
                >
                  ¡Obtén Una Cotización Legal Gratuita!
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
                src={girlThinkingSpanishImage} 
                alt="Cotizaciones Legales Gratuitas - Mujer profesional pensando en opciones legales con burbujas de pensamiento mostrando Firma Legal A (US$1,200), Firma Legal B (US$1,750), y Firma Legal C (US$2,500)" 
                className="max-w-lg w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-black text-white hover:bg-gray-800 rounded-full p-3 z-50 shadow-lg"
          size="icon"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Track Request Modal */}
      <TrackRequestModal 
        isOpen={isTrackRequestModalOpen} 
        onClose={() => setIsTrackRequestModalOpen(false)} 
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal 
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        emailPreview={emailPreview}
      />

      </div>
    </div>
  );
}