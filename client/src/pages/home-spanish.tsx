import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit3, CheckSquare, DollarSign, Handshake, ChevronUp, Mail, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import LoginModal from "@/components/LoginModal";
import HierarchicalCaseTypeSelect from "@/components/HierarchicalCaseTypeSelect";
import EmailPreviewModal from "@/components/EmailPreviewModal";
import TrackRequestModal from "@/components/TrackRequestModal";
import { generateConfirmationEmail } from "@/lib/emailTemplates";
import { Link } from "wouter";
import girlThinkingImage from "@assets/girl-final_1752714322954.png";

// Generate request number
function generateRequestNumber(): string {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `lr-${randomNumber}`;
}

export default function SpanishHome() {
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

  // Fetch case types for dropdown in Spanish
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types', { lang: 'es' }],
    queryFn: () => apiRequest('/api/case-types?lang=es'),
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrefillToggle = (checked: boolean) => {
    setPrefillChecked(checked);
    if (checked) {
      setFormData({
        firstName: 'María',
        lastName: 'García',
        caseType: 'family-based-immigrant-visa-immediate-relative',
        email: 'maria.garcia@example.com',
        phoneNumber: '(555) 123-4567',
        caseDescription: 'Necesito ayuda con una visa de inmigración para mi esposo. Él es de México y queremos que pueda obtener su residencia permanente en los Estados Unidos. Hemos estado casados por 3 años y yo soy ciudadana estadounidense.',
        urgencyLevel: 'moderate',
        budgetRange: '2500-5000',
        location: 'Los Ángeles, CA',
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
    if (!open && !submittedRequestNumber) {
      setIsCancelDialogOpen(true);
    } else if (!open) {
      setIsQuoteModalOpen(false);
    } else {
      setIsQuoteModalOpen(true);
    }
  };

  const handleCancelConfirm = () => {
    setIsCancelDialogOpen(false);
    setIsQuoteModalOpen(false);
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
    setPrefillChecked(false);
    setCurrentRequestNumber('');
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (formData.captcha !== '4') {
      setCaptchaError('Respuesta incorrecta. Por favor intenta de nuevo.');
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
        // Now try to send the confirmation email
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
              title: "¡Solicitud enviada exitosamente!",
              description: `Tu solicitud ${result.data.requestNumber} ha sido enviada y se ha enviado un correo de confirmación a ${formData.email}. Por favor revisa tu bandeja de entrada y carpeta de spam.`,
            });
            
            // Keep the modal open but show success state
            setSubmittedRequestNumber(result.data.requestNumber);
            // Don't close modal - let user close it manually after reading the confirmation
          } else {
            // Request was created but email failed
            toast({
              title: "Solicitud enviada",
              description: `Tu solicitud ${result.data.requestNumber} ha sido enviada exitosamente, pero no pudimos enviar el correo de confirmación. Por favor guarda tu número de solicitud para seguimiento.`,
              variant: "destructive",
            });
            // Keep the modal open but show success state
            setSubmittedRequestNumber(result.data.requestNumber);
            // Don't close modal - let user close it manually after reading the confirmation
          }
        } catch (emailError) {
          console.error('Error al enviar correo de confirmación:', emailError);
          // Request was created but email failed
          toast({
            title: "Solicitud enviada",
            description: `Tu solicitud ${result.data.requestNumber} ha sido enviada exitosamente, pero no pudimos enviar el correo de confirmación. Por favor guarda tu número de solicitud para seguimiento.`,
            variant: "destructive",
          });
          // Keep the modal open but show success state
          setSubmittedRequestNumber(result.data.requestNumber);
          // Don't close modal - let user close it manually after reading the confirmation
        }
      } else {
        alert('Error al enviar la solicitud: ' + result.error);
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      alert('Error al enviar la solicitud. Por favor intenta de nuevo.');
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
          title: "¡Correo enviado exitosamente!",
          description: `El correo de confirmación ha sido enviado a ${emailAddress}`,
        });
        setIsEmailPreviewOpen(false);
      } else {
        toast({
          title: "Error al enviar el correo",
          description: result.error || "Ocurrió un error al enviar el correo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      toast({
        title: "Error al enviar el correo",
        description: "Ocurrió un error al enviar el correo.",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

