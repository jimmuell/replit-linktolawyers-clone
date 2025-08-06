import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Calendar, User, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BlogHeader from '@/components/BlogHeader';
import { OptimizedImage } from '@/components/OptimizedImage';
import type { BlogPost } from '@shared/schema';
import { getImageUrl } from '@/lib/imageUtils';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: blogPost, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog-posts/slug', slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog-posts/slug/${slug}`);
      if (!response.ok) {
        throw new Error('Blog post not found');
      }
      return response.json();
    },
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatContent = (content: string) => {
    // Render HTML content from rich text editor
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  // Add structured data for SEO
  const jsonLd = blogPost ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blogPost.title,
    description: blogPost.excerpt,
    image: blogPost.imageUrl ? getImageUrl(blogPost.imageUrl) : undefined,
    author: {
      "@type": "Organization",
      name: "LinkToLawyers Team"
    },
    publisher: {
      "@type": "Organization", 
      name: "LinkToLawyers",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png"
      }
    },
    datePublished: blogPost.publishedAt,
    dateModified: blogPost.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": window.location.href
    }
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO structured data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogHeader title={blogPost?.title || "Blog Post"} showBackButton={false} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          asChild
        >
          <Link href="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link href="/blog">
                Return to Blog
              </Link>
            </Button>
          </div>
        ) : blogPost ? (
          <article className="bg-white overflow-hidden">
            {/* Hero Section with Featured Image */}
            {blogPost.imageUrl && (
              <div className="relative">
                <div className="aspect-[21/9] overflow-hidden">
                  <OptimizedImage
                    src={getImageUrl(blogPost.imageUrl) || blogPost.imageUrl}
                    alt={blogPost.imageAlt || blogPost.title}
                    className="w-full h-full object-cover"
                    priority={true}
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 py-12">
              <div className="mb-6 flex items-center gap-2">
                {blogPost.isFeatured && (
                  <Badge className="bg-yellow-500 text-white font-medium px-3 py-1">
                    Featured
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-medium">
                  Immigration Law
                </Badge>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {blogPost.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {blogPost.excerpt}
              </p>
              
              <div className="flex items-center gap-6 text-gray-500 border-b border-gray-200 pb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">LinkToLawyers Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {blogPost.publishedAt && formatDate(blogPost.publishedAt.toString())}
                </div>
                <div className="text-sm">
                  Updated: {blogPost.updatedAt && formatDate(blogPost.updatedAt.toString())}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
              <div className="prose prose-lg prose-gray max-w-none">
                <div className="text-gray-800 leading-relaxed text-lg">
                  {formatContent(blogPost.content)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Published on {blogPost.publishedAt && formatDate(blogPost.publishedAt.toString())}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link href="/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
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
                Need Legal Assistance?
              </h2>
              <p className="text-gray-600 mb-6">
                Our experienced immigration attorneys are here to help you navigate complex legal processes.
              </p>
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800"
                asChild
              >
                <Link href="/#quote-form">
                  Get Free Quote
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}