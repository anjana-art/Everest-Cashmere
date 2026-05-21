// app/admin/revenue/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Calendar,
  Loader2,
  RefreshCw,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueData {
  businessStartDate: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalItems: number;
    currentMonthRevenue: number;
    revenueGrowth: number;
  };
  chartData: Array<{
    period: string | number;
    label: string;
    revenue: number;
    orders: number;
    dateRange?: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    paidAt: string;
    customerName: string;
  }>;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  currentView: string;
  currentYear: number;
  currentMonth: number;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/revenue?view=${selectedView}&year=${selectedYear}&month=${selectedMonth}`
      );
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch revenue data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [selectedView, selectedYear, selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const maxRevenue = data?.chartData
    ? Math.max(...data.chartData.map(item => item.revenue), 0)
    : 0;

  const isGrowthPositive = (data?.summary.revenueGrowth || 0) >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-red-900 mb-2">Revenue Dashboard</h1>
              <p className="text-red-800">
                Tracking since {data ? new Date(data.businessStartDate).toLocaleDateString() : 'April 8, 2026'}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value as any)}
                className="px-4 py-2 border border-amber-200 rounded-lg bg-white/50 focus:outline-none focus:border-amber-500"
              >
                <option value="daily">Daily View</option>
                <option value="weekly">Weekly View</option>
                <option value="monthly">Monthly View</option>
                <option value="yearly">Yearly View</option>
              </select>
              {selectedView === 'daily' && (
                <>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-4 py-2 border border-amber-200 rounded-lg bg-white/50 focus:outline-none focus:border-amber-500"
                  >
                    {[2026, 2027, 2028].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 border border-amber-200 rounded-lg bg-white/50 focus:outline-none focus:border-amber-500"
                  >
                    {Array(12).fill(0).map((_, i) => (
                      <option key={i} value={i + 1}>
                        {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {selectedView === 'weekly' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-amber-200 rounded-lg bg-white/50 focus:outline-none focus:border-amber-500"
                >
                  {[2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
              {selectedView === 'monthly' && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-amber-200 rounded-lg bg-white/50 focus:outline-none focus:border-amber-500"
                >
                  {[2026, 2027, 2028].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
              <Button
                onClick={fetchRevenueData}
                variant="outline"
                className="border-amber-200 text-red-900 hover:bg-amber-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : data ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(data.summary.totalRevenue)}</p>
                      <p className="text-xs text-gray-400 mt-1">Since April 8, 2026</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-600">{data.summary.totalOrders}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Average Order</p>
                      <p className="text-3xl font-bold text-purple-600">{formatCurrency(data.summary.averageOrderValue)}</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Items Sold</p>
                      <p className="text-3xl font-bold text-amber-600">{data.summary.totalItems}</p>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">This Month</p>
                      <p className="text-3xl font-bold text-indigo-600">{formatCurrency(data.summary.currentMonthRevenue)}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isGrowthPositive ? <TrendingUpIcon className="h-3 w-3" /> : <TrendingDownIcon className="h-3 w-3" />}
                        {Math.abs(data.summary.revenueGrowth).toFixed(1)}% vs last month
                      </div>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="mb-8 bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-serif font-bold text-red-900">
                  {selectedView === 'daily' && `Daily Revenue - ${new Date(selectedYear, selectedMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                  {selectedView === 'weekly' && `Weekly Revenue - ${selectedYear}`}
                  {selectedView === 'monthly' && `Monthly Revenue`}
                  {selectedView === 'yearly' && `Yearly Revenue`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.chartData.map((item) => {
                    const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    return (
                      <div key={item.period} className="group">
                        <div className="flex items-center gap-4">
                          <div className="w-28 text-sm text-gray-600">
                            {item.label}
                            {item.dateRange && (
                              <div className="text-xs text-gray-400">{item.dateRange}</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="relative h-10 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500 group-hover:opacity-80"
                                style={{ width: `${height}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-40 text-right">
                            <span className="font-semibold text-amber-700">{formatCurrency(item.revenue)}</span>
                            <span className="text-xs text-gray-400 ml-2">({item.orders} orders)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {data.chartData.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No data available for this period</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-serif font-bold text-red-900">
                    Top Selling Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-amber-50/30 rounded-lg">
                        <div>
                          <p className="font-medium text-red-900">{product.name}</p>
                          <p className="text-sm text-gray-500">Sold: {product.quantity} units</p>
                        </div>
                        <p className="font-semibold text-amber-700">{formatCurrency(product.revenue)}</p>
                      </div>
                    ))}
                    {data.topProducts.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No products sold yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-serif font-bold text-red-900">
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border-b border-amber-100 last:border-0">
                        <div>
                          <p className="font-mono text-sm text-red-900">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.customerName}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-amber-700">{formatCurrency(order.total)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Failed to load revenue data</p>
          </div>
        )}
      </div>
    </div>
  );
}