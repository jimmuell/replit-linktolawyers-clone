import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Mail, CheckCircle, XCircle, Settings, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

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
  const [, navigate] = useLocation();

  // Fetch SMTP settings
  const { data: settings, isLoading } = useQuery<SmtpSettings>({
    queryKey: ['/api/smtp/settings'],
    enabled: true,
    retry: false,
  });

  const handleConfigureClick = () => {
    navigate('/smtp-config');
  };

  const getStatusInfo = () => {
    if (isLoading) {
      return {
        status: 'loading',
        icon: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>,
        title: 'Checking SMTP Status...',
        description: 'Loading configuration...',
        color: 'text-gray-600',
      };
    }

    if (!settings) {
      return {
        status: 'not-configured',
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        title: 'SMTP Not Configured',
        description: 'Email service needs to be set up',
        color: 'text-yellow-600',
      };
    }

    if (settings.isActive) {
      return {
        status: 'configured',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        title: 'SMTP Configured',
        description: `Connected to ${settings.smtpHost}:${settings.smtpPort}`,
        color: 'text-green-600',
      };
    } else {
      return {
        status: 'inactive',
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: 'SMTP Inactive',
        description: 'Configuration exists but is disabled',
        color: 'text-red-600',
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Configuration
        </CardTitle>
        {statusInfo.icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className={`text-sm font-medium ${statusInfo.color}`}>
              {statusInfo.title}
            </h3>
            <p className="text-xs text-gray-500">
              {statusInfo.description}
            </p>
          </div>
          
          {settings && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Service:</span> {settings.configurationName}
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">From:</span> {settings.fromName} &lt;{settings.fromEmail}&gt;
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleConfigureClick}
            className="w-full"
            variant={settings ? "outline" : "default"}
          >
            <Settings className="w-4 h-4 mr-2" />
            {settings ? 'Manage Configuration' : 'Configure SMTP'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}