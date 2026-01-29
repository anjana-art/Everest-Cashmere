// lib/admin-auth.ts
import { getServerSession } from 'next-auth/next';
import { auth } from './auth'; // You'll need to create this
import { NextRequest, NextResponse } from 'next/server';

// Simple admin middleware for API routes
export async function isAdmin(request: Request): Promise<boolean> {
  try {
    // For development/testing, you can use an admin token
    const adminToken = request.headers.get('x-admin-token');
    if (adminToken === process.env.ADMIN_TOKEN) {
      return true;
    }

    // For production with NextAuth
    const session = await getServerSession(auth);
    
    if (!session?.user?.email) {
      return false;
    }

    // Check if user is admin in database
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    });

    return user?.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// For Next.js middleware
export const adminMiddleware = async (request: NextRequest) => {
  // Implementation for middleware protection
};

// For client-side checks
export const isClientAdmin = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch('/api/auth/check-admin');
    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    return false;
  }
};