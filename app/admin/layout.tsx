// app/admin/layout.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBagIcon, 
  ArrowLeftOnRectangleIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'admin-check=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user-id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: Squares2X2Icon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/admin/orders', icon: ClipboardDocumentListIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: StarIcon },
    { name: 'Experiences', href: '/admin/experiences', icon: ChatBubbleLeftRightIcon },
    { name: 'Revenue', href: '/admin/revenue', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          type="button"
          className="p-2 text-gray-700 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-5 w-5" />
          ) : (
            <Bars3Icon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Centered vertically on desktop */}
      <div
        className={`fixed left-0 z-50 w-56 bg-gradient-to-b from-amber-50 to-white border-r border-amber-100/50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:top-1/2 lg:-translate-y-1/2 top-0 h-full lg:h-auto lg:max-h-[80vh] rounded-r-2xl shadow-xl`}
        role="navigation"
        aria-label="Admin sidebar"
      >
        {/* Sidebar Header - Mobile only */}
        <div className="p-4 border-b border-amber-100/50 lg:hidden">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center">
              <ShoppingBagIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">Admin Panel</h1>
              <p className="text-[10px] text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation - Compact */}
        <nav className="px-3 py-4 overflow-y-auto max-h-[70vh]">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'text-gray-600 hover:bg-amber-100/50 hover:text-gray-800'
                  }`}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer - Compact */}
        <div className="w-full p-3 border-t border-amber-100/50 bg-gradient-to-t from-amber-50/80 to-transparent rounded-b-2xl">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm text-gray-700">{user.name || user.email}</p>
                <p className="text-[10px] text-gray-400">Administrator</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
                aria-label="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-56 min-h-screen">
        {/* Top Navbar - Desktop */}
        <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-amber-100/30 h-16 shadow-sm">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-600/20">
                <ShoppingBagIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
                <p className="text-[10px] text-gray-400">E-commerce Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-sm text-gray-600">{user.name || user.email}</span>
              )}
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-amber-600 transition-colors flex items-center space-x-1"
              >
                <HomeIcon className="h-4 w-4" />
                <span>View Store</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Top Navbar - Mobile */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-amber-100/30 lg:hidden">
          <div className="flex items-center justify-center h-14 px-4">
            <span className="text-base font-serif font-bold text-gray-800">Himkash</span>
            <span className="ml-2 text-xs text-gray-400">/ Admin</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}