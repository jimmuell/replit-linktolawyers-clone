import { Button } from "@/components/ui/button";
import { Edit3, CheckSquare, DollarSign, Handshake, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/LoginModal";
import TrackRequestModalSpanish from "@/components/TrackRequestModalSpanish";
import { IntakeModal } from "@/components/IntakeModal";
import NavbarSpanish from "@/components/NavbarSpanish";
import SpanishLegalRequestForm from "@/components/SpanishLegalRequestForm";
import { Link } from "wouter";
import girlThinkingSpanishImage from "@assets/girl-thinking-spanish_1759069959323.jpg";

export default function HomeSpanish() {
  const [activeSection, setActiveSection] = useState("home");
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTrackRequestModalOpen, setIsTrackRequestModalOpen] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { user, logout } = useAuth();

  const handleIntakeSubmit = (data: { fullName: string; email: string; caseTypes: string[]; language?: string }) => {
    setIsIntakeModalOpen(false);
    // Navigate to chat with intake data
    const dataWithLanguage = { ...data, language: 'es' }; // Add Spanish language for Spanish modal
    const intakeData = encodeURIComponent(JSON.stringify(dataWithLanguage));
    window.location.href = `/chat?intake=${intakeData}`;
  };

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      window.location.href = '/admin-dashboard';
    }
  }, [user]);

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
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start min-h-[600px]">
            <div className="mb-8 lg:mb-0 flex flex-col h-full">
              <div className="flex-grow flex flex-col">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Ve Cuánto Cobran los Abogados de Inmigración por Tu Caso — Gratis y Sin Obligaciones
                </h1>
                <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-8 leading-relaxed">
                  Rápido, simple y transparente — obtén costos personalizados de abogados basados en tu caso, sin obligaciones.
                </h2>
                
                <div className="space-y-6 mb-8">
                  <p className="text-xl text-gray-600 max-w-lg">
                    Sin costos ocultos. Sin presión. Precios transparentes por adelantado, para que sepas exactamente qué esperar. Nuestro servicio es 100% gratuito y viene sin obligaciones — conéctate con un abogado de inmigración solo si y cuando estés listo.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                {/* Hidden - AI Agent flow button for intake - when pressed opens the AI chatbot intake workflow */}
                {/* <Button 
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                  onClick={() => setIsIntakeModalOpen(true)}
                >
                  ¡Haz Clic Para Cotización Gratuita!
                </Button> */}
                <Button 
                  className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                  onClick={() => setIsQuoteModalOpen(true)}
                  data-testid="button-get-quote"
                >
                  Ver Precios de Abogados de Inmigración
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
            
            <div className="flex justify-center items-start">
              <img 
                src={girlThinkingSpanishImage} 
                alt="Cotizaciones Legales Gratuitas - Mujer profesional pensando en opciones legales con burbujas de pensamiento mostrando Abogada A (US$1,200), Abogada B (US$1,750), y Abogada C (US$2,500)" 
                className="w-[500px] h-auto object-contain" 
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
              Deja de pagar de más por servicios legales. Encontrar el abogado adecuado no debería ser complicado ni costarte un ojo de la cara. Estamos aquí para ayudarte a tomar una decisión inteligente y conectarte con abogados a un precio justo. Nuestra plataforma te permite comparar honorarios y negociar con firmas legales líderes a nivel local y nacional. Es crucial comparar firmas y costos antes de seleccionar un abogado. Comparar precios legales de múltiples firmas legales es la mejor manera de ahorrar. Compara honorarios de abogados sin complicaciones y evita gastos innecesarios. Tú tienes el control, sin consultas hasta que estés preparado para seguir adelante.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cómo Funciona LinkToLawyers</h2>
            <p className="text-lg text-gray-600">4 Simples Pasos Para Conectarte Con Expertos Legales Calificados</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center flex flex-col h-full">
              <div className="step-icon mb-4">
                <Edit3 className="h-12 w-12 text-gray-800 mx-auto" />
              </div>
              <div className="h-16 flex items-center justify-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">Paso 1: Completa Una Solicitud</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-justify flex-grow">
                En LinkToLawyers, la integridad es fundamental. Garantizamos que tu información nunca será vendida a spammers, asegurando que no recibirás correos electrónicos no deseados o llamadas telefónicas no solicitadas. Ten la seguridad de que tu privacidad está completamente protegida con nuestro servicio completamente confidencial. Tu confianza es importante para nosotros, y estamos comprometidos a mantener los más altos estándares de seguridad y privacidad en todas nuestras interacciones.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center flex flex-col h-full">
              <div className="step-icon mb-4">
                <CheckSquare className="h-12 w-12 text-gray-800 mx-auto" />
              </div>
              <div className="h-16 flex items-center justify-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">Paso 2: Elección Real</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-justify flex-grow">
                Somos un servicio imparcial que te permite comparar precios de firmas legales en todo el país. LinkToLawyers recopila información de precios de firmas legales en cada código postal y estado. Utilizando tecnología avanzada de IA, analizamos tus necesidades para emparejarte con firmas legales adecuadas en todo Estados Unidos. Nuestra misión es asegurar que obtengas el mejor trato posible. Despídete de pagar de más por servicios legales.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center flex flex-col h-full">
              <div className="step-icon mb-4">
                <DollarSign className="h-12 w-12 text-gray-800 mx-auto" />
              </div>
              <div className="h-16 flex items-center justify-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">Paso 3: Comienza A Ahorrar</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-justify flex-grow">
                Trabajamos con firmas legales de diferentes tamaños para brindarte opciones extensas. Nuestro motor de búsqueda de comparación simplifica encontrar el abogado perfecto. Los servicios legales pueden variar, por lo que recomendamos comparar varias firmas, al menos 3-5. Nuestra plataforma asegura tarifas competitivas para ayudarte a encontrar el mejor valor. Ten en cuenta que las tarifas proporcionadas son solo con fines de comparación.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center flex flex-col h-full">
              <div className="step-icon mb-4">
                <Handshake className="h-12 w-12 text-gray-800 mx-auto" />
              </div>
              <div className="h-16 flex items-center justify-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">Paso 4: No Satisfecho</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed text-justify flex-grow">
                En LinkToLawyers, entendemos la importancia de precios justos para los servicios legales. No deberías tener que pagar un ojo de la cara por servicios legales. Si no estás satisfecho con los honorarios de tu abogado, siéntete libre de negociar un precio que funcione mejor para ti y se ajuste cómodamente a tu presupuesto. Nos esforzamos por asegurar que recibas servicios legales de calidad a un precio que puedas pagar.
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
            <p className="text-lg text-gray-600 mb-8">Conectándote Con Servicios Legales Expertos</p>
            
            <div>
              <p className="text-gray-700 leading-relaxed text-justify">
                LinkToLawyers fue creado para empoderar a los consumidores en la toma de decisiones informadas al elegir un abogado, una decisión que puede impactar profundamente tu vida. Priorizamos la educación de los consumidores porque creemos que un consumidor bien informado es un consumidor satisfecho. Al fomentar relaciones de trabajo con firmas legales de todos los tamaños, ofrecemos a los consumidores una gama completa de opciones. Nuestra plataforma comparativa impulsada por IA permite a los consumidores comparar honorarios de abogados a nivel nacional y negociar precios con abogados, asegurando que reciban el mejor valor. Nuestro objetivo es emparejar a los consumidores con un abogado que los defenderá apasionadamente, teniendo en cuenta sus necesidades únicas, y recibir los precios más competitivos.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Introduction */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Introducción</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "En LinkToLawyers, nuestra misión es simplificar el proceso de asegurar asistencia legal confiable y experimentada. Estamos dedicados a cerrar la brecha entre las personas que necesitan apoyo legal y los profesionales que pueden proporcionarlo."
              </p>
            </div>
            
            {/* Our Mission */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "Nuestra misión es agilizar la conexión entre personas que buscan servicios legales y profesionales legales calificados. Nuestro objetivo es hacer que la asistencia legal sea accesible, eficiente y adaptada a las necesidades específicas de cada usuario."
              </p>
            </div>
            
            {/* Our Vision */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h3>
              <p className="text-gray-600 leading-relaxed text-justify">
                "Visualizamos un mundo donde todos tengan acceso a asistencia legal experta, independientemente de su ubicación o antecedentes. Al aprovechar la tecnología, nos esforzamos por crear una plataforma que empodere a las personas para navegar las complejidades de la ley con confianza."
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
                <li><a href="mailto:support@linktolawyers.com" className="hover:text-primary transition-colors">support@linktolawyers.com</a></li>
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
              LinkToLawyers conecta clientes con abogados calificados a nivel nacional. No somos una firma legal y no proporcionamos asesoramiento legal.
            </p>
          </div>
        </div>
      </footer>

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
        open={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Track Request Modal */}
      <TrackRequestModalSpanish 
        isOpen={isTrackRequestModalOpen} 
        onClose={() => setIsTrackRequestModalOpen(false)} 
      />

      {/* Spanish Legal Request Form */}
      <SpanishLegalRequestForm
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />

      {/* Intake Modal */}
      <IntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSubmit={handleIntakeSubmit}
      />

      </div>
    </div>
  );
}