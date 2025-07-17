import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className="text-sm text-gray-600">Status</span>
          </div>
          <Badge variant={statusInfo.badgeVariant}>
            {statusInfo.title}
          </Badge>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Connection</div>
          <p className="text-sm font-medium">{statusInfo.description}</p>
        </div>
        
        {settings && (
          <div>
            <div className="text-sm text-gray-600 mb-1">From Email</div>
            <p className="text-sm font-medium">{settings.fromEmail}</p>
          </div>
        )}
      </div>
    </AdminCard>
  );
}