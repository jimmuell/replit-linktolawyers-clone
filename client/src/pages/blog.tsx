import { useQuery } from '@tanstack/react-query';
import { Calendar, User, ChevronRight, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import BlogHeader from '@/components/BlogHeader';
import { OptimizedImage } from '@/components/OptimizedImage';
import type { BlogPost } from '@shared/schema';
import { getImageUrl } from '@/lib/imageUtils';

export default function Blog() {
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts/published'],
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stripHtmlAndTruncate = (html: string, maxLength: number = 200) => {
    // Strip HTML tags and decode HTML entities
    const text = html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader title="Blog" showBackButton={true} />
      
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Latest Stories</p>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Discover Our Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Insights, tutorials, and stories from our team. Stay updated with the latest trends and best practices in immigration law.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Blog Posts</h3>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        ) : blogPosts?.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
            <p className="text-gray-600">Check back soon for the latest immigration law insights and updates.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Posts Section */}
            {blogPosts && blogPosts.filter(post => post.isFeatured).length > 0 && (
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured</h2>
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                    Editor's Pick
                  </span>
                </div>
                <div className="max-w-4xl mx-auto">
                  {blogPosts?.filter(post => post.isFeatured).slice(0, 1).map((post) => (
                    <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden border-0 shadow-sm">
                      <Link href={`/blog/${post.slug}`} className="block">
                        {post.imageUrl && (
                          <div className="relative aspect-[2/1] overflow-hidden">
                            <OptimizedImage
                              src={getImageUrl(post.imageUrl) || post.imageUrl}
                              alt={post.imageAlt || post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-yellow-500 text-white font-medium px-3 py-1">
                                Featured
                              </Badge>
                            </div>
                          </div>
                        )}
                        <div className="p-8">
                          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 hover:text-gray-700 transition-colors mb-4 leading-tight">
                            {post.title}
                          </CardTitle>
                          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                            {post.excerpt || stripHtmlAndTruncate(post.content, 150)}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3" />
                              </div>
                              <span>LinkToLawyers Team</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {post.publishedAt && formatDate(post.publishedAt.toString())}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts Section */}
            <div>
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Posts</h2>
                <p className="text-gray-600">
                  {blogPosts?.length || 0} post{blogPosts?.length !== 1 ? 's' : ''} published
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts?.filter(post => !post.isFeatured).map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden border-0 shadow-sm">
                    <Link href={`/blog/${post.slug}`} className="block">
                      {post.imageUrl && (
                        <div className="relative aspect-video overflow-hidden">
                          <OptimizedImage
                            src={getImageUrl(post.imageUrl) || post.imageUrl}
                            alt={post.imageAlt || post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-green-600 text-white font-medium px-2 py-1 text-xs">
                              published
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="p-6">
                        <CardTitle className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors mb-3 leading-tight">
                          {post.title}
                        </CardTitle>
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                          {post.excerpt || stripHtmlAndTruncate(post.content, 120)}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-2.5 h-2.5" />
                            </div>
                            <span>LinkToLawyers</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.publishedAt && formatDate(post.publishedAt.toString())}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        {blogPosts && blogPosts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
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