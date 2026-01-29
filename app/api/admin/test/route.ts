// app/api/admin/test/route.ts
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const cookies: Record<string, string> = {};
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  
  return NextResponse.json({
    success: true,
    cookies: cookies,
    userCookie: cookies['user'],
    adminCheckCookie: cookies['admin-check'],
    headers: {
      cookie: cookieHeader
    }
  });
}