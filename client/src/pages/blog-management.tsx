import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, Calendar, User, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import type { BlogPost } from '@shared/schema';

const BlogManagementCard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
  });



  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/blog-posts/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({ title: 'Blog post deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/blog-posts'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting blog post', description: error.message, variant: 'destructive' });
    },
  });

  const handleDeletePost = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
      setPostToDelete(null);
    }
  };

  const publishedPosts = blogPosts?.filter(post => post.isPublished).length || 0;
  const draftPosts = blogPosts?.filter(post => !post.isPublished).length || 0;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Blog Management</CardTitle>
            <p className="text-sm text-gray-600">Create and manage blog posts</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate('/blog-management/create')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Total Posts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{blogPosts?.length || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600">Published</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{publishedPosts}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-600">Drafts</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900">{draftPosts}</p>
          </div>
        </div>

        {/* Blog Posts List */}
        {isLoading ? (
          <div className="text-center py-8">Loading blog posts...</div>
        ) : blogPosts?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blog posts yet. Create your first post to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {blogPosts?.map((post) => (
              <Card key={post.id} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.publishedAt ? 
                            formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) :
                            formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {post.slug}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/blog-management/edit/${post.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Delete Blog Post"
          description={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
};

export default function BlogManagement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/admin-dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="w-32" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="mt-2 text-gray-600">
            Create, edit, and manage your blog posts
          </p>
        </div>
        <BlogManagementCard />
      </div>
    </div>
  );
}