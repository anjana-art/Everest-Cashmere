// app/api/auth/login/route.ts
import { UserService } from '@/lib/user-service';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Rate limiting for failed login attempts
const failedLoginAttempts = new Map<string, { count: number; firstAttempt: number; blockedUntil?: number }>();

function checkFailedLogins(email: string, ip: string): { blocked: boolean; waitTime?: number } {
  const key = `${email}:${ip}`;
  const record = failedLoginAttempts.get(key);
  
  if (record) {
    // Check if currently blocked
    if (record.blockedUntil && Date.now() < record.blockedUntil) {
      const waitTime = Math.ceil((record.blockedUntil - Date.now()) / 1000 / 60);
      return { blocked: true, waitTime };
    }
    
    // Reset if block expired
    if (record.blockedUntil && Date.now() > record.blockedUntil) {
      failedLoginAttempts.delete(key);
      return { blocked: false };
    }
    
    // Check 5 failed attempts within 15 minutes
    if (record.count >= 5 && (Date.now() - record.firstAttempt) < 15 * 60 * 1000) {
      const blockUntil = Date.now() + 30 * 60 * 1000; // Block for 30 minutes
      record.blockedUntil = blockUntil;
      failedLoginAttempts.set(key, record);
      return { blocked: true, waitTime: 30 };
    }
    
    // Reset if time window passed
    if (Date.now() - record.firstAttempt > 15 * 60 * 1000) {
      failedLoginAttempts.delete(key);
    }
  }
  
  return { blocked: false };
}

function recordFailedLogin(email: string, ip: string) {
  const key = `${email}:${ip}`;
  const record = failedLoginAttempts.get(key);
  
  if (record && !record.blockedUntil) {
    record.count++;
    failedLoginAttempts.set(key, record);
  } else {
    failedLoginAttempts.set(key, {
      count: 1,
      firstAttempt: Date.now(),
    });
  }
}

function clearFailedLogins(email: string, ip: string) {
  const key = `${email}:${ip}`;
  failedLoginAttempts.delete(key);
}

// Rate limiting for login requests (prevent DoS)
const requestRateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRequestRateLimit(ip: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  const record = requestRateLimit.get(ip);
  
  if (!record || now > record.resetTime) {
    requestRateLimit.set(ip, { count: 1, resetTime: now + 60 * 1000 }); // 1 minute
    return { allowed: true };
  }
  
  if (record.count >= 10) { // Max 10 login attempts per minute
    const waitTime = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, waitTime };
  }
  
  record.count++;
  requestRateLimit.set(ip, record);
  return { allowed: true };
}

// Check if user is blocked (add this to your User model)
async function isUserBlocked(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isBlocked: true, blockedAt: true }
    });
    
    if (user?.isBlocked) {
      // Check if block is expired (e.g., 24 hour block)
      if (user.blockedAt && Date.now() - new Date(user.blockedAt).getTime() > 24 * 60 * 60 * 1000) {
        // Unblock user after 24 hours
        await prisma.user.update({
          where: { email },
          data: { isBlocked: false, blockedAt: null }
        });
        return false;
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Get client IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Check rate limiting for requests
    const rateLimitCheck = checkRequestRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      console.log(`🚫 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateLimitCheck.waitTime} seconds.` },
        { status: 429 }
      );
    }
    
    // Check if user is blocked
    const isBlocked = await isUserBlocked(email);
    if (isBlocked) {
      console.log(`🚫 Blocked user attempted login: ${email} from IP ${ip}`);
      return NextResponse.json(
        { error: 'Account temporarily blocked due to suspicious activity. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Check failed login attempts
    const failedCheck = checkFailedLogins(email, ip);
    if (failedCheck.blocked) {
      console.log(`🚫 Too many failed logins for ${email} from IP ${ip}`);
      return NextResponse.json(
        { error: `Too many failed attempts. Please try again in ${failedCheck.waitTime} minutes.` },
        { status: 429 }
      );
    }
    
    // Attempt login
    const user = await UserService.login(email, password);
    
    // Clear failed attempts on successful login
    clearFailedLogins(email, ip);
    
    // Log successful login
    console.log(`✅ Successful login: ${email} from IP ${ip}`);
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin
        },
        message: 'Login successful' 
      },
      { status: 200 }
    );
    
    // Set secure cookies
    response.cookies.set({
      name: 'user',
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    response.cookies.set('user-id', user.id, {
      httpOnly: true, // Make it httpOnly for security
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('admin-check', user.isAdmin.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Login API error:', error);
    
    // Try to record failed attempt if we have email and IP
    let email = '';
    let ip = 'unknown';
    try {
      const body = await request.json();
      email = body.email;
      ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           'unknown';
      recordFailedLogin(email, ip);
    } catch {
      // Ignore parsing errors
    }
    
    // Return generic error message (don't reveal if email exists)
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}

// Clean up rate limit maps periodically
setInterval(() => {
  const now = Date.now();
  
  // Clean request rate limits
  for (const [ip, record] of requestRateLimit.entries()) {
    if (now > record.resetTime) {
      requestRateLimit.delete(ip);
    }
  }
  
  // Clean failed login attempts
  for (const [key, record] of failedLoginAttempts.entries()) {
    if (record.blockedUntil && now > record.blockedUntil) {
      failedLoginAttempts.delete(key);
    } else if (!record.blockedUntil && (now - record.firstAttempt) > 15 * 60 * 1000) {
      failedLoginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean every hour