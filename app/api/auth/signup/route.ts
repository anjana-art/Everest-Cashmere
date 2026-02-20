// app/api/auth/signup/route.ts

import { UserService } from '@/lib/user-service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Optional: simple email format check
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create user
    const user = await UserService.signup(email, password, name);

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        },
        message: 'Account created successfully',
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set({
      name: 'user',
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Signup backend error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong during signup',
      },
      { status: 400 }
    );
  }
}
