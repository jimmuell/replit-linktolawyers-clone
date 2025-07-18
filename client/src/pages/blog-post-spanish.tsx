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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/es/blog">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Blog
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Cargando...</h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/es/blog">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Blog
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Error</h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h2>
            <p className="text-gray-600 mb-6">
              Lo sentimos, el artículo que buscas no existe o no está disponible.
            </p>
            <Link href="/es/blog">
              <Button>Volver al blog</Button>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/es/blog">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Blog
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Artículo</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-6 text-sm text-gray-500">
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

          {post.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 font-medium">{post.excerpt}</p>
            </div>
          )}
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-lg p-8 shadow-sm border">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¿Necesitas Asesoría Legal Personalizada?
            </h3>
            <p className="text-gray-600 mb-4">
              Nuestros abogados especializados en inmigración están listos para ayudarte con tu caso específico.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/es">
                <Button size="lg">
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

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Link href="/es/blog">
            <Button variant="ghost" className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}