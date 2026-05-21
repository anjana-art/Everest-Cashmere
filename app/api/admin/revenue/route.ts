// app/api/admin/revenue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client"; // ✅ Import the enum

export async function GET(request: NextRequest) {
  console.log('=== REVENUE API CALLED ===');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'monthly'; // daily, weekly, monthly, yearly
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const week = parseInt(searchParams.get('week') || '1');
    
    // Business start date: April 8, 2026
    const BUSINESS_START_DATE = new Date(2026, 3, 8); // Month is 0-indexed, so 3 = April
    
    // ✅ FIXED: Use OrderStatus enum instead of strings
    const baseFilter = {
      status: {
        in: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]
      },
      paidAt: {
        gte: BUSINESS_START_DATE,
      }
    };

    // Get all paid orders after business start date
    const allPaidOrders = await prisma.order.findMany({
      where: baseFilter,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
        paidAt: true,
        status: true,
        items: {
          select: {
            quantity: true,
            price: true,
            name: true,
          }
        },
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        paidAt: 'asc',
      }
    });

    // Calculate total revenue since business start
    const totalRevenue = allPaidOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const totalOrders = allPaidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItems = allPaidOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    // Calculate data based on view type
    let chartData: any[] = [];
    
    if (view === 'daily') {
      // Get date range for selected month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // Create array of all days in month
      const daysInMonth = endDate.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        // Skip dates before business start
        if (currentDate < BUSINESS_START_DATE) continue;
        
        const dayOrders = allPaidOrders.filter(order => {
          const orderDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
          return orderDate.getDate() === day && 
                 orderDate.getMonth() === month - 1 && 
                 orderDate.getFullYear() === year;
        });
        
        chartData.push({
          period: day,
          label: `Day ${day}`,
          revenue: dayOrders.reduce((sum, order) => sum + Number(order.total), 0),
          orders: dayOrders.length,
        });
      }
    } 
    else if (view === 'weekly') {
      // Get weeks for selected year
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      
      // Find first Monday of the year for proper week calculation
      const firstDayOfYear = new Date(year, 0, 1);
      const firstMonday = new Date(firstDayOfYear);
      const dayOfWeek = firstDayOfYear.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      firstMonday.setDate(firstDayOfYear.getDate() - daysToMonday);
      
      // Generate weeks
      let currentWeekStart = new Date(firstMonday);
      let weekNumber = 1;
      
      while (currentWeekStart <= endOfYear) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        
        // Skip weeks before business start
        if (weekEnd >= BUSINESS_START_DATE) {
          const weekOrders = allPaidOrders.filter(order => {
            const orderDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
            return orderDate >= currentWeekStart && orderDate <= weekEnd;
          });
          
          const weekRevenue = weekOrders.reduce((sum, order) => sum + Number(order.total), 0);
          
          if (weekRevenue > 0 || weekOrders.length > 0) {
            chartData.push({
              period: weekNumber,
              label: `Week ${weekNumber}`,
              dateRange: `${currentWeekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
              revenue: weekRevenue,
              orders: weekOrders.length,
            });
          }
        }
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        weekNumber++;
      }
    }
    else if (view === 'monthly') {
      // Get months from business start to current year
      const currentYear = new Date().getFullYear();
      const startYear = BUSINESS_START_DATE.getFullYear();
      const startMonth = BUSINESS_START_DATE.getMonth();
      
      for (let y = startYear; y <= currentYear; y++) {
        const startM = (y === startYear) ? startMonth : 0;
        const endM = (y === currentYear) ? new Date().getMonth() : 11;
        
        for (let m = startM; m <= endM; m++) {
          const monthOrders = allPaidOrders.filter(order => {
            const orderDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
            return orderDate.getFullYear() === y && orderDate.getMonth() === m;
          });
          
          const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total), 0);
          
          chartData.push({
            period: `${y}-${m + 1}`,
            label: new Date(y, m, 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
            revenue: monthRevenue,
            orders: monthOrders.length,
          });
        }
      }
    }
    else if (view === 'yearly') {
      // Get years from business start to current
      const currentYear = new Date().getFullYear();
      const startYear = BUSINESS_START_DATE.getFullYear();
      
      for (let y = startYear; y <= currentYear; y++) {
        const yearOrders = allPaidOrders.filter(order => {
          const orderDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
          return orderDate.getFullYear() === y;
        });
        
        chartData.push({
          period: y.toString(),
          label: y.toString(),
          revenue: yearOrders.reduce((sum, order) => sum + Number(order.total), 0),
          orders: yearOrders.length,
        });
      }
    }

    // Get recent orders
    const recentOrders = allPaidOrders.slice(-10).reverse().map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      customerName: order.user?.name || order.user?.email || 'Guest',
    }));

    // Get top products
    const productSales = new Map();
    allPaidOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        if (productSales.has(key)) {
          const existing = productSales.get(key);
          productSales.set(key, {
            name: item.name,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (Number(item.price) * item.quantity),
          });
        } else {
          productSales.set(key, {
            name: item.name,
            quantity: item.quantity,
            revenue: Number(item.price) * item.quantity,
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get daily stats for current month (for the chart preview)
    const currentDate = new Date();
    const currentMonthOrders = allPaidOrders.filter(order => {
      const orderDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
      return orderDate.getMonth() === currentDate.getMonth() && 
             orderDate.getFullYear() === currentDate.getFullYear();
    });
    
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
    const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthOrders = allPaidOrders.filter(order => {
      const orderDate = order.paidAt ? new Date(order.paidAt) : new Date(order.createdAt);
      return orderDate.getMonth() === previousMonthDate.getMonth() && 
             orderDate.getFullYear() === previousMonthDate.getFullYear();
    });
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);
    
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 100;

    return NextResponse.json({
      success: true,
      data: {
        businessStartDate: BUSINESS_START_DATE.toISOString(),
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          totalItems,
          currentMonthRevenue,
          revenueGrowth,
        },
        chartData,
        recentOrders,
        topProducts,
        currentView: view,
        currentYear: year,
        currentMonth: month,
      },
    });

  } catch (error: any) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}