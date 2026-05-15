// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  Heart, 
  MoreVertical,
  Eye,
  Trash2,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
  orderCount: number;
  wishlistCount: number;
  orders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}&search=${search}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their orders and wishlist.')) {
      return;
    }
    
    setDeleting(userId);
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchUsers();
        if (selectedUser?.id === userId) {
          setShowUserModal(false);
          setSelectedUser(null);
        }
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-red-900 mb-2">Users Management</h1>
              <p className="text-red-800">Manage your registered customers</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-amber-100">
              <div className="flex items-center gap-2 text-red-900">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{pagination.total} Total Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-amber-50/50 border-b border-amber-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-serif font-semibold text-red-900">User</th>
                      <th className="text-left py-4 px-6 font-serif font-semibold text-red-900">Email</th>
                      <th className="text-left py-4 px-6 font-serif font-semibold text-red-900">Joined</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Orders</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Wishlist</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Role</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-amber-100 hover:bg-amber-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-white font-bold">
                              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-red-900">{user.name || 'No name'}</p>
                              <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-red-800">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1 text-amber-700">
                            <ShoppingBag className="h-4 w-4" />
                            <span className="font-semibold">{user.orderCount}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1 text-rose-500">
                            <Heart className="h-4 w-4" />
                            <span className="font-semibold">{user.wishlistCount}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {user.isAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              Customer
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-amber-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleting === user.id}
                              className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete User"
                            >
                              {deleting === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-amber-100">
                <div className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="border-amber-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="border-amber-200"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-amber-100 p-4 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-red-900">User Details</h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-serif font-bold text-red-900">{selectedUser.name || 'No name'}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      Joined: {formatDate(selectedUser.createdAt)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${selectedUser.isAdmin ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedUser.isAdmin ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                      {selectedUser.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <ShoppingBag className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">{selectedUser.orderCount}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-rose-50 rounded-lg p-4 text-center">
                  <Heart className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">{selectedUser.wishlistCount}</div>
                  <div className="text-sm text-gray-600">Wishlist Items</div>
                </div>
              </div>

              {/* Recent Orders */}
              {selectedUser.orders.length > 0 && (
                <div>
                  <h4 className="font-serif font-semibold text-red-900 mb-3">Recent Orders</h4>
                  <div className="space-y-2">
                    {selectedUser.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-red-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-700">€{order.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}