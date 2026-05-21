// app/admin/orders/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle,
  Package,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Mail,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: string;
  trackingStatus: string | null;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
  itemsCount: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
    size?: string;
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

// ✅ FIXED: Changed JSX.Element to React.ReactNode
const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  PAID: <CheckCircle className="h-4 w-4" />,
  PROCESSING: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  REFUNDED: <XCircle className="h-4 w-4" />,
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter, search]);

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      if (response.ok) {
        await fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
          setShowOrderModal(false);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-red-900 mb-2">Orders Management</h1>
              <p className="text-red-800">View and manage all customer orders</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-amber-100">
              <div className="flex items-center gap-2 text-red-900">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-semibold">{pagination.total} Total Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name or email..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white/50"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-amber-200 rounded-lg bg-white/50 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button
                onClick={() => fetchOrders()}
                variant="outline"
                className="border-amber-200 text-red-900 hover:bg-amber-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-amber-50/50 border-b border-amber-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-serif font-semibold text-red-900">Order #</th>
                      <th className="text-left py-4 px-6 font-serif font-semibold text-red-900">Customer</th>
                      <th className="text-left py-4 px-6 font-serif font-semibold text-red-900">Date</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Items</th>
                      <th className="text-right py-4 px-6 font-serif font-semibold text-red-900">Total</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Status</th>
                      <th className="text-center py-4 px-6 font-serif font-semibold text-red-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="border-b border-amber-100 hover:bg-amber-50/30 transition-colors cursor-pointer" 
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                      >
                        <td className="py-4 px-6 font-mono text-sm">{order.orderNumber}</td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-red-900">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-6 text-center">{order.itemsCount}</td>
                        <td className="py-4 px-6 text-right font-semibold text-amber-700">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_ICONS[order.status]}
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            <Eye className="h-4 w-4 text-amber-600" />
                          </button>
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
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="border-amber-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
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

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-amber-100 p-4 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-red-900">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${STATUS_COLORS[selectedOrder.status]}`}>
                    {STATUS_ICONS[selectedOrder.status]}
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="px-3 py-2 border border-amber-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {updatingStatus && <Loader2 className="h-5 w-5 animate-spin text-amber-600" />}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-900 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Customer Information</span>
                  </div>
                  <p className="font-medium">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-900 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Order Timeline</span>
                  </div>
                  <p className="text-sm">Placed: {formatDate(selectedOrder.createdAt)}</p>
                  {selectedOrder.paidAt && <p className="text-sm">Paid: {formatDate(selectedOrder.paidAt)}</p>}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-serif font-semibold text-red-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-amber-100 rounded-lg">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-red-900">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.color && <span className="capitalize">{item.color}</span>}
                          {item.size && <span className="ml-2 uppercase">Size: {item.size}</span>}
                        </p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-700">{formatCurrency(item.price)}</p>
                        <p className="text-sm text-gray-500">each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-amber-100 pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatCurrency(selectedOrder.shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (23%):</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif font-bold pt-2 border-t border-amber-100">
                    <span>Total:</span>
                    <span className="text-amber-700">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}