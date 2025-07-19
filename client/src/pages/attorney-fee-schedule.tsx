import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNavbar from '@/components/AdminNavbar';
import { DollarSign, Edit, Trash2, Plus, Search, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Attorney {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
}

interface CaseType {
  id: number;
  value: string;
  label: string;
  description: string;
  isActive: boolean;
}

interface AttorneyFeeSchedule {
  id: number;
  attorneyId: number;
  caseTypeId: number;
  fee: number;
  feeType: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeeScheduleWithDetails extends AttorneyFeeSchedule {
  attorney?: Attorney;
  caseType?: CaseType;
}

const FEE_TYPES = [
  { value: 'flat', label: 'Flat Fee' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'consultation', label: 'Consultation Fee' },
];

export default function AttorneyFeeSchedule() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAttorney, setFilterAttorney] = useState('all');
  const [filterCaseType, setFilterCaseType] = useState('all');
  const [selectedFeeSchedule, setSelectedFeeSchedule] = useState<FeeScheduleWithDetails | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    attorneyId: 0,
    caseTypeId: 0,
    fee: 0,
    feeType: 'flat',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  const { data: attorneys = [], isLoading: attorneysLoading } = useQuery({
    queryKey: ['/api/attorneys'],
    enabled: user?.role === 'admin',
  });

  const { data: caseTypesResponse, isLoading: caseTypesLoading } = useQuery({
    queryKey: ['/api/case-types'],
    enabled: user?.role === 'admin',
  });

  const caseTypes = caseTypesResponse?.data || [];

  const { data: feeSchedules = [], isLoading: feeSchedulesLoading } = useQuery({
    queryKey: ['/api/attorney-fee-schedule'],
    enabled: user?.role === 'admin',
  });

  // Enhanced fee schedules with attorney and case type details
  const enhancedFeeSchedules = feeSchedules.map((schedule: AttorneyFeeSchedule) => ({
    ...schedule,
    attorney: attorneys.find((a: Attorney) => a.id === schedule.attorneyId),
    caseType: caseTypes.find((ct: CaseType) => ct.id === schedule.caseTypeId),
  }));

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/attorney-fee-schedule', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-fee-schedule'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Fee schedule created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create fee schedule',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/attorney-fee-schedule/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-fee-schedule'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Fee schedule updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update fee schedule',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/attorney-fee-schedule/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorney-fee-schedule'] });
      setIsDeleteModalOpen(false);
      setSelectedFeeSchedule(null);
      toast({
        title: 'Success',
        description: 'Fee schedule deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete fee schedule',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      attorneyId: 0,
      caseTypeId: 0,
      fee: 0,
      feeType: 'flat',
      notes: '',
      isActive: true,
    });
  };

  const handleEdit = (feeSchedule: FeeScheduleWithDetails) => {
    setSelectedFeeSchedule(feeSchedule);
    setFormData({
      attorneyId: feeSchedule.attorneyId,
      caseTypeId: feeSchedule.caseTypeId,
      fee: feeSchedule.fee,
      feeType: feeSchedule.feeType,
      notes: feeSchedule.notes || '',
      isActive: feeSchedule.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (feeSchedule: FeeScheduleWithDetails) => {
    setSelectedFeeSchedule(feeSchedule);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      fee: Math.round(formData.fee * 100), // Convert to cents
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFeeSchedule) {
      updateMutation.mutate({
        id: selectedFeeSchedule.id,
        data: {
          ...formData,
          fee: Math.round(formData.fee * 100), // Convert to cents
        },
      });
    }
  };

  const filteredFeeSchedules = enhancedFeeSchedules.filter((schedule: FeeScheduleWithDetails) => {
    const matchesSearch = 
      schedule.attorney?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.attorney?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.caseType?.label.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAttorney = filterAttorney === 'all' || schedule.attorneyId === parseInt(filterAttorney);
    const matchesCaseType = filterCaseType === 'all' || schedule.caseTypeId === parseInt(filterCaseType);
    
    return matchesSearch && matchesAttorney && matchesCaseType;
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getFeeTypeLabel = (feeType: string) => {
    const type = FEE_TYPES.find(t => t.value === feeType);
    return type ? type.label : feeType;
  };

  if (user?.role !== 'admin') {
    return null;
  }

  const isLoading = attorneysLoading || caseTypesLoading || feeSchedulesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Attorney Fee Schedule" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Fee Schedule Management
                  </CardTitle>
                  <CardDescription>
                    Manage attorney fees for different case types
                  </CardDescription>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Fee Schedule
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search attorneys or case types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterAttorney} onValueChange={setFilterAttorney}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by attorney" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Attorneys</SelectItem>
                    {attorneys.map((attorney: Attorney) => (
                      <SelectItem key={attorney.id} value={attorney.id.toString()}>
                        {attorney.firstName} {attorney.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCaseType} onValueChange={setFilterCaseType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by case type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Case Types</SelectItem>
                    {caseTypes.map((caseType: CaseType) => (
                      <SelectItem key={caseType.id} value={caseType.id.toString()}>
                        {caseType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading fee schedules...</p>
                </div>
              ) : filteredFeeSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No fee schedules found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Attorney</TableHead>
                        <TableHead>Case Type</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeeSchedules.map((schedule: FeeScheduleWithDetails) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {schedule.attorney?.firstName} {schedule.attorney?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {schedule.attorney?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium">{schedule.caseType?.label}</div>
                              <div className="text-sm text-gray-500 truncate">
                                {schedule.caseType?.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(schedule.fee)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getFeeTypeLabel(schedule.feeType)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                              {schedule.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(schedule.updatedAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(schedule)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(schedule)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Add Fee Schedule' : 'Edit Fee Schedule'}
            </DialogTitle>
            <DialogDescription>
              Configure attorney fees for specific case types
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attorney">Attorney *</Label>
                <Select value={formData.attorneyId.toString()} onValueChange={(value) => setFormData({...formData, attorneyId: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select attorney" />
                  </SelectTrigger>
                  <SelectContent>
                    {attorneys.map((attorney: Attorney) => (
                      <SelectItem key={attorney.id} value={attorney.id.toString()}>
                        {attorney.firstName} {attorney.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="caseType">Case Type *</Label>
                <Select value={formData.caseTypeId.toString()} onValueChange={(value) => setFormData({...formData, caseTypeId: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select case type" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypes.map((caseType: CaseType) => (
                      <SelectItem key={caseType.id} value={caseType.id.toString()}>
                        {caseType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fee">Fee Amount ($) *</Label>
                <Input
                  id="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.fee}
                  onChange={(e) => setFormData({...formData, fee: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="feeType">Fee Type *</Label>
                <Select value={formData.feeType} onValueChange={(value) => setFormData({...formData, feeType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Optional notes about this fee schedule..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 
                 isCreateModalOpen ? 'Create Fee Schedule' : 'Update Fee Schedule'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fee Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fee schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedFeeSchedule && (
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p className="font-medium">
                {selectedFeeSchedule.attorney?.firstName} {selectedFeeSchedule.attorney?.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {selectedFeeSchedule.caseType?.label} - {formatCurrency(selectedFeeSchedule.fee)}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedFeeSchedule && deleteMutation.mutate(selectedFeeSchedule.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}