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
  ExclamationTriangleIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingReviews: 0,
    pendingExperiences: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch main stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }

      // Fetch pending reviews count
      try {
        const reviewsRes = await fetch('/api/admin/reviews/pending');
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setStats(prev => ({ ...prev, pendingReviews: reviewsData.total || 0 }));
        }
      } catch (e) {
        console.log('Could not fetch pending reviews');
      }

      // Fetch pending experiences count
      try {
        const expRes = await fetch('/api/admin/experiences/pending');
        if (expRes.ok) {
          const expData = await expRes.json();
          setStats(prev => ({ ...prev, pendingExperiences: expData.total || 0 }));
        }
      } catch (e) {
        console.log('Could not fetch pending experiences');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <ShoppingBagIcon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 bg-blue-50 p-1.5 sm:p-2 rounded-lg" />
          </div>
          <Link href="/admin/products" className="text-blue-600 text-xs sm:text-sm hover:text-blue-800 mt-3 sm:mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 bg-green-50 p-1.5 sm:p-2 rounded-lg" />
          </div>
          <Link href="/admin/orders" className="text-blue-600 text-xs sm:text-sm hover:text-blue-800 mt-3 sm:mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <UserGroupIcon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 bg-purple-50 p-1.5 sm:p-2 rounded-lg" />
          </div>
          <Link href="/admin/users" className="text-blue-600 text-xs sm:text-sm hover:text-blue-800 mt-3 sm:mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">€{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-amber-600 bg-amber-50 p-1.5 sm:p-2 rounded-lg" />
          </div>
          <div className="flex items-center mt-3 sm:mt-4">
            <ArrowTrendingUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
            <span className="text-xs sm:text-sm text-green-600">+12.5% from last month</span>
          </div>
        </div>
      </div>

      {/* Pending Reviews & Experiences Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Pending Reviews */}
        <Link 
          href="/admin/reviews"
          className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-amber-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-amber-500" />
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Reviews</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.pendingReviews || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Reviews waiting for approval</p>
            </div>
            <div className="bg-amber-50 rounded-full p-2 sm:p-3">
              <StarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center text-amber-600 text-xs sm:text-sm font-medium">
            Moderate reviews →
          </div>
        </Link>

        {/* Pending Experiences */}
        <Link 
          href="/admin/experiences"
          className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
                <p className="text-xs sm:text-sm font-medium text-gray-600">Customer Experiences</p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.pendingExperiences || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Stories waiting for approval</p>
            </div>
            <div className="bg-blue-50 rounded-full p-2 sm:p-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center text-blue-600 text-xs sm:text-sm font-medium">
            Moderate experiences →
          </div>
        </Link>
      </div>

      {/* Quick Actions - Mobile Responsive Grid */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/admin/products/add"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-3 sm:p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Add Product</h3>
              <p className="text-xs sm:text-sm text-blue-600">Create new listing</p>
            </div>
            <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>

          <Link
            href="/admin/reviews"
            className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 p-3 sm:p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Reviews</h3>
              <p className="text-xs sm:text-sm text-amber-600">Moderate reviews</p>
            </div>
            <StarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>

          <Link
            href="/admin/experiences"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-3 sm:p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Experiences</h3>
              <p className="text-xs sm:text-sm text-blue-600">Customer stories</p>
            </div>
            <ChatBubbleLeftRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>

          <Link
            href="/admin/orders"
            className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-3 sm:p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Orders</h3>
              <p className="text-xs sm:text-sm text-green-600">Manage orders</p>
            </div>
            <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
        </div>
      </div>

      {/* Low Stock Warning */}
      {stats.totalProducts < 10 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start sm:items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="text-amber-800 font-medium text-sm sm:text-base">Low Product Count</span>
              <p className="text-amber-700 text-xs sm:text-sm mt-0.5">
                You have only {stats.totalProducts} products. Consider adding more products to your store.
              </p>
              <Link
                href="/admin/products/add"
                className="mt-1 sm:mt-2 inline-block text-amber-800 font-medium hover:text-amber-900 text-sm"
              >
                Add Products Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Guide - Mobile Responsive */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Getting Started</h2>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">Add Your First Product</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Start by adding products to your store. Include high-quality images, detailed descriptions, and accurate pricing.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">Manage Reviews</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Monitor and approve customer reviews to build trust and showcase social proof on your product pages.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-medium text-sm sm:text-base">Collect Customer Stories</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Encourage customers to share their experiences and feature their stories to build a strong brand community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}