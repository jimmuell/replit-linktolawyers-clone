import { useQuery } from '@tanstack/react-query';
import { Mail, Power, PowerOff } from 'lucide-react';
import AdminCard from './AdminCard';
import type { EmailTemplate } from '@shared/schema';

export default function EmailTemplatesCard() {
  const { data: templates, isLoading, error } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/email-templates'],
  });

  if (isLoading) {
    return (
      <AdminCard
        title="Email Templates"
        description="Loading email templates..."
        icon={Mail}
        iconColor="text-purple-600"
        route="/email-templates"
        isLoading={true}
      >
        <div></div>
      </AdminCard>
    );
  }

  if (error) {
    return (
      <AdminCard
        title="Email Templates"
        description="Error loading email templates"
        icon={Mail}
        iconColor="text-red-600"
        route="/email-templates"
        error={error}
      >
        <div></div>
      </AdminCard>
    );
  }

  const totalTemplates = templates?.length || 0;
  const activeTemplates = templates?.filter(t => t.isActive).length || 0;
  const inactiveTemplates = templates?.filter(t => !t.isActive).length || 0;

  return (
    <AdminCard
      title="Email Templates"
      description="Manage email templates for various system communications"
      icon={Mail}
      iconColor="text-purple-600"
      route="/email-templates"
      actionText="Manage Templates"
    >
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{totalTemplates}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Power className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600">Active</span>
          </div>
          <div className="text-lg font-semibold text-green-900">{activeTemplates}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <PowerOff className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">Inactive</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{inactiveTemplates}</div>
        </div>
      </div>

      <div className="space-y-2">
        {templates?.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No email templates found</p>
            <p className="text-xs">Click "Manage Templates" to create your first template</p>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-2">Recent Templates:</div>
            {templates?.slice(0, 3).map((template) => (
              <div key={template.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                  <div className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div className="text-xs text-gray-500">{template.templateType}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </AdminCard>
  );
}