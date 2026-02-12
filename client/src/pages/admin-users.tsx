import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2, KeyRound, X, Search, ShieldCheck } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
}

type ModalMode = 'create' | 'edit' | 'password' | null;

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin',
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: users = [], isLoading, isError } = useQuery<UserData[]>({
    queryKey: ['/api/admin/users'],
  });

  const adminUsers = users.filter(u => u.role === 'admin');
  const filteredUsers = adminUsers.filter(u => {
    return searchQuery === '' ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openCreateModal = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'admin' });
    setModalMode('create');
    setSelectedUser(null);
  };

  const openEditModal = (user: UserData) => {
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: 'admin',
    });
    setSelectedUser(user);
    setModalMode('edit');
  };

  const openPasswordModal = (user: UserData) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setModalMode('password');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) {
      toast({ title: 'Error', description: 'Email and password are required', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest('/api/admin/users', {
        method: 'POST',
        body: { ...formData, role: 'admin' },
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'Admin user created successfully' });
      closeModal();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        body: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'admin',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'Admin user updated successfully' });
      closeModal();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/password`, {
        method: 'PATCH',
        body: { newPassword },
      });
      toast({ title: 'Success', description: 'Password changed successfully' });
      closeModal();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'Admin user deleted successfully' });
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete user', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="Admin User Management">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-32">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/admin-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Admin Users</h1>
        <div className="w-32" />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Manage administrator accounts here. Attorney accounts are managed through the Attorney Onboarding page.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openCreateModal} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add Admin
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin users...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load users. Please try again.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No admin users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.firstName || user.lastName
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        <ShieldCheck className="w-3 h-3 mr-1" />Admin
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} title="Edit admin">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openPasswordModal(user)} title="Change password">
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        {deleteConfirmId === user.id ? (
                          <div className="flex items-center gap-1">
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                              Confirm
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(user.id)} title="Delete admin">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {modalMode === 'create' && 'Create Admin User'}
                {modalMode === 'edit' && 'Edit Admin User'}
                {modalMode === 'password' && 'Change Password'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {(modalMode === 'create' || modalMode === 'edit') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  {modalMode === 'create' && (
                    <div>
                      <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="mt-1"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  )}
                  <Button
                    onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser}
                    disabled={isSubmitting}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Admin' : 'Save Changes'}
                  </Button>
                </div>
              )}

              {modalMode === 'password' && selectedUser && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Changing password for <span className="font-medium">{selectedUser.email}</span>
                  </p>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSubmitting}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    {isSubmitting ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
