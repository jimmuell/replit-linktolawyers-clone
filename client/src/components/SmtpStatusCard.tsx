import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Mail, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import AdminCard from './AdminCard';

interface SmtpSettings {
  id: number;
  configurationName: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  fromEmail: string;
  fromName: string;
  useSsl: boolean;
  isActive: boolean;
}

export default function SmtpStatusCard() {
  const { data: settings, isLoading, error } = useQuery<SmtpSettings>({
    queryKey: ['/api/smtp/settings'],
    enabled: true,
    retry: false,
  });

  const getStatusInfo = () => {
    if (!settings) {
      return {
        status: 'not-configured',
        icon: AlertCircle,
        title: 'Not Configured',
        description: 'Email service needs setup',
        color: 'text-yellow-600',
        badgeVariant: 'secondary' as const,
      };
    }

    if (settings.isActive) {
      return {
        status: 'configured',
        icon: CheckCircle,
        title: 'Active',
        description: `${settings.smtpHost}:${settings.smtpPort}`,
        color: 'text-green-600',
        badgeVariant: 'default' as const,
      };
    } else {
      return {
        status: 'inactive',
        icon: XCircle,
        title: 'Inactive',
        description: 'Configuration disabled',
        color: 'text-red-600',
        badgeVariant: 'destructive' as const,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <AdminCard
      title="SMTP Configuration"
      description="Email service settings and status"
      icon={Mail}
      iconColor="text-blue-600"
      route="/smtp-config"
      isLoading={isLoading}
      error={error}
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
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Host</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {settings?.smtpHost ? 'SMTP2GO' : 'N/A'}
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Port</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">{settings?.smtpPort || 'N/A'}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-gray-600 mb-2">Configuration:</div>
        <p className="text-sm font-medium">{settings?.fromEmail || 'No email configured'}</p>
      </div>
    </AdminCard>
  );
}