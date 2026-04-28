// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if it's an admin route
  if (pathname.startsWith('/admin')) {
    // IMPORTANT: Allow API routes to pass through with their own auth
    if (pathname.startsWith('/api/admin')) {  // Changed from '/admin/api' to '/api/admin'
      return NextResponse.next();
    }
    
    const cookieHeader = request.headers.get('cookie');
    let isAdmin = false;
    
    if (cookieHeader) {
      // Parse cookies
      const cookies: Record<string, string> = {};
      cookieHeader.split(';').forEach(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        const value = rest.join('=');
        if (name) {
          cookies[name] = decodeURIComponent(value);
        }
      });
      
      // Check admin-check cookie
      if (cookies['admin-check'] === 'true') {
        isAdmin = true;
      }
      
      // Check user cookie
      if (cookies['user']) {
        try {
          const user = JSON.parse(cookies['user']);
          if (user.isAdmin) {
            isAdmin = true;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    if (!isAdmin && !pathname.startsWith('/admin/login')) {
      // Don't redirect API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Redirect to login for page routes
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};