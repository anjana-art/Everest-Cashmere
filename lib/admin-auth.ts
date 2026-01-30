// lib/admin-auth.ts - FIXED VERSION
import { NextRequest } from 'next/server';

// Simple admin check for API routes
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
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
    const cookiesParsed: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) {
        cookiesParsed[name] = decodeURIComponent(value);
      }
    });

    console.log('📋 Parsed cookies:', Object.keys(cookiesParsed));
    
    // Check admin-check cookie first (simpler)
    if (cookiesParsed['admin-check'] === 'true') {
      console.log('✅ Admin access via admin-check cookie');
      return true;
    }
    
    // Check user cookie
    const userCookie = cookiesParsed['user'];
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

    // Get user from database to check admin status
    const { prisma } = await import('./prisma');
    
    console.log('🔍 Looking up user in database with ID:', user.id);
    
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

// For Next.js middleware (if needed)
export const adminMiddleware = async (request: NextRequest) => {
  const admin = await isAdmin(request);
  return admin;
};

// For client-side checks (simplified)
export const isClientAdmin = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
    
    if (!userCookie) return false;
    
    const user = JSON.parse(decodeURIComponent(userCookie));
    return user.isAdmin === true;
  } catch (error) {
    console.error('Error checking client admin:', error);
    return false;
  }
};