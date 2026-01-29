// app/api/auth/signup/route.ts
import { UserService } from '@/lib/user-service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    const user = await UserService.signup(email, password, name)
    
    const response =  NextResponse.json(
      { 
        success: true, 
        user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin // Include admin status
      },
        message: 'Account created successfully' 
      },
      { status: 201 }
    )
    
       // Set cookie with admin status
    response.cookies.set({
      name: 'user',
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin // Store admin status in cookie
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 ,// 1 week
      path: '/',

    });
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error},
      { status: 400 }
    )
  }
}