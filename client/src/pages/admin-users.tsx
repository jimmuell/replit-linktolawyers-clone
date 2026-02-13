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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Pencil, Trash2, KeyRound, X, Search, ShieldCheck, Scale, User } from 'lucide-react';

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

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', icon: ShieldCheck, color: 'bg-blue-100 text-blue-800' },
  { value: 'attorney', label: 'Attorney', icon: Scale, color: 'bg-purple-100 text-purple-800' },
  { value: 'client', label: 'Client', icon: User, color: 'bg-gray-100 text-gray-700' },
];

const getRoleBadge = (role: string) => {
  const config = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[2];
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} hover:${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />{config.label}
    </Badge>
  );
};

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchQuery === '' ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const attorneyCount = users.filter(u => u.role === 'attorney').length;
  const clientCount = users.filter(u => u.role === 'client').length;

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
      role: user.role,
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
        body: formData,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'User created successfully' });
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
          role: formData.role,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'User updated successfully' });
      closeModal();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update user', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: { role: newRole },
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      const roleLabel = ROLE_OPTIONS.find(r => r.value === newRole)?.label || newRole;
      toast({ title: 'Role Updated', description: `User role changed to ${roleLabel}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update role', variant: 'destructive' });
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
      toast({ title: 'Success', description: 'User deleted successfully' });
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete user', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 w-32">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/admin-dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <div className="w-32" />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Manage administrators and user credentials. Assign or change roles for any user.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Admins</span>
          </div>
          <div className="text-xl font-bold text-blue-900">{adminCount}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Scale className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Attorneys</span>
          </div>
          <div className="text-xl font-bold text-purple-900">{attorneyCount}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <User className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Clients</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{clientCount}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="attorney">Attorney</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openCreateModal} className="bg-black hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-1" /> Add User
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load users. Please try again.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
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
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                      >
                        <SelectTrigger className="w-[140px] h-8 border-none shadow-none p-0 focus:ring-0">
                          <div>{getRoleBadge(user.role)}</div>
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            return (
                              <SelectItem key={opt.value} value={opt.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3.5 h-3.5" />
                                  {opt.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(user)} title="Edit user">
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
                          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(user.id)} title="Delete user">
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
                {modalMode === 'create' && 'Create User'}
                {modalMode === 'edit' && 'Edit User'}
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
                  <div>
                    <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                    <Select value={formData.role} onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map(opt => {
                          const Icon = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={modalMode === 'create' ? handleCreateUser : handleUpdateUser}
                    disabled={isSubmitting}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create User' : 'Save Changes'}
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
