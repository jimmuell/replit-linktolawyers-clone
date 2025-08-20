import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import AdminCard from './AdminCard';

export default function PromptManagementCard() {
  // Mock data for prompt management status - this would come from API in real implementation
  const promptData = {
    systemPromptsActive: true,
    responseTemplatesCount: 3,
    lastUpdated: 'Yesterday'
  };

  const getStatusInfo = () => {
    if (promptData.systemPromptsActive) {
      return {
        status: 'active',
        icon: CheckCircle,
        title: 'Active',
        description: 'System prompts configured',
        color: 'text-green-600',
        badgeVariant: 'default' as const,
      };
    } else {
      return {
        status: 'inactive',
        icon: AlertCircle,
        title: 'Inactive',
        description: 'Prompts need configuration',
        color: 'text-yellow-600',
        badgeVariant: 'secondary' as const,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <AdminCard
      title="Prompt Management"
      description="Chatbot prompts and response templates"
      icon={MessageSquare}
      iconColor="text-purple-600"
      route="/prompt-management"
      isLoading={false}
      error={null}
      actionText="Configure"
    >
      <div className="grid grid-cols-3 gap-6 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className="text-xs text-gray-500">Status</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{statusInfo.title}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Templates</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{promptData.responseTemplatesCount}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Updated</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{promptData.lastUpdated}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-900">Configuration:</div>
        <div className="text-sm text-gray-600">
          System prompts active for legal assistance
        </div>
      </div>
    </AdminCard>
  );
}