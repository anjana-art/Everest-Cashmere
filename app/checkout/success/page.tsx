// app/checkout/success/page.tsx
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon, HomeIcon, ShoppingBagIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';

// Wrap the main content in a separate component that uses useSearchParams
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const { clearCart } = useCartStore();

  useEffect(() => {
    if (sessionId) {
      verifyOrder(sessionId);
    } else {
      setError('No session ID found in URL. Please check your order history.');
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    // Only run when order is successfully set
    if (order) {
      // Clear cart from Zustand store
      clearCart();
      
      // Also clear localStorage for redundancy
      try {
        localStorage.removeItem('cart-storage');
        localStorage.removeItem('pending-checkout-items');
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }
  }, [order, clearCart]);

  const verifyOrder = async (sessionId: string) => {
    console.log('Starting order verification for session:', sessionId);
    
    try {
      setLoading(true);
      setError('');
      
      // Create a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      console.log('Making fetch request to /api/verify-order...');
      
      const response = await fetch('/api/verify-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ sessionId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      // Check if response is OK
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}`;
        
        // Try to parse error message from response
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Server error response:', errorData);
        } catch (parseError) {
          // If can't parse as JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = `${errorMessage}: ${errorText.substring(0, 200)}`;
            }
          } catch (textError) {
            console.error('Could not read error response text');
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      const data = await response.json();
      console.log('Order verification successful:', data);
      
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        throw new Error(data.error || 'Invalid response from server');
      }
      
    } catch (error: any) {
      console.error('Error verifying order:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        sessionId: sessionId
      });
      
      // Handle specific error types
      let userErrorMessage = 'Failed to verify order';
      
      if (error.name === 'AbortError') {
        userErrorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Failed to fetch')) {
        userErrorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('404')) {
        userErrorMessage = 'Order verification service not found. Please contact support.';
      } else if (error.message.includes('500')) {
        userErrorMessage = 'Server error occurred. Please try again later.';
      } else {
        userErrorMessage = error.message || 'Failed to verify order';
      }
      
      setError(userErrorMessage);
      
      // Auto-retry logic (max 3 times)
      if (retryCount < 3 && !error.message.includes('404')) {
        const nextRetry = retryCount + 1;
        console.log(`Will retry in 2 seconds (attempt ${nextRetry}/3)`);
        
        setTimeout(() => {
          setRetryCount(nextRetry);
          verifyOrder(sessionId);
        }, 2000);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError('');
    if (sessionId) {
      verifyOrder(sessionId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {retryCount > 0 ? `Verifying order... (Attempt ${retryCount + 1}/3)` : 'Verifying your order...'}
          </p>
          {sessionId && (
            <p className="text-xs text-gray-500 mt-2">
              Session: {sessionId.substring(0, 20)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ExclamationTriangleIcon className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {error.includes('timed out') ? 'Timeout' : 
               error.includes('connect') ? 'Connection Error' : 
               'Order Verification Failed'}
            </h1>
            <p className="text-gray-600 mb-6 text-center">{error}</p>
            
            {sessionId && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Session Reference</p>
                <p className="font-mono text-xs break-all bg-white p-2 rounded border">
                  {sessionId}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Try Again
              </button>
              
              <Link
                href="/orders"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 text-center"
              >
                Check My Orders
              </Link>
              
              <Link
                href="/"
                className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 text-center"
              >
                Return to Home
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                If this problem persists, please contact support with your session ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Payment Successful!</h1>
          <p className="text-gray-600 text-center mb-6">Thank you for your purchase</p>
          
          {order && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">Order Number</div>
                  <div className="font-mono font-bold text-lg text-gray-900">
                    {order.orderNumber}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">€{Number(order.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {order.items && order.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-gray-900">Order Summary</h3>
                  <div className="space-y-3">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.quantity} × {item.name}
                          </div>
                          {item.color && item.size && (
                            <div className="text-sm text-gray-500">
                              {item.color}, {item.size}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            €{(Number(item.price) * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            €{Number(item.price).toFixed(2)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="space-y-3">
            <p className="text-gray-600 text-sm text-center">
              A confirmation email has been sent to your registered email address.
              You can track your order status in your account.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-center hover:bg-blue-700"
              >
                View All Orders
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  <HomeIcon className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  href="/products"
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  Shop More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export component with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}

// Prevents prerendering
export const dynamic = 'force-dynamic';