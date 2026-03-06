// app/orders/page.tsx - UPDATED WITH USER ID HANDLING
'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ArchiveBoxIcon,
  HomeIcon,
  ClockIcon,
  ShoppingBagIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CreditCardIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  total: number;
  productId?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  status: string;
  trackingStatus?: string;
  paymentStatus: string;
  createdAt: string;
  paidAt?: string;
  preparingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const getUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          return userData;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
      return null;
    };

    const userData = getUser();
    if (userData) {
      fetchOrders(userData);
    } else {
      setError('Please login to view your orders');
      setLoading(false);
    }
  }, []);

  const fetchOrders = async (userData: any) => {
    console.log('Fetching orders for user:', userData?.id);
    
    try {
      setLoading(true);
      setError(null);
      
      if (!userData || !userData.id) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }
      
      // Send user ID in custom header
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Try using x-user-id header
      headers['x-user-id'] = userData.id;
      
      console.log('Making request to /api/orders with headers:', headers);
      
      const response = await fetch('/api/orders', {
        headers: headers,
        credentials: 'include', // Include cookies
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
        return;
      }
      
      if (response.status === 404) {
        // Try alternative API endpoint
        console.log('Trying alternative API endpoint...');
        const altResponse = await fetch(`/api/orders/user/${userData.id}`, {
          headers: { 'Accept': 'application/json' },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          handleOrdersResponse(altData);
          return;
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to load orders (${response.status})`);
      }
      
      const data = await response.json();
      handleOrdersResponse(data);
      
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrdersResponse = (data: any) => {
    console.log('Orders data received:', data);
    
    if (data.success && data.orders) {
      // Transform order items to include product images from database
      const transformedOrders = data.orders.map((order: any) => ({
        ...order,
        items: order.items.map((item: any) => ({
          ...item,
          // If item.image is empty, we'll try to get it from the product
          image: item.image || '/placeholder-image.jpg'
        }))
      }));
      
      setOrders(transformedOrders);
      console.log(`Set ${transformedOrders.length} orders`);
    } else {
      setOrders([]);
      setError(data.error || 'No orders found');
    }
  };

  const handleRetry = () => {
    if (user) {
      fetchOrders(user);
    } else {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          fetchOrders(userData);
        } catch (error) {
          console.error('Error parsing user:', error);
          setError('Please login again');
          router.push('/login');
        }
      } else {
        setError('Please login to view orders');
        router.push('/login');
      }
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': 
      case 'preparing': return 'bg-amber-100 text-amber-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate order progress
  const getOrderProgress = (order: Order) => {
    if (order.deliveredAt) return 100;
    if (order.shippedAt) return 66;
    if (order.preparingAt || order.status === 'PROCESSING') return 33;
    return 0;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    return user.name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Loading orders for {user.name || user.email}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <ExclamationTriangleIcon className="h-20 w-20 text-amber-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Orders</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            
            {/* Show user info if available */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {getUserInitials()}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Try Again
              </button>
              
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  Login to View Orders
                </Link>
              )}
              
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <ShoppingBagIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
            <p className="text-gray-600 mb-8">
              {user 
                ? `Hi ${user.name || 'there'}, you haven't placed any orders yet. Start shopping to see your order history here.`
                : 'Start shopping to see your order history here.'}
            </p>
            
            {/* User info card */}
            {user && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {getUserInitials()}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-1">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Start Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <HomeIcon className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* User Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {getUserInitials()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-950">My Orders</h1>
                  <p className="text-gray-600">{user?.name || user?.email}</p>
                  <p className="text-sm text-gray-500">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} • 
                    Total spent: €{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 text-sm text-blue-800 hover:text-blue-600"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Refresh
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-red-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  Shop More
                </Link>
              </div>
            </div>
          </div>
          
          {/* Orders Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-2xl font-bold text-green-600">
                €{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Total Spent</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-2xl font-bold text-amber-600">
                {orders.filter(order => !['DELIVERED', 'CANCELLED'].includes(order.status.toUpperCase())).length}
              </div>
              <div className="text-gray-600">Active Orders</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <div className="text-2xl font-bold text-purple-600">
                {orders.filter(order => order.status.toUpperCase() === 'DELIVERED').length}
              </div>
              <div className="text-gray-600">Delivered</div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-lg">Order #{order.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {order.paymentStatus || 'Paid'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Ordered on {formatDate(order.createdAt)}
                    </p>
                    {order.paidAt && (
                      <p className="text-gray-600 text-sm">
                        Paid on {formatDate(order.paidAt)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-amber-900">
                      €{order.total.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                  </div>
                </div>
              </div>

              {/* Order Progress */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Order Progress</h4>
                  <div className="flex items-center gap-2 text-blue-600">
                    <ClockIcon className="h-5 w-5" />
                    <span className="font-medium">
                      {order.deliveredAt ? 'Delivered' : 
                       order.shippedAt ? 'Shipped' : 
                       order.preparingAt ? 'Preparing' : 'Order Received'}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute top-3 left-0 right-0 h-2 bg-gray-200 rounded-full"></div>
                  <div 
                    className="absolute top-3 left-0 h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${getOrderProgress(order)}%` }}
                  ></div>
                  
                  <div className="relative flex justify-between mt-8">
                    {['Ordered', 'Preparing', 'Shipped', 'Delivered'].map((step, index) => {
                      const isCompleted = getOrderProgress(order) >= (index * 33);
                      const isCurrent = getOrderProgress(order) >= (index * 33) && getOrderProgress(order) < ((index + 1) * 33);
                      
                      return (
                        <div key={step} className="flex flex-col items-center w-20">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : isCurrent
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? (
                              <CheckCircleIcon className="h-5 w-5" />
                            ) : step === 'Ordered' ? (
                              <CreditCardIcon className="h-4 w-4" />
                            ) : step === 'Preparing' ? (
                              <ArchiveBoxIcon className="h-4 w-4" />
                            ) : step === 'Shipped' ? (
                              <TruckIcon className="h-4 w-4" />
                            ) : (
                              <CheckCircleIcon className="h-4 w-4" />
                            )}
                          </div>
                          <span className={`text-xs font-medium text-center ${
                            isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Order Items ({order.items.length})</h4>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {/* Image with Next.js Image component */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          {item.image && item.image !== '/placeholder-image.jpg' ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                              onError={(e) => {
                                // Fallback to placeholder on error
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <ArchiveBoxIcon class="h-8 w-8 text-gray-400" />
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ArchiveBoxIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {(item.color || item.size) && (
                            <div className="text-sm text-gray-600">
                              {item.color && <span className="capitalize">{item.color}</span>}
                              {item.size && <span className="ml-2 uppercase">Size: {item.size}</span>}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            €{item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          €{item.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="px-6 pb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>€{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span>€{order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span>€{order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-blue-600">€{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  {order.status === 'SHIPPED' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <TruckIcon className="h-5 w-5" />
                      Track Package
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    View Invoice
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Get Help
                  </button>
                  {order.status === 'DELIVERED' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Buy Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}