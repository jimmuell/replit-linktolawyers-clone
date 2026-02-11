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
import { Mail, Send, CheckCircle, XCircle, Settings, History, Bell, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface SmtpSettings {
  id: number;
  configurationName: string;
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
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
    configurationName: 'Resend',
    smtpHost: 'smtp.resend.com',
    smtpPort: 587,
    username: 'resend',
    password: '',
    fromEmail: '',
    fromName: 'LinkToLawyers',
    useSsl: true,
    isActive: true,
  });
  
  const [emailTest, setEmailTest] = useState({
    to: '',
    subject: 'Test Email from LinkToLawyers',
    message: 'This is a test email to verify Resend configuration is working correctly.',
  });
  
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [newNotifyEmail, setNewNotifyEmail] = useState('');
  
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

  // Fetch notification emails
  const { data: notifyData } = useQuery<{ emails: string[] }>({
    queryKey: ['/api/admin/notification-emails'],
    retry: false,
  });
  const notificationEmails = notifyData?.emails || [];

  const saveNotifyMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      await apiRequest('/api/admin/notification-emails', {
        method: 'PUT',
        body: { emails },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notification-emails'] });
      toast({ title: 'Saved', description: 'Notification emails updated successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update notification emails', variant: 'destructive' });
    },
  });

  const handleAddNotifyEmail = () => {
    const email = newNotifyEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    if (notificationEmails.includes(email)) {
      toast({ title: 'Duplicate', description: 'This email is already in the list.', variant: 'destructive' });
      return;
    }
    saveNotifyMutation.mutate([...notificationEmails, email]);
    setNewNotifyEmail('');
  };

  const handleRemoveNotifyEmail = (emailToRemove: string) => {
    saveNotifyMutation.mutate(notificationEmails.filter(e => e !== emailToRemove));
  };

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
        description: "Resend configuration has been saved successfully.",
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
    onSuccess: (data: any) => {
      setConnectionStatus('success');
      setConnectionMessage(data?.message || 'Connection successful');
      toast({
        title: "Connection successful",
        description: "Resend connection is working correctly.",
      });
    },
    onError: (error: any) => {
      setConnectionStatus('error');
      setConnectionMessage(error.message);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Resend",
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
    if (!formData.fromEmail || !formData.fromName) {
      toast({
        title: "Missing required fields",
        description: "Please fill in from email and from name.",
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
    if (!emailTest.to) {
      toast({
        title: "Missing required fields",
        description: "Please enter a test email address.",
        variant: "destructive",
      });
      return;
    }
    
    // Set default values for subject and message for Resend test
    const testData = {
      to: emailTest.to,
      subject: "Resend Configuration Test",
      message: "This is a test email to verify your Resend configuration is working properly."
    };
    
    sendTestEmailMutation.mutate(testData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Resend Email Configuration
        </CardTitle>
        <CardDescription>
          Configure your Resend email service to send emails from your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="test">Test</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Resend Integration</h3>
                  <p className="text-sm text-blue-700">
                    Configure your Resend API settings for sending intake summaries and notifications. Your API key is stored securely as an environment variable.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={formData.fromEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="noreply@send.linktolawyers.com"
                />
                <p className="text-xs text-gray-500">Must be a verified domain in Resend</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={formData.fromName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="LinkToLawyers"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To Address</Label>
                <Input
                  id="replyTo"
                  type="email"
                  value="support@linktolawyers.com"
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKeyStatus">API Key Status</Label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-md border">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-700">Environment Configuration</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Set RESEND_API_KEY in environment variables</p>
              </div>
            </div>
            
            <div className="pt-6 border-t">
              <Button onClick={handleSaveSettings} disabled={saveSettingsMutation.isPending}>
                <Settings className="w-4 h-4 mr-2" />
                {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Developer Notifications</h3>
                  <p className="text-sm text-amber-700">
                    Add email addresses below to receive notifications when a new legal request is submitted. All listed addresses will receive an email with the request details.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                type="email"
                value={newNotifyEmail}
                onChange={(e) => setNewNotifyEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNotifyEmail(); } }}
                className="flex-1"
              />
              <Button onClick={handleAddNotifyEmail} disabled={saveNotifyMutation.isPending} className="bg-black hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {notificationEmails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notification emails configured</p>
                <p className="text-sm">Add email addresses above to start receiving notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">{notificationEmails.length} recipient{notificationEmails.length !== 1 ? 's' : ''} configured</p>
                {notificationEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNotifyEmail(email)}
                      disabled={saveNotifyMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="test" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Test Email Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="test@example.com"
                    value={emailTest.to}
                    onChange={(e) => setEmailTest(prev => ({ ...prev, to: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500">Sends a test email to verify your configuration</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleSendTestEmail} 
                    disabled={sendTestEmailMutation.isPending || !emailTest.to}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test'}
                  </Button>
                  
                  {sendTestEmailMutation.isPending && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm font-medium">
                    LinkToLawyers &lt;{settings?.fromEmail || 'noreply@send.linktolawyers.com'}&gt;
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reply-To:</span>
                  <span className="text-sm font-medium">support@linktolawyers.com</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Service:</span>
                  <span className="text-sm font-medium text-blue-600">Resend API</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-blue-600">Server Configured</span>
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