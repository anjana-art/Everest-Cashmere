// app/checkout/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { checkoutAction } from "./checkout-action";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, LogIn, CreditCard, AlertCircle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, addItem, getTotalPrice, getTotalQuantity } = useCartStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Check authentication status
  const checkAuth = () => {
    // Check localStorage (your existing method)
    const userStr = localStorage.getItem("user");
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserEmail(user.email || "");
        return true;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return false;
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // In your app/checkout/page.tsx
const handleProceedToPayment = async () => {
  console.log("Proceed to payment clicked");
  setError("");
  
  // Check authentication
  if (!checkAuth()) {
    localStorage.setItem("pending-checkout-items", JSON.stringify(items));
    const callbackUrl = encodeURIComponent("/checkout");
    router.push(`/login?callbackUrl=${callbackUrl}`);
    return;
  }
  
  setIsProcessing(true);
  
  try {
    console.log("Sending items to checkout API:", items.length);
    
    // Call the API route
    const response = await fetch('/api/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Checkout failed');
    }
    
    if (data.url) {
      console.log("Redirecting to Stripe:", data.url);
      // This will always work for external URLs
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
    
  } catch (error: any) {
    console.error("Checkout error:", error);
    setError(error.message || 'Failed to process payment. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};


  

  const total = getTotalPrice();
  const totalItemsCount = getTotalQuantity();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some items to your cart before checking out</p>
        <Button onClick={() => router.push('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  // Handle decrease quantity
  const handleDecrease = (item: typeof items[0]) => {
    removeItem(item.id, item.color, item.size);
  };

  // Handle increase quantity
  const handleIncrease = (item: typeof items[0]) => {
    addItem({
      ...item,
      quantity: 1,
    });
  };

  // Handle remove entire item
  const handleRemoveAll = (item: typeof items[0]) => {
    for (let i = 0; i < item.quantity; i++) {
      removeItem(item.id, item.color, item.size);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">
          Review your order before proceeding to payment
        </p>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Authentication Status */}
        {isAuthenticated ? (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>Logged in as: <span className="font-semibold">{userEmail}</span></span>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg">
            <LogIn className="h-4 w-4" />
            <span>You'll need to login to complete your purchase</span>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Order Summary
              <div className="text-sm font-normal text-gray-600 mt-1">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {items.map((item) => (
                <li 
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="flex flex-col gap-2 border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    {item.imageUrl ? (
                      <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-gray-500">No image</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold capitalize">{item.color}</span> • 
                            <span className="font-semibold uppercase ml-1">{item.size}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold block">
                            €{Number(item.price * item.quantity).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            €{Number(item.price).toFixed(2)} × {item.quantity}
                          </span>
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecrease(item)}
                            className="h-8 w-8 p-0"
                            disabled={item.quantity <= 1}
                          >
                            –
                          </Button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIncrease(item)}
                            className="h-8 w-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAll(item)}
                          className="text-red-500 hover:text-red-700 h-8 px-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Payment Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Order Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    VAT included
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        
        
            
           {isAuthenticated ? (
    <Button 
    type="button"
    variant="default" 
    className="w-full" 
    size="lg"
    onClick={handleProceedToPayment}
    disabled={isProcessing || items.length === 0}
  >
    {isProcessing ? (
      <>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
        Processing...
      </>
    ) : (
      <>
        <CreditCard className="mr-2 h-5 w-5" />
        Proceed to Payment
      </>
    )}
  </Button>
  
  ) : (
    <Button 
      type="button"
      variant="default" 
      className="w-full" 
      size="lg"
      onClick={() => {
        localStorage.setItem("pending-checkout-items", JSON.stringify(items));
        const callbackUrl = encodeURIComponent("/checkout");
        router.push(`/login?callbackUrl=${callbackUrl}`);
      }}
    >
      <LogIn className="mr-2 h-4 w-4" />
      Login to Proceed
    </Button>
  )}
  
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/cart')}
          >
            Back to Cart
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>By completing your purchase, you agree to our Terms of Service.</p>
            <p>Your payment is secured with Stripe.</p>
          </div>
          
          {/* Alternative for non-authenticated users */}
          {!isAuthenticated && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium mb-2">Guest Checkout</h3>
              <p className="text-sm text-gray-600 mb-3">
                Create an account for faster checkout and order tracking.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  const callbackUrl = encodeURIComponent("/checkout");
                  router.push(`/signup?callbackUrl=${callbackUrl}`);
                }}
              >
                Create Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}