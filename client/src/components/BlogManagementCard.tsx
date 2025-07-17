import { useQuery } from '@tanstack/react-query';
import { FileText, Eye, EyeOff, Edit3 } from 'lucide-react';
import { Link } from 'wouter';
import AdminCard from './AdminCard';
import type { BlogPost } from '@shared/schema';

export default function BlogManagementCard() {
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog-posts'],
  });

  if (isLoading) {
    return (
      <AdminCard
        title="Blog Management"
        description="Loading blog posts..."
        icon={FileText}
        iconColor="text-purple-600"
        bgColor="bg-purple-100"
        isLoading={true}
      />
    );
  }

  if (error) {
    return (
      <AdminCard
        title="Blog Management"
        description="Error loading blog posts"
        icon={FileText}
        iconColor="text-red-600"
        bgColor="bg-red-100"
        actionButton={{
          label: 'Manage Blog',
          href: '/blog-management',
          variant: 'outline'
        }}
      />
    );
  }

  const totalPosts = blogPosts?.length || 0;
  const publishedPosts = blogPosts?.filter(post => post.isPublished).length || 0;
  const draftPosts = blogPosts?.filter(post => !post.isPublished).length || 0;

  return (
    <AdminCard
      title="Blog Management"
      description="Create and manage blog posts"
      icon={FileText}
      iconColor="text-purple-600"
      bgColor="bg-purple-100"
      actionButton={{
        label: 'Manage Blog',
        href: '/blog-management'
      }}
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FileText className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalPosts}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Eye className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">Published</span>
          </div>
          <div className="text-lg font-semibold text-green-900">{publishedPosts}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Edit3 className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-600">Drafts</span>
          </div>
          <div className="text-lg font-semibold text-yellow-900">{draftPosts}</div>
        </div>
      </div>

      {blogPosts && blogPosts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Posts</h4>
          {blogPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                <p className="text-xs text-gray-500 truncate">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-2">
                {post.isPublished ? (
                  <Eye className="w-4 h-4 text-green-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  );
}