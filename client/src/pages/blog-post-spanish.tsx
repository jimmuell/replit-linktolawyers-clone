import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Share2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

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

export default function BlogPostSpanish() {
  const [, params] = useRoute("/es/blog/:slug");
  const [shareMessage, setShareMessage] = useState("");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/slug/${slug}/spanish`],
    enabled: !!slug,
  });

  const handleShare = async () => {
    if (!post) return;
    
    const url = window.location.href;
    const title = post.title;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setShareMessage("Enlace copiado al portapapeles");
        setTimeout(() => setShareMessage(""), 2000);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage("Enlace copiado al portapapeles");
        setTimeout(() => setShareMessage(""), 2000);
      } catch (err) {
        setShareMessage("No se pudo copiar el enlace");
        setTimeout(() => setShareMessage(""), 2000);
      }
    }
  };

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
                <h2 className="text-lg font-medium text-gray-900">Cargando...</h2>
              </div>
              <div className="flex items-center">
                <Link href="/es/blog">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-black text-white rounded-lg p-8 mb-8 animate-pulse">
            <div className="h-6 bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-600 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-2/3"></div>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">LinkToLawyers</h1>
              </div>
              <div className="flex items-center">
                <h2 className="text-lg font-medium text-gray-900">Error</h2>
              </div>
              <div className="flex items-center">
                <Link href="/es/blog">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al Blog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-black text-white rounded-lg p-8 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Artículo No Encontrado
            </h1>
            <p className="text-gray-300 text-lg">
              Lo sentimos, el artículo que buscas no existe o no está disponible.
            </p>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <Link href="/es/blog">
              <Button className="bg-black text-white hover:bg-gray-800">Volver al blog</Button>
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
              <h2 className="text-lg font-medium text-gray-900">{post.title}</h2>
            </div>
            <div className="flex items-center">
              <Link href="/es/blog">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Black Hero Section with Article Title */}
        <div className="bg-black text-white rounded-lg p-8 mb-8">
          <div className="mb-4">
            <span className="inline-block bg-white text-black text-sm px-3 py-1 rounded-full font-medium">
              Ley de Inmigración
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            {post.excerpt || "No todos los casos requieren un abogado, pero cuando lo necesitas, esperar demasiado para obtener ayuda puede costarte tiempo, dinero y tranquilidad. Ya sea que te enfrentes a una lesión, recibas un aviso legal o simplemente no estés seguro de tus derechos, saber cuándo consultar a un abogado puede marcar la diferencia. En este artículo, analizamos cinco señales claras de que es hora de obtener apoyo legal y cómo LinkToLawyers facilita obtener respuestas, rápido."}
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(post.publishedAt), "d 'de' MMMM, yyyy", { locale: es })}
              </div>
            )}
            {post.author && (
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-li:my-1"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Share Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                ¿Te resultó útil este artículo?
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </Button>
                {shareMessage && (
                  <div className="absolute top-full mt-2 right-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {shareMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-white rounded-lg p-8 shadow-sm border">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¿Necesitas Asesoría Legal Personalizada?
            </h3>
            <p className="text-gray-600 mb-4">
              Nuestros abogados especializados en inmigración están listos para ayudarte con tu caso específico.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/es">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                  Obtener Consulta Gratuita
                </Button>
              </Link>
              <Link href="/es/blog">
                <Button variant="outline" size="lg">
                  Ver Más Artículos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}