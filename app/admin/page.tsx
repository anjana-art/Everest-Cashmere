// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // You'll need to create these API endpoints
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <ShoppingBagIcon className="h-10 w-10 text-blue-600 bg-blue-50 p-2 rounded-lg" />
          </div>
          <Link href="/admin/products" className="text-blue-600 text-sm hover:text-blue-800 mt-4 inline-block">
            View all products →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <ChartBarIcon className="h-10 w-10 text-green-600 bg-green-50 p-2 rounded-lg" />
          </div>
          <Link href="/admin/orders" className="text-blue-600 text-sm hover:text-blue-800 mt-4 inline-block">
            View all orders →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-purple-600 bg-purple-50 p-2 rounded-lg" />
          </div>
          <Link href="/admin/users" className="text-blue-600 text-sm hover:text-blue-800 mt-4 inline-block">
            View all users →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-amber-600 bg-amber-50 p-2 rounded-lg" />
          </div>
          <div className="flex items-center mt-4">
            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5% from last month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/products/add"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold">Add New Product</h3>
              <p className="text-sm text-blue-600">Create a new product listing</p>
            </div>
            <ShoppingBagIcon className="h-6 w-6" />
          </Link>

          <Link
            href="/admin/orders"
            className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold">Process Orders</h3>
              <p className="text-sm text-green-600">Manage pending orders</p>
            </div>
            <ChartBarIcon className="h-6 w-6" />
          </Link>

          <Link
            href="/admin/users"
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-purple-600">View and manage users</p>
            </div>
            <UserGroupIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Low Stock Warning */}
      {stats.totalProducts < 10 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-amber-800 font-medium">Low Product Count</span>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            You have only {stats.totalProducts} products. Consider adding more products to your store.
          </p>
          <Link
            href="/admin/products/add"
            className="mt-2 inline-block text-amber-800 font-medium hover:text-amber-900"
          >
            Add Products Now →
          </Link>
        </div>
      )}

      {/* Getting Started Guide */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium">Add Your First Product</h3>
              <p className="text-gray-600 text-sm">
                Start by adding products to your store. Include high-quality images, detailed descriptions, and accurate pricing.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium">Set Up Payment Gateway</h3>
              <p className="text-gray-600 text-sm">
                Make sure Stripe is properly configured to accept payments from customers.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium">Test Checkout Process</h3>
              <p className="text-gray-600 text-sm">
                Place a test order to ensure the entire checkout process works correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}