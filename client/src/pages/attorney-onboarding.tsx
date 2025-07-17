import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNavbar from '@/components/AdminNavbar';
import { Eye, Edit, Trash2, Plus, Search, Filter, UserPlus, CheckCircle, XCircle } from 'lucide-react';
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
  phoneNumber: string;
  barNumber: string;
  licenseState: string;
  practiceAreas: string[];
  yearsOfExperience: number;
  hourlyRate: number;
  firmName: string;
  firmAddress: string;
  bio: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const PRACTICE_AREAS = [
  'Immigration Law', 'Family Law', 'Criminal Law', 'Personal Injury', 'Corporate Law',
  'Real Estate Law', 'Employment Law', 'Tax Law', 'Estate Planning', 'Intellectual Property',
  'Bankruptcy Law', 'Environmental Law', 'Healthcare Law', 'Securities Law', 'Labor Law'
];

export default function AttorneyOnboarding() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    barNumber: '',
    licenseState: '',
    practiceAreas: [] as string[],
    yearsOfExperience: 0,
    hourlyRate: 0,
    firmName: '',
    firmAddress: '',
    bio: '',
    isActive: true,
    isVerified: false,
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  const { data: attorneys = [], isLoading, error } = useQuery({
    queryKey: ['/api/attorneys'],
    enabled: user?.role === 'admin',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/attorneys', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorneys'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Attorney created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create attorney',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/attorneys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorneys'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Attorney updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update attorney',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/attorneys/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attorneys'] });
      setIsDeleteModalOpen(false);
      setSelectedAttorney(null);
      toast({
        title: 'Success',
        description: 'Attorney deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete attorney',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      barNumber: '',
      licenseState: '',
      practiceAreas: [],
      yearsOfExperience: 0,
      hourlyRate: 0,
      firmName: '',
      firmAddress: '',
      bio: '',
      isActive: true,
      isVerified: false,
    });
  };

  const handleView = (attorney: Attorney) => {
    setSelectedAttorney(attorney);
    setIsViewModalOpen(true);
  };

  const handleEdit = (attorney: Attorney) => {
    setSelectedAttorney(attorney);
    setFormData({
      firstName: attorney.firstName,
      lastName: attorney.lastName,
      email: attorney.email,
      phoneNumber: attorney.phoneNumber || '',
      barNumber: attorney.barNumber || '',
      licenseState: attorney.licenseState || '',
      practiceAreas: attorney.practiceAreas || [],
      yearsOfExperience: attorney.yearsOfExperience || 0,
      hourlyRate: attorney.hourlyRate || 0,
      firmName: attorney.firmName || '',
      firmAddress: attorney.firmAddress || '',
      bio: attorney.bio || '',
      isActive: attorney.isActive,
      isVerified: attorney.isVerified,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (attorney: Attorney) => {
    setSelectedAttorney(attorney);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAttorney) {
      updateMutation.mutate({ id: selectedAttorney.id, data: formData });
    }
  };

  const handlePracticeAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        practiceAreas: [...formData.practiceAreas, area]
      });
    } else {
      setFormData({
        ...formData,
        practiceAreas: formData.practiceAreas.filter(a => a !== area)
      });
    }
  };

  const filteredAttorneys = attorneys.filter((attorney: Attorney) => {
    const matchesSearch = 
      attorney.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attorney.firmName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = !filterState || attorney.licenseState === filterState;
    const matchesVerified = !filterVerified || 
      (filterVerified === 'verified' && attorney.isVerified) ||
      (filterVerified === 'unverified' && !attorney.isVerified);
    
    return matchesSearch && matchesState && matchesVerified;
  });

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Attorney Onboarding" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Attorney Management
                  </CardTitle>
                  <CardDescription>
                    Manage attorney profiles and onboarding
                  </CardDescription>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Attorney
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search attorneys..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterVerified} onValueChange={setFilterVerified}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading attorneys...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading attorneys. Please try again.</p>
                </div>
              ) : filteredAttorneys.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No attorneys found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Firm</TableHead>
                        <TableHead>License State</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttorneys.map((attorney: Attorney) => (
                        <TableRow key={attorney.id}>
                          <TableCell>
                            {attorney.firstName} {attorney.lastName}
                          </TableCell>
                          <TableCell>{attorney.email}</TableCell>
                          <TableCell>{attorney.firmName || 'N/A'}</TableCell>
                          <TableCell>{attorney.licenseState || 'N/A'}</TableCell>
                          <TableCell>{attorney.yearsOfExperience || 0} years</TableCell>
                          <TableCell>
                            <Badge variant={attorney.isActive ? 'default' : 'secondary'}>
                              {attorney.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {attorney.isVerified ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(attorney)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(attorney)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(attorney)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateModalOpen ? 'Add New Attorney' : 'Edit Attorney'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="barNumber">Bar Number</Label>
                <Input
                  id="barNumber"
                  value={formData.barNumber}
                  onChange={(e) => setFormData({...formData, barNumber: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="licenseState">License State</Label>
                <Select value={formData.licenseState} onValueChange={(value) => setFormData({...formData, licenseState: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="firmName">Firm Name</Label>
                <Input
                  id="firmName"
                  value={formData.firmName}
                  onChange={(e) => setFormData({...formData, firmName: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="firmAddress">Firm Address</Label>
              <Textarea
                id="firmAddress"
                value={formData.firmAddress}
                onChange={(e) => setFormData({...formData, firmAddress: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label>Practice Areas</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {PRACTICE_AREAS.map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.practiceAreas.includes(area)}
                      onCheckedChange={(checked) => handlePracticeAreaChange(area, checked as boolean)}
                    />
                    <Label htmlFor={area} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                placeholder="Attorney biography and background..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked as boolean})}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData({...formData, isVerified: checked as boolean})}
                />
                <Label htmlFor="isVerified">Verified</Label>
              </div>
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
                 isCreateModalOpen ? 'Create Attorney' : 'Update Attorney'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attorney Details</DialogTitle>
          </DialogHeader>
          {selectedAttorney && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p>{selectedAttorney.firstName} {selectedAttorney.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p>{selectedAttorney.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p>{selectedAttorney.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bar Number</Label>
                  <p>{selectedAttorney.barNumber || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">License State</Label>
                  <p>{selectedAttorney.licenseState || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Years of Experience</Label>
                  <p>{selectedAttorney.yearsOfExperience || 0} years</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Hourly Rate</Label>
                  <p>${selectedAttorney.hourlyRate || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Firm Name</Label>
                  <p>{selectedAttorney.firmName || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedAttorney.isActive ? 'default' : 'secondary'}>
                      {selectedAttorney.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {selectedAttorney.isVerified ? (
                      <Badge variant="default">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p>{format(new Date(selectedAttorney.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Firm Address</Label>
                <p className="mt-1">{selectedAttorney.firmAddress || 'Not provided'}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Practice Areas</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedAttorney.practiceAreas?.length > 0 ? (
                    selectedAttorney.practiceAreas.map((area: string) => (
                      <Badge key={area} variant="outline">{area}</Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">No practice areas specified</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-600">Biography</Label>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                  {selectedAttorney.bio || 'No biography provided'}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Attorney</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this attorney? This action cannot be undone.</p>
          {selectedAttorney && (
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <p className="font-medium">{selectedAttorney.firstName} {selectedAttorney.lastName}</p>
              <p className="text-sm text-gray-600">{selectedAttorney.email}</p>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedAttorney && deleteMutation.mutate(selectedAttorney.id)}
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