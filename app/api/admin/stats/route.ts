// app/api/admin/stats/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to check admin (same as before)
async function isAdmin(request: NextRequest): Promise<boolean> {
  // Add your admin check logic here
 try {
    console.log('🔐 === STARTING ADMIN CHECK ===');
    
    // Option 1: Check admin token from headers (for testing/API access)
    const adminToken = request.headers.get('x-admin-token');
    console.log('🔑 Admin token from headers:', adminToken ? 'Present' : 'Missing');
    
    if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
      console.log('✅ Admin access granted via token');
      return true;
    }

    // Option 2: Check cookies from request headers directly
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Raw cookie header:', cookieHeader);
    
    if (!cookieHeader) {
      console.log('❌ No cookies found in request');
      return false;
    }

    // Parse cookies manually
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    console.log('📋 Parsed cookies:', Object.keys(cookies));
    
    // Check admin-check cookie first (simpler)
    if (cookies['admin-check'] === 'true') {
      console.log('✅ Admin access via admin-check cookie');
      return true;
    }
    
    // Check user cookie
    const userCookie = cookies['user'];
    console.log('👤 User cookie found:', !!userCookie);
    
    if (!userCookie) {
      console.log('❌ No user cookie found');
      return false;
    }

    console.log('📄 User cookie value:', userCookie.substring(0, 100) + '...');
    
    let user;
    try {
      user = JSON.parse(userCookie);
      console.log('✅ Parsed user:', {
        id: user?.id,
        email: user?.email,
        isAdmin: user?.isAdmin
      });
    } catch (parseError) {
      console.error('❌ Failed to parse user cookie:', parseError);
      return false;
    }
    
    if (!user?.id) {
      console.log('❌ User cookie missing id');
      return false;
    }

    console.log('🔍 Looking up user in database with ID:', user.id);
    
    // Get user from database to check admin status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, email: true }
    });

    console.log('📊 Database user found:', dbUser);
    
    if (!dbUser) {
      console.log('❌ User not found in database');
      return false;
    }

    const isAdminUser = dbUser.isAdmin || false;
    console.log(`🎯 Final: User ${dbUser.email} is admin: ${isAdminUser}`);
    console.log('=== ADMIN CHECK COMPLETE ===');
    return isAdminUser;
    
  } catch (error) {
    console.error('💥 ERROR in admin check:', error);
    return false;
  }

}

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get stats in parallel
    const [totalProducts, totalOrders, totalUsers, recentOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true }
          },
          items: true
        }
      })
    ]);

    // Calculate total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        total: true
      },
      where: {
        status: 'PAID'
      }
    });

    const totalRevenue = revenueResult._sum.total || 0;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: Number(totalRevenue),
      recentOrders
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}