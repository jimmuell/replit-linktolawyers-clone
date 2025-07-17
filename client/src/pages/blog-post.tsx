import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Calendar, User, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import type { BlogPost } from '@shared/schema';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();
  
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

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      setIsLoginModalOpen(false);
      toast({ title: 'Login successful!' });
    } catch (error: any) {
      toast({ 
        title: 'Login failed', 
        description: error.message || 'Please check your credentials and try again.',
        variant: 'destructive' 
      });
    }
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatContent = (content: string) => {
    // Simple formatting: convert line breaks to paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        activeSection={activeSection} 
        scrollToSection={scrollToSection} 
        setIsLoginModalOpen={setIsLoginModalOpen} 
        hideUserDropdown={true} 
      />
      
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
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white px-8 py-12">
              <div className="mb-4">
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  Immigration Law
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {blogPost.title}
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                {blogPost.excerpt}
              </p>
              <div className="flex items-center gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {blogPost.publishedAt && formatDate(blogPost.publishedAt)}
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  LinkToLawyers Team
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-12">
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
                  Published on {blogPost.publishedAt && formatDate(blogPost.publishedAt)}
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

      {/* Login Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-black hover:bg-gray-800">
                Sign In
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}