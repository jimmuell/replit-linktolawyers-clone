import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Clock, User } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
};

// Helper function to strip HTML and truncate text
function stripHtmlAndTruncate(html: string, maxLength: number = 150): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export default function BlogSpanish() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: blogPosts = [], isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts/published/spanish"],
  });

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
              </div>
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-gray-900">Blog</h2>
              </div>
              <div className="flex items-center">
                <Link 
                  href="/es"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }, 50);
                  }}
                >
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog de LinkToLawyers
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Cargando artículos...
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
              </div>
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-gray-900">Blog</h2>
              </div>
              <div className="flex items-center">
                <Link 
                  href="/es"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }, 50);
                  }}
                >
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Inicio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Error al Cargar
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              No pudimos cargar los artículos del blog en este momento
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link 
              href="/es"
              onClick={() => {
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }, 50);
              }}
            >
              <Button className="bg-black text-white hover:bg-gray-800">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
            </div>
            <div className="flex items-center">
              <h2 className="text-lg font-medium text-gray-900">Blog</h2>
            </div>
            <div className="flex items-center">
              <Link 
                href="/es"
                onClick={() => {
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }, 50);
                }}
              >
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Black Hero Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Blog de LinkToLawyers
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Mantente informado con las últimas noticias de inmigración, perspectivas legales y orientación experta
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="relative mb-12 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar artículos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron artículos
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? "No hay artículos que coincidan con tu búsqueda." 
                : "Aún no hay artículos publicados en el blog."}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link href={`/es/blog/${post.slug}`} className="hover:text-gray-700">
                      {post.title}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4" />
                    {post.publishedAt && format(new Date(post.publishedAt), "d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-4 text-sm leading-relaxed">
                  {post.excerpt || stripHtmlAndTruncate(post.content)}
                </p>
                <Link href={`/es/blog/${post.slug}`}>
                  <Button variant="outline" size="sm" className="mt-auto">
                    Leer Más →
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white rounded-lg p-8 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¿Necesitas Ayuda Legal?
          </h3>
          <p className="text-gray-600 mb-4">
            Conecta con abogados especializados en inmigración que pueden ayudarte con tu caso específico.
          </p>
          <Link href="/es">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Obtener Consulta Gratuita
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}