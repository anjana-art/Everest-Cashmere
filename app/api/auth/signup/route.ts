// app/api/auth/signup/route.ts - COMPLETE REPLACEMENT

import { UserService } from '@/lib/user-service';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ==================== STRONGER SPAM DETECTION ====================

// Comprehensive list of disposable email domains
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'yopmail.com', 'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com',
  'dispostable.com', 'spambox.us', 'trashmail.com', 'mailnator.com',
  'temp-mail.io', 'tempmail.io', 'tempinbox.com', 'guerrillamail.net',
  'guerrillamail.biz', 'guerrillamail.org', 'sharklasers.com', 'grr.la',
  'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net', 'cool.fr.nf',
  'spam.la', 'spambox.us', 'mail-temp.com', 'tempemail.net', 'mailtemp.org'
]);

// Suspicious TLDs (often used for spam)
const SUSPICIOUS_TLDS = new Set([
  '.top', '.xyz', '.club', '.work', '.date', '.loan', '.win', '.bid',
  '.trade', '.webcam', '.science', '.party', '.click', '.download',
  '.review', '.country', '.stream', '.accountant', '.faith', '.cricket'
]);

// Function to detect spam email with multiple checks
function isSpamEmail(email: string): { isSpam: boolean; reason: string } {
  const lowerEmail = email.toLowerCase();
  const [localPart, domain] = lowerEmail.split('@');
  
  if (!domain) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  // Check 1: Disposable email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isSpam: true, reason: "Disposable email addresses are not allowed" };
  }
  
  // Check 2: Suspicious TLDs
  for (const tld of SUSPICIOUS_TLDS) {
    if (domain.endsWith(tld)) {
      return { isSpam: true, reason: "Email domain not allowed" };
    }
  }
  
  // Check 3: Too many dots in local part (spam pattern)
  const dotCount = (localPart.match(/\./g) || []).length;
  if (dotCount >= 4) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  // Check 4: Pattern like "a.b.c.d.e" (consecutive single letters with dots)
  if (/^([a-z]\.){4,}[a-z]+$/.test(localPart)) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  // Check 5: Pattern like "t.e.s.t.e.r" (alternating letters with dots)
  if (/^([a-z]\.)+[a-z]+$/.test(localPart)) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  // Check 6: Contains suspicious patterns like "test", "spam", "fake"
  const suspiciousWords = ['test', 'spam', 'fake', 'temp', 'trash', 'junk', 'random', 'example'];
  for (const word of suspiciousWords) {
    if (localPart.includes(word)) {
      if (localPart.length < 15 && localPart.match(new RegExp(word, 'i'))) {
        return { isSpam: true, reason: "Invalid email format" };
      }
    }
  }
  
  // Check 7: Random looking patterns (letters + numbers in random order)
  const randomPattern = /^[a-z]{1,2}[0-9]{2,}[a-z]{1,2}[0-9]+$/;
  if (randomPattern.test(localPart)) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  // Check 8: Consecutive letters with numbers like "owolukito25"
  const letterNumberPattern = /^[a-z]{5,}[0-9]{2,}$/;
  if (letterNumberPattern.test(localPart) && localPart.length < 20) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  // Check 9: Pattern with dots AND numbers (e.g., "ow.ol.u.k.ito.2.5")
  if (dotCount >= 2 && /\d/.test(localPart)) {
    return { isSpam: true, reason: "Invalid email format" };
  }
  
  return { isSpam: false, reason: "" };
}

// Function to detect spam name
function isSpamName(name: string | null | undefined): { isSpam: boolean; reason: string } {
  if (!name) return { isSpam: false, reason: "" };
  
  // Check 1: Very long random string (20+ chars with no spaces)
  if (name.length >= 20 && !name.includes(' ')) {
    return { isSpam: true, reason: "Invalid name format" };
  }
  
  // Check 2: Mixed case pattern like "AbCdEfGhIj"
  if (/^[A-Z][a-z][A-Z][a-z][A-Z][a-z]/.test(name)) {
    return { isSpam: true, reason: "Invalid name format" };
  }
  
  // Check 3: All caps long string
  if (/^[A-Z]{8,}$/.test(name)) {
    return { isSpam: true, reason: "Invalid name format" };
  }
  
  // Check 4: Random alphanumeric without vowels
  const vowelCount = (name.match(/[aeiou]/gi) || []).length;
  if (name.length >= 10 && vowelCount < 2) {
    return { isSpam: true, reason: "Invalid name format" };
  }
  
  // Check 5: Contains suspicious keywords
  const suspiciousNames = ['test', 'spam', 'fake', 'user', 'admin', 'temp', 'random', 'example'];
  for (const word of suspiciousNames) {
    if (name.toLowerCase().includes(word)) {
      return { isSpam: true, reason: "Invalid name format" };
    }
  }
  
  return { isSpam: false, reason: "" };
}

// Function to validate email format
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;
  if (email.length > 100) return false;
  if (email.includes('..')) return false;
  
  const invalidChars = /[<>()[\]\\,;:\s]/;
  if (invalidChars.test(email)) return false;
  
  return true;
}

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; waitTime?: number } {
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return { allowed: true };
  }
  
  if (record.count >= 5) {
    const waitTime = Math.ceil((record.resetTime - now) / 1000 / 60);
    return { allowed: false, waitTime };
  }
  
  record.count++;
  rateLimit.set(ip, record);
  return { allowed: true };
}

// Clean up rate limit map
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimit.entries()) {
    if (now > record.resetTime) {
      rateLimit.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting
    const rateLimitCheck = checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      console.log(`🚫 Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: `Too many signup attempts. Please try again in ${rateLimitCheck.waitTime} minutes.` },
        { status: 429 }
      );
    }

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email format validation
    if (!isValidEmailFormat(email)) {
      console.log(`🚫 Invalid email format: ${email} from IP ${ip}`);
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // ✅ STRONG SPAM DETECTION - Email
    const emailSpamCheck = isSpamEmail(email);
    if (emailSpamCheck.isSpam) {
      console.log(`🚫 Spam email blocked: ${email} from IP ${ip} - Reason: ${emailSpamCheck.reason}`);
      
      await prisma.blockedAttempt.create({
        data: {
          email,
          ip,
          reason: emailSpamCheck.reason,
          attemptedAt: new Date(),
        }
      });
      
      return NextResponse.json(
        { error: 'Unable to create account. Please use a valid email address.' },
        { status: 400 }
      );
    }

    // ✅ SPAM DETECTION - Name
    const nameSpamCheck = isSpamName(name);
    if (nameSpamCheck.isSpam) {
      console.log(`🚫 Spam name blocked: ${name} from IP ${ip} - Reason: ${nameSpamCheck.reason}`);
      
      await prisma.blockedAttempt.create({
        data: {
          email,
          ip,
          reason: nameSpamCheck.reason,
          attemptedAt: new Date(),
        }
      });
      
      return NextResponse.json(
        { error: 'Unable to create account. Please use a valid name.' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log(`✅ New user registered: ${email} from IP ${ip}`);
    return response;

  } catch (error) {
    console.error('Signup backend error:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Something went wrong during signup',
      },
      { status: 400 }
    );
  }
}