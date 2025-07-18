import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Menu, X, ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function HelpSpanish() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Formulario de contacto enviado:', contactForm);
  };

  const faqs = [
    {
      question: "¿Cómo encuentro el abogado adecuado para mi caso?",
      answer: "Nuestro sistema de emparejamiento inteligente analiza tus necesidades legales específicas, ubicación y preferencias para conectarte con abogados de inmigración calificados. Simplemente completa nuestro cuestionario y te proporcionaremos una lista curada de abogados que se especializan en tu tipo de caso."
    },
    {
      question: "¿Cuánto cuesta usar LinkToLawyers?",
      answer: "LinkToLawyers es gratuito para los clientes. Te conectamos con abogados sin costo alguno. Solo pagas directamente al abogado por sus servicios legales. Nuestra plataforma te ayuda a comparar tarifas y encontrar precios transparentes."
    },
    {
      question: "¿Todos los abogados en su plataforma están licenciados?",
      answer: "Sí, todos los abogados en LinkToLawyers están licenciados y verificados. Realizamos verificaciones exhaustivas de antecedentes y verificamos el estado de licencia con las asociaciones estatales de abogados antes de aprobar que cualquier abogado se una a nuestra plataforma."
    },
    {
      question: "¿Qué tipos de casos de inmigración manejan?",
      answer: "Nuestra red incluye abogados que manejan todos los tipos de casos de inmigración, incluyendo inmigración basada en familia, visas basadas en empleo, casos de asilo, naturalización, defensa de deportación y más. Te emparejaremos con abogados que se especialicen en tu tipo específico de caso."
    },
    {
      question: "¿Qué tan rápido puedo conectarme con un abogado?",
      answer: "La mayoría de los clientes reciben emparejamientos de abogados dentro de 24 horas. Una vez que envíes tu información, nuestro sistema inmediatamente comienza a emparejarte con abogados adecuados. Luego puedes programar consultas directamente a través de nuestra plataforma."
    },
    {
      question: "¿Puedo obtener una segunda opinión sobre mi caso?",
      answer: "¡Por supuesto! Puedes solicitar consultas con múltiples abogados a través de nuestra plataforma. Obtener una segunda opinión a menudo es valioso, especialmente para casos complejos. Nuestros abogados entienden esto y están felices de proporcionar su evaluación profesional."
    },
    {
      question: "¿Qué pasa si no estoy satisfecho con el abogado con el que fui emparejado?",
      answer: "Si no estás satisfecho con tu emparejamiento de abogado, puedes solicitar nuevos emparejamientos en cualquier momento. Nuestra plataforma está diseñada para ayudarte a encontrar la representación legal correcta, y trabajaremos contigo hasta que encuentres un abogado con el que te sientas cómodo."
    },
    {
      question: "¿Ofrecen servicios en idiomas distintos al inglés?",
      answer: "Sí, muchos abogados en nuestra red hablan múltiples idiomas. Durante el proceso de emparejamiento, puedes especificar tu idioma preferido, y priorizaremos abogados que puedan comunicarse contigo en tu idioma preferido."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/es" className="text-2xl font-bold text-black">
                LinkToLawyers
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/es" className="text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Volver al Inicio
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link href="/es" className="block px-3 py-2 text-gray-600 hover:text-black">
                  Volver al Inicio
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Ayuda y Soporte</h1>
            <p className="text-xl text-gray-300 mb-8">
              Encuentra respuestas a tus preguntas o ponte en contacto con nuestro equipo de soporte
            </p>
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar artículos de ayuda..."
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Help Options */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo Podemos Ayudarte?</h2>
            <p className="text-lg text-gray-600">
              Elige la mejor manera de obtener el soporte que necesitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Chat en Vivo</CardTitle>
                <CardDescription>
                  Chatea con nuestro equipo de soporte en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Disponible 24/7
                </p>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Phone className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Soporte Telefónico</CardTitle>
                <CardDescription>
                  Habla directamente con un representante de soporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Lun-Vie 9AM-6PM EST
                </p>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Llamar Ahora
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="w-12 h-12 text-black mx-auto mb-4" />
                <CardTitle>Soporte por Email</CardTitle>
                <CardDescription>
                  Envíanos un mensaje detallado sobre tu problema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Respuesta en 24 horas
                </p>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Enviar Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
            <p className="text-lg text-gray-600">
              Encuentra respuestas rápidas a preguntas comunes
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center">
                      <HelpCircle className="w-5 h-5 text-black mr-3 flex-shrink-0" />
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pl-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contáctanos</h2>
            <p className="text-lg text-gray-600">
              ¿No encuentras lo que buscas? Envíanos un mensaje
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Te responderemos lo antes posible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={contactForm.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Pregunta General</SelectItem>
                        <SelectItem value="technical">Problema Técnico</SelectItem>
                        <SelectItem value="billing">Pregunta de Facturación</SelectItem>
                        <SelectItem value="attorney">Problema de Emparejamiento de Abogado</SelectItem>
                        <SelectItem value="feedback">Comentarios</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                    Enviar Mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="text-center bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas Más Ayuda?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Explora nuestros recursos o conéctate con nuestra comunidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/es/recursos-gratuitos">
              <Button variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white">
                Ver Recursos Gratuitos
              </Button>
            </Link>
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Unirse al Foro de la Comunidad
            </Button>
          </div>
        </section>
      </div>

    </div>
  );
}