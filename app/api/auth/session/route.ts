// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie?.value) {
      return NextResponse.json({ user: null });
    }
    
    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user });
    
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}