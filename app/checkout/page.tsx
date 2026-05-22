// app/checkout/page.tsx - With NIF input field added (original functionality preserved)

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, LogIn, CreditCard, AlertCircle, RefreshCw } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, addItem, getTotalPrice, getTotalQuantity } = useCartStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userNif, setUserNif] = useState(""); // Keep for potential future use
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [validatingStock, setValidatingStock] = useState(false);
  const [stockIssues, setStockIssues] = useState<{ itemId: string; message: string }[]>([]);
  const [customerNif, setCustomerNif] = useState(""); // ✅ ADDED: NIF state

  // Check authentication status
  const checkAuth = () => {
    const userStr = localStorage.getItem("user");
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserEmail(user.email || "");
        setUserNif(user.nif || "");
        return true;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    return false;
  };

  // Validate stock for all cart items (without auto-fixing)
  const validateCartStock = async () => {
    setValidatingStock(true);
    const issues: { itemId: string; message: string }[] = [];
    
    for (const item of items) {
      try {
        const response = await fetch(`/api/admin/products/${item.id}/variants`);
        if (response.ok) {
          const data = await response.json();
          const variants = data.variants || [];
          
          const variant = variants.find(
            (v: any) => v.color === item.color && v.size === item.size
          );
          
          if (variant) {
            const availableStock = variant.stock;
            const cartQuantity = item.quantity;
            
            if (cartQuantity > availableStock) {
              issues.push({
                itemId: `${item.id}-${item.color}-${item.size}`,
                message: `${item.name} (${item.color}, ${item.size.toUpperCase()}): You have ${cartQuantity} in cart but only ${availableStock} available.`,
              });
            } else if (availableStock === 0) {
              issues.push({
                itemId: `${item.id}-${item.color}-${item.size}`,
                message: `${item.name} (${item.color}, ${item.size.toUpperCase()}): This item is now out of stock.`,
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error validating stock for ${item.id}:`, error);
      }
    }
    
    setStockIssues(issues);
    setValidatingStock(false);
    
    return issues.length === 0;
  };

  // Validate stock when cart items change
  useEffect(() => {
    if (items.length > 0) {
      validateCartStock();
    } else {
      setStockIssues([]);
    }
  }, [items]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const handleProceedToPayment = async () => {
    console.log("Proceed to payment clicked");
    setError("");
    
    // Re-validate stock before proceeding
    const isValid = await validateCartStock();
    
    if (!isValid) {
      setError("Some items in your cart have stock issues. Please update quantities.");
      return;
    }
    
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
      
      // ✅ UPDATED: Include NIF in the request body
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items,
          customerNif: customerNif, // ✅ Send NIF to API
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      
      if (data.url) {
        console.log("Redirecting to Stripe:", data.url);
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

  // Handle decrease quantity - KEEP ORIGINAL FUNCTIONALITY
  const handleDecrease = (item: typeof items[0]) => {
    removeItem(item.id, item.color, item.size);
  };

  // Handle increase quantity - WITH stock check
  const handleIncrease = async (item: typeof items[0]) => {
    // Check stock before adding
    try {
      const response = await fetch(`/api/admin/products/${item.id}/variants`);
      if (response.ok) {
        const data = await response.json();
        const variant = data.variants?.find(
          (v: any) => v.color === item.color && v.size === item.size
        );
        
        if (variant) {
          const cartQuantity = items.find(
            i => i.id === item.id && i.color === item.color && i.size === item.size
          )?.quantity || 0;
          
          if (cartQuantity + 1 > variant.stock) {
            setError(`Cannot add more. Only ${variant.stock} items available.`);
            setTimeout(() => setError(""), 3000);
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error checking stock:", error);
    }
    
    addItem({
      ...item,
      quantity: 1,
    });
  };

  // Handle remove entire item - KEEP ORIGINAL FUNCTIONALITY
  const handleRemoveAll = (item: typeof items[0]) => {
    for (let i = 0; i < item.quantity; i++) {
      removeItem(item.id, item.color, item.size);
    }
  };

  const total = getTotalPrice();
  const totalItemsCount = getTotalQuantity();
  const hasStockIssues = stockIssues.length > 0;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-amber-300 mb-4" />
        <h1 className="text-3xl font-bold text-red-900 mb-4">Your Cart is Empty</h1>
        <p className="text-red-800 mb-8">Add some items to your cart before checking out</p>
        <Button 
          onClick={() => router.push('/products')}
          className="bg-red-900 text-white hover:bg-amber-700 transition-colors"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-red-900 mb-2">Checkout</h1>
        <p className="text-red-800">
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
        
        {/* Stock Issues Warning - READ ONLY, NO AUTO-FIX */}
        {hasStockIssues && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">Stock Issues Detected</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {stockIssues.map((issue, index) => (
                    <li key={index}>• {issue.message}</li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600 mt-2">
                  Please adjust quantities or remove items before proceeding.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Authentication Status */}
        {isAuthenticated ? (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span>Logged in as: <span className="font-semibold">{userEmail}</span></span>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
            <LogIn className="h-4 w-4" />
            <span>You'll need to login to complete your purchase</span>
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary Card */}
        <Card className="md:col-span-2 bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
          <CardHeader className="border-b border-amber-100">
            <CardTitle className="text-xl font-serif font-bold text-red-900">
              Order Summary
              <div className="text-sm font-light text-red-800 mt-1">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {validatingStock && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-3"></div>
                <p className="text-sm text-amber-600">Validating stock availability...</p>
              </div>
            )}
            
            <ul className="space-y-4">
              {items.map((item) => {
                const hasIssue = stockIssues.some(
                  issue => issue.itemId === `${item.id}-${item.color}-${item.size}`
                );
                
                return (
                  <li 
                    key={`${item.id}-${item.color}-${item.size}`}
                    className={`flex flex-col gap-2 border-b pb-4 last:border-b-0 transition-all ${
                      hasIssue ? 'border-red-200 bg-red-50/30 -mx-2 px-2 rounded-lg' : 'border-amber-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      {item.imageUrl ? (
                        <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border border-amber-200">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                          <span className="text-xs text-amber-400">No image</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-serif font-medium text-red-900">{item.name}</span>
                            <div className="text-sm text-red-800 mt-1">
                              <span className="font-semibold capitalize">{item.color}</span> • 
                              <span className="font-semibold uppercase ml-1">{item.size}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-serif font-semibold block ${hasIssue ? 'text-red-500 line-through' : 'text-amber-700'}`}>
                              €{Number(item.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-sm text-red-800">
                              €{Number(item.price).toFixed(2)} × {item.quantity}
                            </span>
                          </div>
                        </div>
                        
                        {hasIssue && (
                          <p className="text-xs text-red-600 mt-1">
                            ⚠️ Stock issue - please remove or reduce quantity
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecrease(item)}
                              className="h-8 w-8 p-0 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-700"
                              disabled={item.quantity <= 1}
                            >
                              –
                            </Button>
                            <span className="text-lg font-serif font-semibold w-8 text-center text-red-900">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleIncrease(item)}
                              className="h-8 w-8 p-0 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-700"
                            >
                              +
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAll(item)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        
        {/* Payment Card */}
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm border-amber-100/50 shadow-xl">
            <CardHeader className="border-b border-amber-100">
              <CardTitle className="text-xl font-serif font-bold text-red-900">Order Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-red-800">
                  <span>Subtotal</span>
                  <span className="font-medium text-red-900">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-red-800">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="border-t border-amber-100 pt-3">
                  <div className="flex justify-between text-lg font-serif font-bold">
                    <span className="text-red-900">Total</span>
                    <span className="text-amber-700">€{total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-red-800 mt-1">
                    VAT included
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* ✅ ADDED: NIF Input Field */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-amber-100">
            <label htmlFor="nif" className="block text-sm font-medium text-red-900 mb-1">
              NIF / VAT Number <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="nif"
              name="nif"
              value={customerNif}
              onChange={(e) => setCustomerNif(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="123456789"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for Portuguese customers who need a fiscal invoice
            </p>
          </div>
          
          {isAuthenticated ? (
            <Button 
              type="button"
              variant="default" 
              className={`w-full py-6 text-lg transition-colors ${
                hasStockIssues || validatingStock
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-900 text-white hover:bg-amber-700'
              }`}
              size="lg"
              onClick={handleProceedToPayment}
              disabled={isProcessing || items.length === 0 || hasStockIssues || validatingStock}
            >
              {isProcessing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : hasStockIssues ? (
                <>
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Resolve Stock Issues
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
              className="w-full bg-red-900 text-white hover:bg-amber-700 transition-colors py-6 text-lg" 
              size="lg"
              onClick={() => {
                localStorage.setItem("pending-checkout-items", JSON.stringify(items));
                const callbackUrl = encodeURIComponent("/checkout");
                router.push(`/login?callbackUrl=${callbackUrl}`);
              }}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Login to Proceed
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            onClick={() => router.push('/cart')}
          >
            Back to Cart
          </Button>
          
          <div className="text-xs text-red-800 space-y-1 text-center">
            <p>By completing your purchase, you agree to our Terms of Service.</p>
            <p>Your payment is secured with Stripe.</p>
          </div>
          
          {!isAuthenticated && (
            <div className="p-4 bg-amber-50/80 backdrop-blur-sm rounded-lg border border-amber-200">
              <h3 className="font-serif font-medium text-red-900 mb-2">Guest Checkout</h3>
              <p className="text-sm text-red-800 mb-3">
                Create an account for faster checkout and order tracking.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-700"
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