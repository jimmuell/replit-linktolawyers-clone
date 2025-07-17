import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import type { BlogPost } from '@shared/schema';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlogHeader from '@/components/BlogHeader';

const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  isPublished: z.boolean().default(false),
  publishedAt: z.date().nullable().optional(),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

export default function BlogPostEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: blogPost, isLoading } = useQuery<BlogPost>({
    queryKey: ['/api/blog-posts', id],
    enabled: !!id,
  });

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      isPublished: false,
      publishedAt: null,
    },
  });

  // Update form when blog post loads
  useEffect(() => {
    if (blogPost) {
      form.reset({
        title: blogPost.title,
        slug: blogPost.slug,
        content: blogPost.content,
        excerpt: blogPost.excerpt,
        isPublished: blogPost.isPublished,
        publishedAt: blogPost.publishedAt ? new Date(blogPost.publishedAt) : null,
      });
    }
  }, [blogPost, form]);

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const postData: any = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        authorId: user?.id || 0,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date().toISOString() : null,
      };
      return await apiRequest('/api/blog-posts', {
        method: 'POST',
        body: postData,
      });
    },
    onSuccess: () => {
      toast({ title: 'Blog post created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      navigate('/blog-management');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error creating blog post', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const postData: any = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        authorId: user?.id || 0,
        isPublished: data.isPublished,
        publishedAt: data.isPublished && !blogPost?.publishedAt ? new Date().toISOString() : blogPost?.publishedAt,
      };
      return await apiRequest(`/api/blog-posts/${id}`, {
        method: 'PUT',
        body: postData,
      });
    },
    onSuccess: () => {
      toast({ title: 'Blog post updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
      navigate('/blog-management');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error updating blog post', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const onSubmit = (data: BlogPostForm) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    if (!isEditing) {
      form.setValue('slug', generateSlug(title));
    }
  };

  const handlePreview = () => {
    const slug = form.getValues('slug');
    if (slug) {
      window.open(`/blog/${slug}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BlogHeader title="Loading..." showBackButton={false} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BlogHeader title={isEditing ? "Edit Blog Post" : "Create Blog Post"} showBackButton={false} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          onClick={() => navigate('/blog-management')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog Management
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Enter blog post title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="url-friendly-slug"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief description of the blog post"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <ReactQuill
                          theme="snow"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Write your blog post content here..."
                          modules={{
                            toolbar: [
                              [{ 'header': [1, 2, 3, false] }],
                              ['bold', 'italic', 'underline', 'strike'],
                              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                              [{ 'indent': '-1'}, { 'indent': '+1' }],
                              [{ 'align': [] }],
                              ['link', 'blockquote', 'code-block'],
                              [{ 'color': [] }, { 'background': [] }],
                              ['clean']
                            ]
                          }}
                          formats={[
                            'header', 'bold', 'italic', 'underline', 'strike',
                            'blockquote', 'list', 'bullet', 'indent',
                            'link', 'color', 'background', 'align', 'code-block'
                          ]}
                          style={{ height: '400px', marginBottom: '50px' }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <FormLabel>Published</FormLabel>
                        <p className="text-sm text-gray-600">
                          {field.value ? 'This post will be visible to the public' : 'Save as draft'}
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/blog-management')}
                  >
                    Cancel
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Update' : 'Create'} Post
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}