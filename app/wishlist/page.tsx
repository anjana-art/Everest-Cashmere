// app/wishlist/page.tsx - COMPLETELY UPDATED VERSION
'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, ShoppingBagIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number; // Already in euros from database
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
      
      // Price is already in euros from database
      const priceInEuros = product.price;
      
      console.log('Adding to cart from wishlist:', {
        productId: product.id,
        name: product.name,
        price: priceInEuros,
        color: 'black',
        size: 'm'
      });
      
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <HeartIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-600 mb-8">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-950 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Price</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Added On</th>
                  <th className="text-left p-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wishlistItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-blue-600">
                        €{Number(item.product.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-gray-600">
                        {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveToCart(item)}
                          disabled={addingToCart.includes(item.product.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            addingToCart.includes(item.product.id)
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:opacity-70`}
                        >
                          {addingToCart.includes(item.product.id) ? (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              Added
                            </>
                          ) : (
                            <>
                              <ShoppingBagIcon className="h-4 w-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product.id, item.product.stripeId)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Total value: <span className="font-bold text-gray-900">
                  €{Number(wishlistItems.reduce((sum, item) => sum + Number(item.product.price), 0)).toFixed(2)}
                </span>
              </span>
              <div className="flex gap-3">
                <button
                  onClick={moveAllToCart}
                  disabled={addingToCart.length > 0}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    addingToCart.length > 0
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-70`}
                >
                  {addingToCart.length > 0 ? 'Adding All...' : 'Add All to Cart'}
                </button>
                <button
                  onClick={clearWishlist}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}