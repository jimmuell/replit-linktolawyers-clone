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
import { Eye, Edit, Trash2, Plus, Search, Filter, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { REQUEST_STATUS, STATUS_LABELS, getStatusInfo } from '@shared/statusCodes';

interface LegalRequest {
  id: number;
  requestNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  caseType: string;
  caseDescription: string;
  urgencyLevel: string;
  budgetRange: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function RequestManagementPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LegalRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isAttorneyAssignmentModalOpen, setIsAttorneyAssignmentModalOpen] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);
  
  const [editFormData, setEditFormData] = useState<Partial<LegalRequest>>({});
  const [selectedAttorneyIds, setSelectedAttorneyIds] = useState<number[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fetch legal requests
  const { data: requests, isLoading, error } = useQuery<LegalRequest[]>({
    queryKey: ['/api/legal-requests'],
    retry: false,
  });

  // Fetch attorneys by case type for assignment
  const { data: availableAttorneys = [], isLoading: attorneysLoading } = useQuery({
    queryKey: ['/api/attorneys/case-type', selectedRequest?.caseType],
    enabled: !!selectedRequest?.caseType && isAttorneyAssignmentModalOpen,
  });

  // Fetch current assignments for the selected request
  const { data: currentAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/requests', selectedRequest?.id, 'attorneys'],
    enabled: !!selectedRequest?.id && isAttorneyAssignmentModalOpen,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/legal-requests/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-requests'] });
      toast({
        title: "Request deleted",
        description: "The legal request has been successfully deleted.",
      });
      setIsDeleteModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete request",
        description: "An error occurred while deleting the request.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const deletePromises = ids.map(id => 
        apiRequest(`/api/legal-requests/${id}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-requests'] });
      toast({
        title: "Requests deleted",
        description: `${selectedRequestIds.length} legal requests have been successfully deleted.`,
      });
      setIsBulkDeleteModalOpen(false);
      setSelectedRequestIds([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete requests",
        description: "An error occurred while deleting the requests.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<LegalRequest> }) => {
      const response = await apiRequest(`/api/legal-requests/${data.id}`, {
        method: 'PUT',
        body: data.updates,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/legal-requests'] });
      toast({
        title: "Request updated",
        description: "The legal request has been successfully updated.",
      });
      setIsEditModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update request",
        description: "An error occurred while updating the request.",
        variant: "destructive",
      });
    },
  });

  // Attorney assignment mutation
  const assignAttorneysMutation = useMutation({
    mutationFn: async ({ requestId, attorneyIds, notes }: { requestId: number; attorneyIds: number[]; notes?: string }) => {
      const response = await apiRequest(`/api/requests/${requestId}/attorneys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attorneyIds, notes }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests', selectedRequest?.id, 'attorneys'] });
      queryClient.invalidateQueries({ queryKey: ['/api/legal-requests'] });
      setIsAttorneyAssignmentModalOpen(false);
      setSelectedAttorneyIds([]);
      setAssignmentNotes('');
      toast({
        title: 'Success',
        description: 'Attorneys assigned successfully',
      });
    },
    onError: (error) => {
      console.error('Error assigning attorneys:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign attorneys',
        variant: 'destructive',
      });
    },
  });

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

  const filteredRequests = requests?.filter(request => 
    request.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.caseType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleView = (request: LegalRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleEdit = (request: LegalRequest) => {
    setSelectedRequest(request);
    setEditFormData(request);
    setIsEditModalOpen(true);
  };

  const handleDelete = (request: LegalRequest) => {
    setSelectedRequest(request);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequest) {
      updateMutation.mutate({ id: selectedRequest.id, updates: editFormData });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedRequest) {
      deleteMutation.mutate(selectedRequest.id);
    }
  };

  const handleAssignAttorneys = (request: LegalRequest) => {
    setSelectedRequest(request);
    setIsAttorneyAssignmentModalOpen(true);
    setSelectedAttorneyIds([]);
    setAssignmentNotes('');
  };

  const handleAttorneyAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequest && selectedAttorneyIds.length > 0) {
      assignAttorneysMutation.mutate({
        requestId: selectedRequest.id,
        attorneyIds: selectedAttorneyIds,
        notes: assignmentNotes,
      });
    }
  };

  const handleAttorneyToggle = (attorneyId: number) => {
    setSelectedAttorneyIds(prev => 
      prev.includes(attorneyId) 
        ? prev.filter(id => id !== attorneyId)
        : [...prev, attorneyId]
    );
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleBulkDelete = () => {
    if (selectedRequestIds.length > 0) {
      setIsBulkDeleteModalOpen(true);
    }
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedRequestIds.length > 0) {
      bulkDeleteMutation.mutate(selectedRequestIds);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequestIds(filteredRequests.map(request => request.id));
    } else {
      setSelectedRequestIds([]);
    }
  };

  const handleSelectRequest = (requestId: number, checked: boolean) => {
    if (checked) {
      setSelectedRequestIds(prev => [...prev, requestId]);
    } else {
      setSelectedRequestIds(prev => prev.filter(id => id !== requestId));
    }
  };

  const isAllSelected = filteredRequests.length > 0 && selectedRequestIds.length === filteredRequests.length;
  const isIndeterminate = selectedRequestIds.length > 0 && selectedRequestIds.length < filteredRequests.length;

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'moderate':
        return <Badge variant="secondary">Moderate</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{urgency || 'Not specified'}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar title="Request Management" />

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Legal Requests</CardTitle>
                  <CardDescription>
                    Manage and track all legal service requests
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search requests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  {selectedRequestIds.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete {selectedRequestIds.length} Selected
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading requests...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Error loading requests. Please try again.</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No requests found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all requests"
                          />
                        </TableHead>
                        <TableHead>Request #</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Case Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRequestIds.includes(request.id)}
                              onCheckedChange={(checked) => handleSelectRequest(request.id, checked as boolean)}
                              aria-label={`Select request ${request.requestNumber}`}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {request.requestNumber}
                          </TableCell>
                          <TableCell>
                            {request.firstName} {request.lastName}
                          </TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell className="max-w-48">
                            <div className="truncate" title={request.caseType}>
                              {request.caseType}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusInfo(request.status).color === 'green' ? 'default' : 
                                         getStatusInfo(request.status).color === 'yellow' ? 'secondary' : 
                                         getStatusInfo(request.status).color === 'red' ? 'destructive' : 'outline'}>
                              {getStatusInfo(request.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getUrgencyBadge(request.urgencyLevel)}
                          </TableCell>
                          <TableCell>{request.budgetRange || 'Not specified'}</TableCell>
                          <TableCell>
                            {format(new Date(request.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(request)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(request)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(request)}
                                className="text-red-600 hover:text-red-700"
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

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Request Number</Label>
                  <p className="font-mono">{selectedRequest.requestNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date Created</Label>
                  <p>{format(new Date(selectedRequest.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Name</Label>
                  <p>{selectedRequest.firstName} {selectedRequest.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p>{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone</Label>
                  <p>{selectedRequest.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Location</Label>
                  <p>{selectedRequest.location || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Urgency Level</Label>
                  <div className="mt-1">{getUrgencyBadge(selectedRequest.urgencyLevel)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Budget Range</Label>
                  <p>{selectedRequest.budgetRange || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusInfo(selectedRequest.status).color === 'green' ? 'default' : 
                                 getStatusInfo(selectedRequest.status).color === 'yellow' ? 'secondary' : 
                                 getStatusInfo(selectedRequest.status).color === 'red' ? 'destructive' : 'outline'}>
                      {getStatusInfo(selectedRequest.status).label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Case Type</Label>
                <p className="mt-1">{selectedRequest.caseType}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Case Description</Label>
                <p className="mt-1 text-sm text-gray-700 leading-relaxed">{selectedRequest.caseDescription}</p>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => handleAssignAttorneys(selectedRequest)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign Attorneys
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName || ''}
                    onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName || ''}
                    onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editFormData.phoneNumber || ''}
                    onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editFormData.location || ''}
                    onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Input
                    id="budgetRange"
                    value={editFormData.budgetRange || ''}
                    onChange={(e) => setEditFormData({...editFormData, budgetRange: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editFormData.status || REQUEST_STATUS.UNDER_REVIEW} onValueChange={(value) => setEditFormData({...editFormData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="caseType">Case Type</Label>
                <Input
                  id="caseType"
                  value={editFormData.caseType || ''}
                  onChange={(e) => setEditFormData({...editFormData, caseType: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="caseDescription">Case Description</Label>
                <Textarea
                  id="caseDescription"
                  value={editFormData.caseDescription || ''}
                  onChange={(e) => setEditFormData({...editFormData, caseDescription: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update Request'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this request? This action cannot be undone.</p>
            {selectedRequest && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                <p className="text-sm text-gray-600">{selectedRequest.requestNumber}</p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Multiple Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete {selectedRequestIds.length} selected requests? This action cannot be undone.</p>
            <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
              <p className="font-medium mb-2">Selected requests:</p>
              <div className="space-y-1">
                {filteredRequests
                  .filter(request => selectedRequestIds.includes(request.id))
                  .map(request => (
                    <div key={request.id} className="text-sm">
                      <span className="font-mono text-xs">{request.requestNumber}</span> - {request.firstName} {request.lastName}
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBulkDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBulkDeleteConfirm}
                disabled={bulkDeleteMutation.isPending}
              >
                {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${selectedRequestIds.length} Requests`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attorney Assignment Modal */}
      <Dialog open={isAttorneyAssignmentModalOpen} onOpenChange={setIsAttorneyAssignmentModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assign Attorneys to Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Request Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Request:</span> {selectedRequest.requestNumber}
                  </div>
                  <div>
                    <span className="font-medium">Client:</span> {selectedRequest.firstName} {selectedRequest.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Case Type:</span> {selectedRequest.caseType}
                  </div>
                  <div>
                    <span className="font-medium">Budget:</span> {selectedRequest.budgetRange || 'Not specified'}
                  </div>
                </div>
              </div>

              {attorneysLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading attorneys...</p>
                </div>
              ) : availableAttorneys.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No attorneys available for this case type</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please ensure attorneys have fee schedules set up for "{selectedRequest.caseType}"
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-medium mb-3">Available Attorneys ({availableAttorneys.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableAttorneys.map((attorney: any) => (
                        <div key={attorney.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`attorney-${attorney.id}`}
                                checked={selectedAttorneyIds.includes(attorney.id)}
                                onCheckedChange={() => handleAttorneyToggle(attorney.id)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">{attorney.firstName} {attorney.lastName}</h4>
                                  {attorney.isVerified && (
                                    <Badge variant="outline" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{attorney.email}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span>📍 {attorney.licenseState}</span>
                                  <span>⚖️ {attorney.yearsOfExperience} years</span>
                                  {attorney.firmName && <span>🏢 {attorney.firmName}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {attorney.fee ? (
                                <div>
                                  <p className="font-medium text-green-600">
                                    {formatCurrency(attorney.fee)}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {attorney.feeType} fee
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">No fee set</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleAttorneyAssignmentSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="assignmentNotes">Assignment Notes (Optional)</Label>
                      <Textarea
                        id="assignmentNotes"
                        placeholder="Add any specific instructions or notes for the assigned attorneys..."
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        {selectedAttorneyIds.length} attorney{selectedAttorneyIds.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAttorneyAssignmentModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={selectedAttorneyIds.length === 0 || assignAttorneysMutation.isPending}
                        >
                          {assignAttorneysMutation.isPending ? 'Assigning...' : 'Assign Attorneys'}
                        </Button>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}