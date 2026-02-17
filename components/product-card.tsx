// components/product-card.tsx - FIXED VERSION
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { PlaceholderImage } from "./placeholder-image";
import { ProductRating } from '@/components/ProductRating';


interface Product {
  id: string;           // Database ID
  stripeId: string;     // Stripe ID
  name: string;
  description: string | null;
  price: number;        // Should be in euros
  images: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

interface Props {
  product: Product;
}


 

export const ProductCard = ({ product }: Props) => {
  const { items, addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

 console.log('ProductCard received product:', {
    idFromDB: product.id,          // This should be database ID
    idFromStripeId: product.stripeId, // This should be Stripe ID
    nameOfProduct: product.name,
    // Log all properties
    ...product
  });
  

  // Get user ID on component mount
  useEffect(() => {
    const getUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            setUserId(user.id);
            console.log('User ID found:', user.id);
          } else {
            console.warn('User object found but no ID:', user);
          }
        } else {
          console.warn('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    };
    
    getUser();
  }, []);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (userId) {
      checkWishlistStatus();
    }
  }, [product.id, userId]);

  const checkWishlistStatus = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/wishlist?check=true&productId=${product.id}`, {
        headers: {
          'x-user-id': userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.isInWishlist);
      } else if (response.status === 401) {
        console.log('User not authenticated for wishlist check');
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Check if user is logged in
      if (!userId) {
        alert('Please login to add items to wishlist');
        // Optionally redirect to login page
        // router.push('/login');
        return;
      }

      setLoadingWishlist(true);

      if (isWishlisted) {
        // Remove from wishlist - use database id
        const response = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': userId,
          },
        });

        if (response.ok) {
          setIsWishlisted(false);
          alert('Removed from wishlist!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist - use databaseId
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ 
            productId: product.id, // Send database id
          }),
        });

        if (response.ok) {
          setIsWishlisted(true);
          alert('Added to wishlist!');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add to wishlist');
        }
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setLoadingWishlist(false);
    }
  };

  const onAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsAddingToCart(true);
      
      // Ensure price is a valid number
      const productPrice = typeof product.price === 'number' && !isNaN(product.price) 
        ? product.price 
        : 0;
      
      console.log('Adding to cart:', {
        id: product.id,
        name: product.name,
        price: productPrice,
        image: product.images?.[0],
        color:'black',
        size:'m'
      });
      
      addItem({
        id: product.id, // Use database ID for cart
        name: product.name,
        price: productPrice, // Already in euros
        imageUrl: product.images?.[0] || '',
        quantity: 1,
        color: 'black',
        size: 'm',
      });
      
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setIsAddingToCart(false);
    }
  };

  // Handle NaN price display
  const displayPrice = () => {
    const price = product.price;
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('Invalid price for product:', product.id, product.name, price);
      return '€0.00';
    }
    return `€${price.toFixed(2)}`;
  };

  // Login button for when user is not logged in
  const renderWishlistButton = () => {
    if (!userId) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert('Please login to use wishlist');
            // You can add login redirect here
          }}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Login to add to wishlist"
          title="Login to add to wishlist"
        >
          <HeartIcon className="h-5 w-5 text-gray-400" />
        </button>
      );
    }

    return (
      <button
        onClick={handleAddToWishlist}
        disabled={loadingWishlist}
        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {loadingWishlist ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
        ) : isWishlisted ? (
          <HeartIconSolid className="h-5 w-5 text-red-500" />
        ) : (
          <HeartIcon className="h-5 w-5 text-gray-700" />
        )}
      </button>
    );
  };

  return (
    <div className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
           <PlaceholderImage />
          )}
          
          {/* Category Badge */}
          {product.metadata?.category && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-red-900 rounded-full">
                {product.metadata.category}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-red-900 mb-1 line-clamp-1 group-hover:text-red-800 transition-colors">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-blue-600">
                {displayPrice()}
              </p>
              {quantity > 0 && (
                <div className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {quantity} in cart
                </div>
              )}
            </div>
            
            <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
              View details →
            </span>
          </div>
        </div>
      </Link>
      
      {/*display ratings */}
       {/*  <section className="mt-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <ProductRating productId={product.id} />
          </div>
        </section> */}

      {/* Action Buttons (Outside Link) */}
      <div className="absolute top-3 right-3">
        {renderWishlistButton()}
      </div>
      
      <div className="absolute top-3 left-3">
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          size="sm"
          className="flex items-center gap-1 bg-white text-gray-900 hover:bg-gray-100 font-medium shadow-md disabled:opacity-50"
        >
          {isAddingToCart ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              <span className="text-sm">Adding...</span>
            </>
          ) : (
            <>
              <div className="relative">
                <ShoppingBagIcon className="h-4 w-4" />
                <PlusIcon className="h-2 w-2 absolute -top-0.5 -right-0.5" />
              </div>
              <span className="text-sm">Add</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};