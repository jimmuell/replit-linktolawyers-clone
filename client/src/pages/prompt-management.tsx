import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Edit, Trash2, MessageSquare, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import AdminNavbar from '@/components/AdminNavbar';
import { apiRequest } from '@/lib/queryClient';

interface ChatbotPrompt {
  id: number;
  name: string;
  prompt: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const promptFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type PromptFormData = z.infer<typeof promptFormSchema>;

export default function PromptManagement() {
  const { user, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ChatbotPrompt | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      name: '',
      prompt: '',
      description: '',
      isActive: false,
    },
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      window.location.href = '/';
    }
  }, [user, loading]);

  const { data: prompts = [], isLoading } = useQuery<ChatbotPrompt[]>({
    queryKey: ['/api/chatbot-prompts'],
    enabled: !!user && user.role === 'admin',
  });

  const createPromptMutation = useMutation({
    mutationFn: (data: PromptFormData) => apiRequest('/api/chatbot-prompts', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-prompts'] });
      toast({ title: 'Success', description: 'Prompt created successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Create prompt error:', error);
      toast({ title: 'Error', description: `Failed to create prompt: ${error.message}`, variant: 'destructive' });
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PromptFormData }) =>
      apiRequest(`/api/chatbot-prompts/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-prompts'] });
      toast({ title: 'Success', description: 'Prompt updated successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      console.error('Update prompt error:', error);
      toast({ title: 'Error', description: `Failed to update prompt: ${error.message}`, variant: 'destructive' });
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/chatbot-prompts/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-prompts'] });
      toast({ title: 'Success', description: 'Prompt deleted successfully' });
    },
    onError: (error: any) => {
      console.error('Delete prompt error:', error);
      toast({ title: 'Error', description: `Failed to delete prompt: ${error.message}`, variant: 'destructive' });
    },
  });

  const activatePromptMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/chatbot-prompts/${id}/activate`, { method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chatbot-prompts'] });
      toast({ title: 'Success', description: 'Prompt activated successfully' });
    },
    onError: (error: any) => {
      console.error('Activate prompt error:', error);
      toast({ title: 'Error', description: `Failed to activate prompt: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    form.reset({
      name: '',
      prompt: '',
      description: '',
      isActive: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditPrompt = (prompt: ChatbotPrompt) => {
    setEditingPrompt(prompt);
    form.reset({
      name: prompt.name,
      prompt: prompt.prompt,
      description: prompt.description || '',
      isActive: prompt.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPrompt(null);
    form.reset();
  };

  const handleSubmit = (data: PromptFormData) => {
    if (editingPrompt) {
      updatePromptMutation.mutate({ id: editingPrompt.id, data });
    } else {
      createPromptMutation.mutate(data);
    }
  };

  const handleDeletePrompt = (id: number) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePromptMutation.mutate(id);
    }
  };

  const handleActivatePrompt = (id: number) => {
    activatePromptMutation.mutate(id);
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const activePrompt = prompts.find(p => p.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Prompt Management" showBackButton={true} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chatbot Prompt Management</h2>
            <p className="text-gray-600">Create and manage prompts for the AI chatbot</p>
          </div>
          <Button onClick={handleCreatePrompt} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Prompt
          </Button>
        </div>

        {activePrompt && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                Active Prompt: {activePrompt.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 text-sm mb-2">{activePrompt.description}</p>
              <div className="bg-white rounded-lg p-3 border">
                <p className="text-sm text-gray-700">{activePrompt.prompt.substring(0, 200)}...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prompts...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {prompts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
                  <p className="text-gray-600 mb-4">Create your first chatbot prompt to get started.</p>
                  <Button onClick={handleCreatePrompt}>Create Prompt</Button>
                </CardContent>
              </Card>
            ) : (
              prompts.map((prompt) => (
                <Card key={prompt.id} className={prompt.isActive ? 'border-green-500' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {prompt.name}
                          {prompt.isActive && <Badge variant="default" className="bg-green-600">Active</Badge>}
                        </CardTitle>
                        {prompt.description && (
                          <p className="text-gray-600 text-sm mt-1">{prompt.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!prompt.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivatePrompt(prompt.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPrompt(prompt)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePrompt(prompt.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{prompt.prompt}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                      <span>Created: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(prompt.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </DialogTitle>
              <DialogDescription>
                {editingPrompt ? 'Update the chatbot prompt details.' : 'Create a new prompt for the AI chatbot.'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Legal Assistant Prompt" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of this prompt's purpose" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="You are a helpful legal assistant chatbot..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Prompt</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Set this as the active prompt for the chatbot
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPromptMutation.isPending || updatePromptMutation.isPending}
                  >
                    {editingPrompt ? 'Update' : 'Create'} Prompt
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}