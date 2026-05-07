// components/product-card.tsx - IMAGE OPTIMIZATION FIXED (removed quality prop)

"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { PlaceholderImage } from "./placeholder-image";

interface Product {
  id: string;
  stripeId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

interface Props {
  product: Product;
  priority?: boolean; // ✅ Added priority prop
}

export const ProductCard = ({ product, priority = false }: Props) => {
  const { items, addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const cartItem = items.find((item) => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  console.log('ProductCard received product:', {
    idFromDB: product.id,
    idFromStripeId: product.stripeId,
    nameOfProduct: product.name,
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
      if (!userId) {
        alert('Please login to add items to wishlist');
        return;
      }

      setLoadingWishlist(true);

      if (isWishlisted) {
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
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ 
            productId: product.id,
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
        id: product.id,
        name: product.name,
        price: productPrice,
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

  const displayPrice = () => {
    const price = product.price;
    if (typeof price !== 'number' || isNaN(price)) {
      console.warn('Invalid price for product:', product.id, product.name, price);
      return '€0,00';
    }
    return `€${price.toFixed(2).replace('.', ',')}`;
  };

  const formatProductName = (name: string) => {
    if (!name) return '';
    if (name.length > 30) {
      return name.substring(0, 27) + '...';
    }
    return name;
  };

  const renderWishlistButton = () => {
    if (!userId) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert('Please login to use wishlist');
          }}
          className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-amber-200/50"
          aria-label="Login to add to wishlist"
          title="Login to add to wishlist"
        >
          <HeartIcon className="h-4 w-4 text-red-300" />
        </button>
      );
    }

    return (
      <button
        onClick={handleAddToWishlist}
        disabled={loadingWishlist}
        className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-amber-200/50 disabled:opacity-50"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {loadingWishlist ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-900"></div>
        ) : isWishlisted ? (
          <HeartIconSolid className="h-4 w-4 text-red-500" />
        ) : (
          <HeartIcon className="h-4 w-4 text-red-900" />
        )}
      </button>
    );
  };

  return (
    <div className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer relative border border-amber-100/50">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-red-50">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              // ✅ REMOVED: quality prop (uses Next.js default)
              priority={priority}
            />
          ) : (
            <PlaceholderImage />
          )}
        </div>

        <div className="p-5">
          <h3 className="font-serif text-lg text-red-900 mb-2 line-clamp-1 group-hover:text-amber-700 transition-colors duration-300 tracking-wide">
            {formatProductName(product.name)}
          </h3>
          
          {product.description && (
            <p className="text-sm text-red-950 mb-3 line-clamp-2 font-light italic">
              {product.description}
            </p>
          )}
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-red-950 font-light tracking-wider mb-0.5">PRICE</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-serif font-medium text-amber-700">
                  {displayPrice()}
                </p>
                {quantity > 0 && (
                  <div className="bg-amber-100 text-amber-800 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-200">
                    {quantity} in cart
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-red-900 group-hover:text-amber-600 transition-colors duration-300">
              <span className="text-xs font-light tracking-wide">Discover</span>
              <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="absolute top-4 right-4 z-10">
        {renderWishlistButton()}
      </div>
      
      <div className="absolute bottom-20 left-5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          size="sm"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-light tracking-wide px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-500/50 disabled:opacity-50"
        >
          {isAddingToCart ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span className="text-xs">Adding...</span>
            </>
          ) : (
            <>
              <ShoppingBagIcon className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wider">Add</span>
              <PlusIcon className="h-2.5 w-2.5" />
            </>
          )}
        </Button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 via-red-400 to-amber-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </div>
  );
};