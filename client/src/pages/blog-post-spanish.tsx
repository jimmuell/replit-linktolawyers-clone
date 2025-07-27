import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { Calendar, User, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BlogHeader from '@/components/BlogHeader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { BlogPost } from '@shared/schema';

export default function BlogPostSpanish() {
  const [, params] = useRoute("/es/blog/:slug");
  const slug = params?.slug;
  
  const { data: blogPost, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog-posts/slug/${slug}/spanish`],
    enabled: !!slug,
  });

  const formatDate = (date: string) => {
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatContent = (content: string) => {
    // Render HTML content from rich text editor
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader title={blogPost?.title || "Artículo del Blog"} showBackButton={false} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          asChild
        >
          <Link href="/es/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Link>
        </Button>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando artículo del blog...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Artículo del Blog No Encontrado</h1>
            <p className="text-gray-600 mb-6">El artículo del blog que buscas no existe o ha sido eliminado.</p>
            <Button asChild>
              <Link href="/es/blog">
                Volver al Blog
              </Link>
            </Button>
          </div>
        ) : blogPost ? (
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white px-8 py-12">
              <div className="mb-4">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  Ley de Inmigración
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {blogPost.title}
              </h1>
              <div className="flex items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {blogPost.publishedAt && formatDate(blogPost.publishedAt.toString())}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Equipo LinkToLawyers
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
              {/* Excerpt */}
              <div className="mb-8">
                <p className="text-xl text-gray-600 leading-relaxed">
                  {blogPost.excerpt}
                </p>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {formatContent(blogPost.content)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Publicado el {blogPost.publishedAt && formatDate(blogPost.publishedAt.toString())}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link href="/es/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Blog
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ) : null}

        {/* Call to Action */}
        {blogPost && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Necesitas Asesoría Legal?
              </h2>
              <p className="text-gray-600 mb-6">
                Nuestros abogados especializados en inmigración están aquí para ayudarte a navegar procesos legales complejos.
              </p>
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800"
                asChild
              >
                <Link href="/es/#quote-form">
                  Obtener Consulta Gratuita
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}