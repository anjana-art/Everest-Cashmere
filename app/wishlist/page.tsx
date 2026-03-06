// app/wishlist/page.tsx - FULLY RESPONSIVE LUXURY EDITION
'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, ShoppingBagIcon, TrashIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stripeId: string;
  };
  addedAt: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState<string[]>([]);
  
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        setError('Please login to view wishlist');
        return;
      }

      const response = await fetch('/api/wishlist', {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      setWishlistItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string, stripeId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    } catch (err: any) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item');
    }
  };

  const moveToCart = async (wishlistItem: WishlistItem) => {
    try {
      const { product } = wishlistItem;
      
      setAddingToCart(prev => [...prev, product.id]);
      
      const priceInEuros = product.price;
      
      addItem({
        id: product.id,
        name: product.name,
        price: priceInEuros,
        imageUrl: product.images?.[0] || '',
        quantity: 1,
        color: 'black',
        size: 'm',
      });
      
      setTimeout(() => {
        setAddingToCart(prev => prev.filter(id => id !== product.id));
      }, 2000);
      
    } catch (err: any) {
      console.error('Error moving to cart:', err);
      alert('Failed to add item to cart');
      setAddingToCart(prev => prev.filter(id => id !== wishlistItem.product.id));
    }
  };

  const moveAllToCart = async () => {
    try {
      setAddingToCart(wishlistItems.map(item => item.product.id));
      
      wishlistItems.forEach(item => {
        addItem({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.images?.[0] || '',
          quantity: 1,
          color: 'black',
          size: 'm',
        });
      });
      
      alert(`Added ${wishlistItems.length} items to cart!`);
      
      setTimeout(() => {
        setAddingToCart([]);
      }, 2000);
      
    } catch (err: any) {
      console.error('Error moving all to cart:', err);
      alert('Failed to add some items to cart');
      setAddingToCart([]);
    }
  };

  const clearWishlist = async () => {
    if (confirm('Clear all items from wishlist?')) {
      try {
        for (const item of wishlistItems) {
          await removeFromWishlist(item.product.id, item.product.stripeId);
        }
        setWishlistItems([]);
      } catch (err) {
        console.error('Error clearing wishlist:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-b-2 border-red-900 mx-auto"></div>
              <SparklesIcon className="h-5 sm:h-6 w-5 sm:w-6 text-amber-400 absolute top-3 sm:top-5 left-3 sm:left-5 animate-pulse" />
            </div>
            <p className="mt-4 sm:mt-6 text-red-900 font-light text-sm sm:text-base tracking-wide">
              Curating your luxury wishlist...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 border border-amber-100/50">
            <div className="relative inline-block mb-6 sm:mb-8">
              <HeartIcon className="h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 text-amber-200 mx-auto" />
              <SparklesIcon className="h-5 sm:h-6 md:h-8 w-5 sm:w-6 md:w-8 text-amber-400 absolute -top-1 sm:-top-2 -right-1 sm:-right-2 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-red-900 mb-3 sm:mb-4">
              Your Wishlist Awaits
            </h1>
            <p className="text-red-800 mb-6 sm:mb-8 font-light text-sm sm:text-base max-w-md mx-auto px-4">
              Begin your journey of discovery. Save the pieces that speak to your soul.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 sm:gap-3 bg-red-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base font-medium hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <ShoppingBagIcon className="h-4 sm:h-5 w-4 sm:w-5 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">Explore Collection</span>
              <span className="text-lg sm:text-xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Responsive Design */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-red-900 mb-2 tracking-tight">
                My Wishlist
              </h1>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-0.5 w-8 sm:w-10 md:w-12 bg-gradient-to-r from-amber-300 to-red-900 rounded-full"></div>
                <p className="text-red-800 font-light text-sm sm:text-base">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'treasured piece' : 'treasured pieces'}
                </p>
              </div>
            </div>
            
            {/* Total Value Badge - Responsive */}
            <div className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md border border-amber-100">
              <span className="text-xs sm:text-sm text-red-900 font-light mr-1 sm:mr-2">
                Collection value:
              </span>
              <span className="text-base sm:text-lg md:text-xl font-serif font-medium text-amber-700">
                €{Number(wishlistItems.reduce((sum, item) => sum + Number(item.product.price), 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Card View (hidden on desktop) */}
        <div className="block lg:hidden space-y-4">
          {wishlistItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-amber-100/50 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-red-50 flex-shrink-0 border border-amber-200">
                    {item.product.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300">
                        <HeartIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-medium text-red-900 text-base sm:text-lg truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-red-950 font-light mt-1">Luxury edition</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-serif text-lg sm:text-xl font-medium text-amber-700">
                        €{Number(item.product.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-red-800">
                        {new Date(item.addedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons - Mobile */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => moveToCart(item)}
                    disabled={addingToCart.includes(item.product.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      addingToCart.includes(item.product.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-red-900 text-white hover:bg-amber-700'
                    } disabled:opacity-70`}
                  >
                    {addingToCart.includes(item.product.id) ? (
                      <>
                        <CheckIcon className="h-4 w-4" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBagIcon className="h-4 w-4" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.product.id, item.product.stripeId)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all duration-300 border border-red-200"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (hidden on mobile/tablet) */}
        <div className="hidden lg:block bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-amber-100/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-red-50 border-b border-amber-100">
                <tr>
                  <th className="text-left p-6 font-serif font-medium text-red-900 tracking-wide">Product</th>
                  <th className="text-left p-6 font-serif font-medium text-red-900 tracking-wide">Price</th>
                  <th className="text-left p-6 font-serif font-medium text-red-900 tracking-wide">Added On</th>
                  <th className="text-left p-6 font-serif font-medium text-red-900 tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {wishlistItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-amber-50/50 transition-all duration-300">
                    <td className="p-6">
                      <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-red-50 flex-shrink-0 border border-amber-200 shadow-sm group-hover:shadow-md transition-all">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-amber-300">
                              <HeartIcon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-serif font-medium text-red-900 group-hover:text-amber-700 transition-colors">
                            {item.product.name}
                          </h3>
                          <p className="text-xs text-red-950 font-light mt-1">Luxury edition</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-serif text-xl font-medium text-amber-700">
                        €{Number(item.product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-red-800 font-light">
                        {new Date(item.addedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-3">
                        <button
                          onClick={() => moveToCart(item)}
                          disabled={addingToCart.includes(item.product.id)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                            addingToCart.includes(item.product.id)
                              ? 'bg-green-600 text-white shadow-lg scale-105'
                              : 'bg-red-900 text-white hover:bg-amber-700 hover:shadow-lg hover:scale-105'
                          } disabled:opacity-70 group/btn`}
                        >
                          {addingToCart.includes(item.product.id) ? (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              <span className="tracking-wide">Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBagIcon className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                              <span className="tracking-wide">Add to Cart</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product.id, item.product.stripeId)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 rounded-full font-medium hover:bg-red-50 transition-all duration-300 border border-red-200 hover:border-amber-300 hover:shadow-md group/remove"
                        >
                          <TrashIcon className="h-4 w-4 group-hover/remove:scale-110 transition-transform" />
                          <span className="tracking-wide">Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions - Responsive */}
        <div className="mt-6 lg:mt-8 bg-gradient-to-r from-amber-50/80 to-red-50/80 rounded-xl lg:rounded-2xl p-4 sm:p-6 border border-amber-100 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <SparklesIcon className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500" />
              <span className="text-sm sm:text-base text-red-900 font-light">
                <span className="font-serif font-medium">{wishlistItems.length}</span> items in your collection
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={moveAllToCart}
                disabled={addingToCart.length > 0}
                className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 shadow-md hover:shadow-xl ${
                  addingToCart.length > 0
                    ? 'bg-green-600 text-white'
                    : 'bg-red-900 text-white hover:bg-amber-700'
                } disabled:opacity-70 flex items-center justify-center gap-2`}
              >
                {addingToCart.length > 0 ? (
                  <>
                    <CheckIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                    <span>Adding All...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-4 sm:h-5 w-4 sm:w-5" />
                    <span>Add All to Cart</span>
                  </>
                )}
              </button>
              <button
                onClick={clearWishlist}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-amber-200 text-red-900 rounded-full text-sm sm:text-base font-medium hover:bg-white/50 transition-all duration-300 hover:border-amber-300 hover:shadow-md"
              >
                Clear Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Continue Shopping Link */}
        <div className="mt-6 sm:mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-red-900 hover:text-amber-700 transition-colors group text-sm sm:text-base"
          >
            <span className="text-lg sm:text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-light tracking-wide">Continue Exploring</span>
          </Link>
        </div>
      </div>
    </div>
  );
}