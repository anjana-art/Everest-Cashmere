// app/login/page.tsx - UPDATED WITH SECURITY ERROR HANDLING
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { Home, Eye, EyeOff, AlertCircle, Clock, Shield } from 'lucide-react';

// Inner component that uses useSearchParams
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'auth' | 'rate-limit' | 'blocked' | 'network'>('auth');
  const [countdown, setCountdown] = useState(0);
  const { mergeItems } = useCartStore();
  
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const cartItemsParam = searchParams.get('cartItems');

  useEffect(() => {
    // If user is already logged in, redirect to callback URL
    const user = localStorage.getItem('user');
    if (user) {
      router.push(callbackUrl);
    }
    
    // If coming from checkout, restore cart items
    const pendingCart = localStorage.getItem('pending-checkout-items');
    if (pendingCart && callbackUrl.includes('checkout')) {
      console.log('Cart items pending merge after login');
    }
  }, [router, callbackUrl]);

  // Handle countdown timer for rate limiting
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic email validation before sending
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setErrorType('auth');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 429) {
          setErrorType('rate-limit');
          // Try to extract wait time from error message
          const match = data.error.match(/(\d+)/);
          if (match) {
            setCountdown(parseInt(match[0]));
          }
          throw new Error(data.error || 'Too many login attempts');
        } else if (response.status === 403) {
          setErrorType('blocked');
          throw new Error(data.error || 'Account temporarily blocked');
        } else if (response.status === 401) {
          setErrorType('auth');
          throw new Error(data.error || 'Invalid email or password');
        } else {
          setErrorType('auth');
          throw new Error(data.error || 'Login failed');
        }
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Clear any pending cart items
      localStorage.removeItem('pending-checkout-items');
      
      // Merge cart if there are pending items
      const pendingCart = localStorage.getItem('pendingCart');
      if (pendingCart) {
        try {
          const pendingItems = JSON.parse(pendingCart);
          
          await fetch('/api/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items: pendingItems })
          });
          
          localStorage.removeItem('pendingCart');
        } catch (mergeError) {
          console.error('Cart merge error:', mergeError);
        }
      }
      
      // ✅ FORCE PAGE REFRESH to update all components
      window.location.href = callbackUrl;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Render different error messages based on type
  const renderError = () => {
    if (!error) return null;
    
    switch (errorType) {
      case 'rate-limit':
        return (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Too many attempts</p>
                <p className="text-sm text-yellow-700 mt-1">{error}</p>
                {countdown > 0 && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Please wait {countdown} seconds before trying again
                  </p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'blocked':
        return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Account Temporarily Blocked</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Please contact support if you believe this is an error.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'network':
        return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Network Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Please check your connection and try again.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Login Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Home Button */}
      <Link 
        href="/" 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 group"
        aria-label="Go to home page"
      >
        <Home className="w-5 h-5 text-gray-600 group-hover:text-amber-600" />
      </Link>

      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-red-900 mb-2">
            {callbackUrl.includes('checkout') ? 'Login to Checkout' : 'Welcome Back'}
          </h1>
          <p className="text-red-800">
            {callbackUrl.includes('checkout') 
              ? 'Sign in to complete your purchase' 
              : 'Sign in to your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-amber-100/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {renderError()}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-red-900 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading || countdown > 0}
                  className="block w-full pl-10 pr-3 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition bg-white/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field with Visibility Toggle */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-red-900">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-amber-600 hover:text-amber-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading || countdown > 0}
                  className="block w-full pl-10 pr-10 py-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition bg-white/50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || countdown > 0}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : countdown > 0 ? (
                `Wait ${countdown}s...`
              ) : (
                'Sign in'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-200"></div>
              </div>
            </div>  
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-red-800">
              Don't have an account?{' '}
              <Link 
                href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`} 
                className="font-medium text-amber-600 hover:text-amber-700 transition-colors duration-200"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-red-600">
            🔒 Protected by rate limiting and security monitoring
          </p>
        </div>
      </div>
    </div>
  );
}

// Main export component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 relative">
        <Link 
          href="/" 
          className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 group z-10"
          aria-label="Go to home page"
        >
          <Home className="w-5 h-5 text-gray-600 group-hover:text-amber-600" />
        </Link>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-red-800">Loading login...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}