import { useQuery } from '@tanstack/react-query';
import { Calendar, User, ChevronRight, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import BlogHeader from '@/components/BlogHeader';
import type { BlogPost } from '@shared/schema';

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
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              LinkToLawyers Blog
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Stay informed with the latest immigration news, legal insights, and expert guidance
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                  {blogPosts?.filter(post => post.isFeatured).map((post) => (
                    <Card key={post.id} className="hover:shadow-xl transition-shadow duration-300 border-2 border-blue-200">
                      {post.imageUrl && (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={post.imageUrl} 
                            alt={post.imageAlt || post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600 text-white">Featured</Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 hover:text-black transition-colors mb-2">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.publishedAt && formatDate(post.publishedAt.toString())}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {post.excerpt || stripHtmlAndTruncate(post.content, 150)}
                        </p>
                        
                        <Button 
                          variant="default" 
                          size="sm"
                          className="w-full group bg-blue-600 hover:bg-blue-700"
                          asChild
                        >
                          <Link href={`/blog/${post.slug}`}>
                            Read Featured Post
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts Section */}
            <div>
              {blogPosts && blogPosts.filter(post => post.isFeatured).length > 0 && (
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogPosts?.filter(post => !post.isFeatured).map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
                    {post.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.imageAlt || post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 hover:text-black transition-colors mb-2">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.publishedAt && formatDate(post.publishedAt.toString())}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {post.excerpt || stripHtmlAndTruncate(post.content, 150)}
                      </p>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full group"
                        asChild
                      >
                        <Link href={`/blog/${post.slug}`}>
                          Read More
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
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