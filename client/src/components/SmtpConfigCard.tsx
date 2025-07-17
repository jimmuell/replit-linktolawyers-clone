import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Mail, Send, CheckCircle, XCircle, Settings, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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

interface EmailHistory {
  id: number;
  toAddress: string;
  subject: string;
  message: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

export default function SmtpConfigCard() {
  const [formData, setFormData] = useState<Partial<SmtpSettings>>({
    configurationName: 'SMTP2GO',
    smtpHost: 'mail.smtp2go.com',
    smtpPort: 2525,
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'LinkToLawyers',
    useSsl: false,
    isActive: true,
  });
  
  const [emailTest, setEmailTest] = useState({
    to: '',
    subject: 'Test Email from LinkToLawyers',
    message: 'This is a test email to verify SMTP2GO configuration is working correctly.',
  });
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SMTP settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/smtp/settings'],
    enabled: true,
    retry: false,
  });

  // Fetch email history
  const { data: emailHistory, isLoading: historyLoading } = useQuery<EmailHistory[]>({
    queryKey: ['/api/email/history'],
    enabled: true,
    retry: false,
  });

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings,
        password: '', // Don't prefill password for security
      }));
    }
  }, [settings]);

  // Save SMTP settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SmtpSettings>) => {
      return apiRequest(`/api/smtp/settings`, {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "SMTP2GO configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/smtp/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving settings",
        description: error.message || "Failed to save SMTP settings",
        variant: "destructive",
      });
    },
  });

  // Test SMTP connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/smtp/test`, { method: 'POST' });
    },
    onSuccess: (data) => {
      setConnectionStatus('success');
      setConnectionMessage(data.message);
      toast({
        title: "Connection successful",
        description: "SMTP2GO connection is working correctly.",
      });
    },
    onError: (error: any) => {
      setConnectionStatus('error');
      setConnectionMessage(error.message);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to SMTP2GO",
        variant: "destructive",
      });
    },
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async (emailData: { to: string; subject: string; message: string }) => {
      return apiRequest(`/api/email/send`, {
        method: 'POST',
        body: emailData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "Test email has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/email/history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send test email",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    if (!formData.username || !formData.password || !formData.fromEmail) {
      toast({
        title: "Missing required fields",
        description: "Please fill in username, password, and from email.",
        variant: "destructive",
      });
      return;
    }
    saveSettingsMutation.mutate(formData);
  };

  const handleTestConnection = () => {
    setConnectionStatus('testing');
    setConnectionMessage('');
    testConnectionMutation.mutate();
  };

  const handleSendTestEmail = () => {
    if (!emailTest.to || !emailTest.subject || !emailTest.message) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all email fields.",
        variant: "destructive",
      });
      return;
    }
    sendTestEmailMutation.mutate(emailTest);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          SMTP2GO Email Configuration
        </CardTitle>
        <CardDescription>
          Configure your SMTP2GO email service to send emails from your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="configurationName">Configuration Name</Label>
                <Input
                  id="configurationName"
                  value={formData.configurationName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, configurationName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={formData.smtpHost || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={formData.smtpPort || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password to update"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={formData.fromName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="useSsl"
                  checked={formData.useSsl || false}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useSsl: checked }))}
                />
                <Label htmlFor="useSsl">Use SSL (Port 465 only)</Label>
              </div>
            </div>
            
            <div className="pt-4">
              <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
                <Settings className="w-4 h-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Connection Test</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Button 
                    onClick={handleTestConnection} 
                    disabled={testConnectionMutation.isPending}
                    variant="outline"
                  >
                    {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </Button>
                  
                  {connectionStatus === 'testing' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  
                  {connectionStatus === 'success' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Connected</span>
                    </div>
                  )}
                  
                  {connectionStatus === 'error' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span>Failed</span>
                    </div>
                  )}
                </div>
                
                {connectionMessage && (
                  <p className={`text-sm ${connectionStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {connectionMessage}
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Send Test Email</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Recipient email"
                    value={emailTest.to}
                    onChange={(e) => setEmailTest(prev => ({ ...prev, to: e.target.value }))}
                  />
                  <Input
                    placeholder="Subject"
                    value={emailTest.subject}
                    onChange={(e) => setEmailTest(prev => ({ ...prev, subject: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Message"
                    value={emailTest.message}
                    onChange={(e) => setEmailTest(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                  <Button onClick={handleSendTestEmail} disabled={sendTestEmailMutation.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Email History</h3>
            </div>
            
            {historyLoading ? (
              <div className="text-center py-4">Loading email history...</div>
            ) : !emailHistory || emailHistory.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No emails sent yet</div>
            ) : (
              <div className="space-y-2">
                {emailHistory.map((email) => (
                  <div key={email.id} className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{email.toAddress}</span>
                        <Badge variant={email.status === 'sent' ? 'default' : 'destructive'}>
                          {email.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(email.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <strong>Subject:</strong> {email.subject}
                    </div>
                    {email.errorMessage && (
                      <div className="text-sm text-red-600">
                        <strong>Error:</strong> {email.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}