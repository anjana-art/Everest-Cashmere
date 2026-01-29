// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
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
    
    if (!isAdmin) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};