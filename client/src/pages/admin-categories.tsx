import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tags, Plus, Pencil, Trash2, GitBranch, Link, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CaseType, Flow } from '@shared/schema';

interface CaseTypeFormData {
  value: string;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  category: string;
  applicantType: string;
  displayOrder: number;
  isActive: boolean;
  flowId: number | null;
}

const defaultFormData: CaseTypeFormData = {
  value: '',
  label: '',
  labelEs: '',
  description: '',
  descriptionEs: '',
  category: '',
  applicantType: 'both',
  displayOrder: 0,
  isActive: true,
  flowId: null,
};

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CaseTypeFormData>(defaultFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caseTypes = [], isLoading: caseTypesLoading } = useQuery<CaseType[]>({
    queryKey: ['/api/admin/case-types'],
  });

  const { data: flows = [], isLoading: flowsLoading } = useQuery<Flow[]>({
    queryKey: ['/api/flows/active'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CaseTypeFormData) => {
      return await apiRequest('/api/admin/case-types', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/case-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/case-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flows'] });
      toast({ title: 'Category created', description: 'The new category has been added.' });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CaseTypeFormData> }) => {
      return await apiRequest(`/api/admin/case-types/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/case-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/case-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flows'] });
      toast({ title: 'Category updated', description: 'The category has been updated.' });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/case-types/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/case-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/case-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flows'] });
      toast({ title: 'Category deleted', description: 'The category has been removed.' });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (caseType: CaseType) => {
    setFormData({
      value: caseType.value,
      label: caseType.label,
      labelEs: caseType.labelEs || '',
      description: caseType.description,
      descriptionEs: caseType.descriptionEs || '',
      category: caseType.category || '',
      applicantType: caseType.applicantType || 'both',
      displayOrder: caseType.displayOrder || 0,
      isActive: caseType.isActive ?? true,
      flowId: caseType.flowId || null,
    });
    setEditingId(caseType.id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getFlowName = (flowId: number | null) => {
    if (!flowId) return null;
    const flow = flows.find(f => f.id === flowId);
    return flow?.name || 'Unknown Flow';
  };

  const uniqueCategories = Array.from(new Set(caseTypes.map(ct => ct.category).filter(Boolean)));

  const isLoading = caseTypesLoading || flowsLoading;

  return (
    <AdminLayout title="Categories Management">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Categories Management</h2>
          <p className="text-gray-600">Manage case types and assign intake flows to each category.</p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : caseTypes.length === 0 ? (
        <div className="text-center py-12">
          <Tags className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">Create your first category to get started.</p>
          <Button onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              All Categories
            </CardTitle>
            <CardDescription>
              {caseTypes.length} total categories, {caseTypes.filter(ct => ct.flowId).length} with flows assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Flow</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseTypes.map((caseType) => (
                  <TableRow key={caseType.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{caseType.label}</div>
                        <div className="text-sm text-gray-500">{caseType.value}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {caseType.category ? (
                        <Badge variant="outline">{caseType.category}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        caseType.applicantType === 'beneficiary' 
                          ? 'bg-blue-100 text-blue-800'
                          : caseType.applicantType === 'petitioner'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                      }>
                        {caseType.applicantType === 'beneficiary' 
                          ? 'Beneficiary' 
                          : caseType.applicantType === 'petitioner'
                            ? 'Petitioner'
                            : 'Both'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {caseType.flowId ? (
                        <Badge className="bg-cyan-100 text-cyan-800">
                          <GitBranch className="h-3 w-3 mr-1" />
                          {getFlowName(caseType.flowId)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          No flow
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {caseType.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{caseType.displayOrder}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(caseType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteConfirm({ id: caseType.id, label: caseType.label })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the category details and flow assignment.' : 'Create a new category for legal services.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label (English)</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Asylum Application"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="labelEs">Label (Spanish)</Label>
                <Input
                  id="labelEs"
                  value={formData.labelEs}
                  onChange={(e) => setFormData({ ...formData, labelEs: e.target.value })}
                  placeholder="e.g., Solicitud de Asilo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value (URL-safe identifier)</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g., asylum-application"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this case type..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descriptionEs">Description (Spanish)</Label>
                <Textarea
                  id="descriptionEs"
                  value={formData.descriptionEs}
                  onChange={(e) => setFormData({ ...formData, descriptionEs: e.target.value })}
                  placeholder="Breve descripción de este tipo de caso..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category Group</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category group" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCategories.map((cat) => (
                      <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                    ))}
                    <SelectItem value="Family-Based">Family-Based</SelectItem>
                    <SelectItem value="Humanitarian">Humanitarian</SelectItem>
                    <SelectItem value="Employment">Employment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantType">Applicant Type</Label>
                <Select
                  value={formData.applicantType}
                  onValueChange={(value) => setFormData({ ...formData, applicantType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both (Beneficiary & Petitioner)</SelectItem>
                    <SelectItem value="beneficiary">Beneficiary Only</SelectItem>
                    <SelectItem value="petitioner">Petitioner Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <Label htmlFor="flowId" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-cyan-600" />
                Assigned Intake Flow
              </Label>
              <Select
                value={formData.flowId?.toString() || 'none'}
                onValueChange={(value) => setFormData({ ...formData, flowId: value === 'none' ? null : parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a flow for this category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No flow assigned</SelectItem>
                  {flows.map((flow) => (
                    <SelectItem key={flow.id} value={flow.id.toString()}>
                      {flow.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-cyan-700 mt-1">
                This flow will be used for intake when users select this category.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active (visible to users)</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.label}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
