import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, FileText, Video, Users, Menu, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function FreeResourcesSpanish() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const resources = [
    {
      title: "Guía de Ley de Inmigración",
      description: "Guía completa que cubre los fundamentos de la ley de inmigración de EE.UU.",
      type: "PDF",
      size: "2.3 MB",
      downloads: 1247,
      category: "Guías Legales"
    },
    {
      title: "Lista de Verificación de Solicitud de Visa",
      description: "Lista paso a paso para solicitudes de visa comunes",
      type: "PDF",
      size: "1.1 MB",
      downloads: 892,
      category: "Listas de Verificación"
    },
    {
      title: "Conoce Tus Derechos",
      description: "Conoce tus derechos durante los procedimientos de inmigración",
      type: "PDF",
      size: "1.8 MB",
      downloads: 675,
      category: "Guías Legales"
    },
    {
      title: "Cronología del Proceso de Inmigración",
      description: "Cronología visual de procesos comunes de inmigración",
      type: "PDF",
      size: "950 KB",
      downloads: 543,
      category: "Infografías"
    },
    {
      title: "Glosario de Términos Legales",
      description: "Términos legales comunes explicados en lenguaje sencillo",
      type: "PDF",
      size: "1.5 MB",
      downloads: 432,
      category: "Referencia"
    },
    {
      title: "Inmigración Basada en Familia",
      description: "Guía para peticiones de inmigración basada en familia",
      type: "PDF",
      size: "2.1 MB",
      downloads: 387,
      category: "Guías Legales"
    }
  ];

  const webinars = [
    {
      title: "Fundamentos de Ley de Inmigración",
      description: "Seminario web de 60 minutos sobre fundamentos de inmigración",
      duration: "60 min",
      views: 2340,
      category: "Educacional"
    },
    {
      title: "Preparándose para su Entrevista",
      description: "Consejos y estrategias para entrevistas de inmigración",
      duration: "45 min",
      views: 1890,
      category: "Preparación"
    },
    {
      title: "Errores Comunes en Solicitudes",
      description: "Evita estos errores frecuentes en tu solicitud",
      duration: "30 min",
      views: 1456,
      category: "Consejos"
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
                data-testid="button-mobile-menu"
              >
                {isMenuOpen ? <X className="w-4 h-4 mr-2" /> : null}
                {isMenuOpen ? 'Cerrar' : 'Menú Principal'}
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
            <h1 className="text-4xl font-bold mb-4">Recursos Gratuitos de Inmigración</h1>
            <p className="text-xl text-gray-300 mb-8">
              Accede a nuestra colección completa de guías, listas de verificación y materiales educativos
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                <FileText className="w-4 h-4 mr-1" />
                Guías Legales
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                <BookOpen className="w-4 h-4 mr-1" />
                Listas de Verificación
              </Badge>
              <Badge variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
                <Video className="w-4 h-4 mr-1" />
                Seminarios Web
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Downloads Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos para Descargar</h2>
            <p className="text-lg text-gray-600">
              Guías gratuitas, listas de verificación y materiales de referencia para ayudarte a navegar la ley de inmigración
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{resource.category}</Badge>
                    <div className="text-sm text-gray-500">{resource.type} • {resource.size}</div>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <Download className="w-4 h-4 inline mr-1" />
                      {resource.downloads.toLocaleString()} descargas
                    </div>
                    <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Webinars Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Seminarios Web Educativos</h2>
            <p className="text-lg text-gray-600">
              Aprende de expertos en ley de inmigración a través de nuestra serie de seminarios web grabados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{webinar.category}</Badge>
                    <div className="text-sm text-gray-500">{webinar.duration}</div>
                  </div>
                  <CardTitle className="text-lg">{webinar.title}</CardTitle>
                  <CardDescription>{webinar.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <Users className="w-4 h-4 inline mr-1" />
                      {webinar.views.toLocaleString()} visualizaciones
                    </div>
                    <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                      <Video className="w-4 h-4 mr-2" />
                      Ver Ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gray-100 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Necesitas Ayuda Legal Personalizada?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Aunque estos recursos son útiles, cada caso es único. Conecta con abogados de inmigración calificados para obtener asesoramiento personalizado.
          </p>
          <Link href="/es">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3">
              Encontrar un Abogado
            </Button>
          </Link>
        </section>
      </div>

    </div>
  );
}