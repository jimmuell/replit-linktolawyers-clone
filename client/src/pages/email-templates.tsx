import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Edit, Trash2, Eye, Power, PowerOff, Calendar, Type, Code, Monitor, Smartphone, Tablet, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatDistanceToNow } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { EmailTemplate } from '@shared/schema';
import AdminNavbar from '@/components/AdminNavbar';

const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().optional(),
  templateType: z.string().min(1, 'Template type is required'),
  variables: z.string().optional(),
  isActive: z.boolean().default(true),
  useInProduction: z.boolean().default(false),
});

type EmailTemplateForm = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateModalProps {
  template?: EmailTemplate;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const templateTypes = [
  { value: 'legal_request_confirmation', label: 'Legal Request Confirmation' },
  { value: 'legal_request_confirmation_spanish', label: 'Legal Request Confirmation (Spanish)' },
  { value: 'attorney_assignment', label: 'Attorney Assignment' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'notification', label: 'Notification' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'general', label: 'General' },
];

function EmailTemplateModal({ template, onClose, mode }: EmailTemplateModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const form = useForm<EmailTemplateForm>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: template?.name || '',
      subject: template?.subject || '',
      htmlContent: template?.htmlContent || '',
      textContent: template?.textContent || '',
      templateType: template?.templateType || '',
      variables: template?.variables || '',
      isActive: template?.isActive ?? true,
      useInProduction: template?.useInProduction ?? false,
    },
  });

  // Reset form when template changes
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name || '',
        subject: template.subject || '',
        htmlContent: template.htmlContent || '',
        textContent: template.textContent || '',
        templateType: template.templateType || '',
        variables: template.variables || '',
        isActive: template.isActive ?? true,
        useInProduction: template.useInProduction ?? false,
      });
    } else {
      // Reset to empty values for create mode
      form.reset({
        name: '',
        subject: '',
        htmlContent: '',
        textContent: '',
        templateType: '',
        variables: '',
        isActive: true,
        useInProduction: false,
      });
    }
  }, [template, form]);

  const watchedHtmlContent = form.watch('htmlContent');

  const getPreviewStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  const renderVariablesHelp = () => {
    if (!template?.variables) return null;
    
    let variablesArray: string[] = [];
    
    try {
      const parsed = JSON.parse(template.variables);
      if (Array.isArray(parsed)) {
        variablesArray = parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        variablesArray = Object.keys(parsed);
      }
    } catch (error) {
      console.error('Error parsing template variables:', error);
      return null;
    }
    
    if (variablesArray.length === 0) return null;

    return (
      <div className="mt-2 p-3 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Available Variables:</h4>
        <div className="flex flex-wrap gap-1">
          {variablesArray.map((variable: string) => (
            <Badge key={variable} variant="secondary" className="text-xs">
              {`{{${variable}}}`}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  const createMutation = useMutation({
    mutationFn: async (data: EmailTemplateForm) => {
      return apiRequest('/api/email-templates', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      toast({
        title: 'Success',
        description: 'Email template created successfully',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create email template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: EmailTemplateForm) => {
      return apiRequest(`/api/email-templates/${template!.id}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      toast({
        title: 'Success',
        description: 'Email template updated successfully',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update email template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EmailTemplateForm) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else if (mode === 'edit') {
      updateMutation.mutate(data);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === 'create' && 'Create Email Template'}
          {mode === 'edit' && 'Edit Email Template'}
          {mode === 'view' && 'View Email Template'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Enter template name"
              readOnly={isReadOnly}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="templateType">Template Type</Label>
            <Select
              value={form.watch('templateType')}
              onValueChange={(value) => form.setValue('templateType', value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                {templateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.templateType && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.templateType.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="subject">Email Subject</Label>
          <Input
            id="subject"
            {...form.register('subject')}
            placeholder="Enter email subject"
            readOnly={isReadOnly}
          />
          {form.formState.errors.subject && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.subject.message}</p>
          )}
        </div>

        <div>
          <Label>HTML Content</Label>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="w-full">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="grid w-[300px] grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Edit HTML
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'preview' && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <TabsContent value="edit" className="space-y-4">
              <Textarea
                {...form.register('htmlContent')}
                placeholder="Enter HTML content"
                rows={15}
                readOnly={isReadOnly}
                className="font-mono text-sm"
              />
              {form.formState.errors.htmlContent && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.htmlContent.message}</p>
              )}
              {renderVariablesHelp()}
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className="border border-gray-300 rounded-lg overflow-hidden bg-white"
                  style={getPreviewStyles()}
                >
                  <div 
                    className="w-full h-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: watchedHtmlContent || '<p>No content to preview</p>' }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Label htmlFor="textContent">Text Content (Optional)</Label>
          <Textarea
            id="textContent"
            {...form.register('textContent')}
            placeholder="Enter plain text content"
            className="min-h-[100px]"
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <Label htmlFor="variables">Available Variables (JSON)</Label>
          <Textarea
            id="variables"
            {...form.register('variables')}
            placeholder='{"firstName": "Client first name", "lastName": "Client last name"}'
            className="min-h-[80px] font-mono"
            readOnly={isReadOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
              disabled={isReadOnly}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="useInProduction"
              checked={form.watch('useInProduction')}
              onCheckedChange={(checked) => form.setValue('useInProduction', checked)}
              disabled={isReadOnly}
            />
            <Label htmlFor="useInProduction" className="text-sm font-medium">
              Use in Production
            </Label>
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {mode === 'create' ? 'Create Template' : 'Update Template'}
            </Button>
          </div>
        )}
      </form>
    </DialogContent>
  );
}

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/email-templates'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/email-templates/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-templates'] });
      toast({
        title: 'Success',
        description: 'Email template deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Delete template error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Check if it's an authentication error
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
        // Redirect to login or refresh page
        window.location.href = '/';
      } else {
        toast({
          title: 'Error',
          description: `Failed to delete email template: ${errorMessage}`,
          variant: 'destructive',
        });
      }
    },
  });

  const handleCreate = () => {
    setSelectedTemplate(undefined);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = (template: EmailTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteMutation.mutate(template.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(undefined);
  };

  const activeTemplates = templates?.filter(t => t.isActive).length || 0;
  const inactiveTemplates = templates?.filter(t => !t.isActive).length || 0;
  const productionTemplates = templates?.filter(t => t.useInProduction).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Email Templates" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
              <p className="text-gray-600 mt-2">Manage email templates for various system communications</p>
            </div>
            <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-blue-600 mr-2" />
                <div className="text-2xl font-bold text-gray-900">{templates?.length || 0}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">Active Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Power className="h-6 w-6 text-green-600 mr-2" />
                <div className="text-2xl font-bold text-green-900">{activeTemplates}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600">Production Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-6 w-6 text-red-600 mr-2" />
                <div className="text-2xl font-bold text-red-900">{productionTemplates}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Inactive Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <PowerOff className="h-6 w-6 text-gray-600 mr-2" />
                <div className="text-2xl font-bold text-gray-900">{inactiveTemplates}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>
              Manage your email templates for different types of communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : templates?.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email templates found</h3>
                <p className="text-gray-500 mb-4">Create your first email template to get started</p>
                <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {templates?.map((template) => (
                  <div
                    key={template.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {template.useInProduction && (
                            <Badge variant="destructive" className="text-xs">
                              Production
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {templateTypes.find(t => t.value === template.templateType)?.label || template.templateType}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(template.createdAt), { addSuffix: true })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Type className="h-3 w-3" />
                            {template.templateType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(template)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <EmailTemplateModal
          template={selectedTemplate}
          onClose={handleCloseModal}
          mode={modalMode}
        />
      </Dialog>
    </div>
  );
}