// components/product-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { PlaceholderImage } from "./placeholder-image";

interface ProductVariant {
  id: string;
  color: string;
  size: string;
  stock: number;
}

interface Product {
  id: string;
  stripeId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  availableColors?: string[];
  availableSizes?: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

interface Props {
  product: Product;
  priority?: boolean;
}

export const ProductCard = ({ product, priority = false }: Props) => {
  const { items, addItem } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const cartItem = items.find((item) => item.id === product.id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // Fetch variants for this product
  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoadingVariants(true);
        const response = await fetch(`/api/admin/products/${product.id}/variants`);
        if (response.ok) {
          const data = await response.json();
          setVariants(data.variants || []);
          
          // Select first available variant with stock > 0
          const availableVariant = data.variants?.find((v: ProductVariant) => v.stock > 0);
          if (availableVariant) {
            setSelectedVariant(availableVariant);
          }
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
      } finally {
        setLoadingVariants(false);
      }
    };
    
    fetchVariants();
  }, [product.id]);

  // Get user ID on component mount
  useEffect(() => {
    const getUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            setUserId(user.id);
          }
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    };
    
    getUser();
  }, []);

  // Check if product is in wishlist
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
        }
      }
    } catch (error: any) {
      console.error('Error updating wishlist:', error);
      alert(error.message || 'Failed to update wishlist');
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Check if product has any stock available
  const hasAvailableStock = () => {
    if (loadingVariants) return true;
    if (variants.length === 0) return true;
    return variants.some(v => v.stock > 0);
  };

  // Get current selected variant stock
  const getCurrentStock = () => {
    if (selectedVariant) return selectedVariant.stock;
    if (variants.length === 0) return 999;
    return 0;
  };

  const currentStock = getCurrentStock();
  const remainingStock = currentStock - cartQuantity;
  const isOutOfStock = !hasAvailableStock();
  const isMaxReached = cartQuantity >= currentStock;

  const increaseQuantity = () => {
    if (quantity < remainingStock) {
      setQuantity(prev => prev + 1);
    } else {
      alert(`Maximum ${remainingStock} items available (you already have ${cartQuantity} in cart)`);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val)) {
      setQuantity(1);
    } else if (val < 1) {
      setQuantity(1);
    } else if (val > remainingStock) {
      setQuantity(remainingStock);
      alert(`Maximum ${remainingStock} items available (you already have ${cartQuantity} in cart)`);
    } else {
      setQuantity(val);
    }
  };

  const onAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      alert('Sorry, this product is out of stock!');
      return;
    }
    
    if (isMaxReached) {
      alert(`You've already reached the maximum stock (${currentStock} items) for this product`);
      return;
    }
    
    // If multiple variants exist, show selector
    if (variants.length > 1) {
      setQuantity(1); // Reset quantity when opening selector
      setShowVariantSelector(true);
      return;
    }
    
    // If we have a single variant with stock
    if (variants.length === 1 && variants[0].stock > 0) {
      addToCart(variants[0]);
    } else if (variants.length === 0) {
      // No variants - add with defaults
      addToCart(null);
    } else {
      alert('No stock available');
    }
  };

  const addToCart = (variant: ProductVariant | null) => {
    // Final stock check
    if (variant && variant.stock <= 0) {
      alert('This item is out of stock!');
      return;
    }
    
    // Check if trying to add more than remaining stock
    if (quantity > remainingStock) {
      alert(`Maximum ${remainingStock} items available. Please reduce quantity.`);
      setQuantity(remainingStock > 0 ? remainingStock : 0);
      return;
    }
    
    if (quantity < 1) {
      alert('Please select at least 1 item');
      return;
    }
    
    try {
      setIsAddingToCart(true);
      
      const productPrice = typeof product.price === 'number' && !isNaN(product.price) 
        ? product.price 
        : 0;
      
      // Add items based on quantity
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: productPrice,
          imageUrl: product.images?.[0] || '',
          quantity: 1,
          color: variant?.color || product.availableColors?.[0] || 'default',
          size: variant?.size || product.availableSizes?.[0] || 'one-size',
        });
      }
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsAddingToCart(false);
        setShowVariantSelector(false);
        setQuantity(1); // Reset quantity after adding
      }, 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setIsAddingToCart(false);
    }
  };

  const displayPrice = () => {
    const price = product.price;
    if (typeof price !== 'number' || isNaN(price)) {
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

  return (
    <>
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
                priority={priority}
              />
            ) : (
              <PlaceholderImage />
            )}
            
            {/* Show OUT OF STOCK badge */}
            {isOutOfStock && (
              <div className="absolute top-3 left-3 z-20">
                <span className="px-3 py-1.5 text-xs font-medium uppercase bg-red-900/90 backdrop-blur-sm text-white rounded-full shadow-lg border border-red-500">
                  Out of Stock
                </span>
              </div>
            )}
            
            {/* Show MAX REACHED badge */}
            {!isOutOfStock && isMaxReached && (
              <div className="absolute top-3 left-3 z-20">
                <span className="px-3 py-1.5 text-xs font-medium uppercase bg-amber-600/90 backdrop-blur-sm text-white rounded-full shadow-lg border border-amber-400">
                  Max Reached
                </span>
              </div>
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
                  <p className={`text-xl font-serif font-medium ${isOutOfStock ? 'text-gray-400 line-through' : 'text-amber-700'}`}>
                    {displayPrice()}
                  </p>
                  {cartQuantity > 0 && (
                    <div className="bg-amber-100 text-amber-800 text-[10px] font-medium px-2 py-0.5 rounded-full border border-amber-200">
                      {cartQuantity} in cart
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
        </div>
        
        {/* Add to Cart Button with Quantity - Shows on hover */}
        {!isOutOfStock && !isMaxReached && (
          <div className="absolute bottom-20 left-5 right-5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-amber-100">
              {/* Quantity Selector */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-red-900 font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      decreaseQuantity();
                    }}
                    disabled={quantity <= 1}
                    className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 disabled:opacity-50"
                  >
                    <MinusIcon className="h-3 w-3" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    min="1"
                    max={remainingStock}
                    className="text-sm font-medium text-red-900 w-12 text-center border border-amber-200 rounded-lg py-1 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      increaseQuantity();
                    }}
                    disabled={quantity >= remainingStock}
                    className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center hover:bg-amber-200 disabled:opacity-50"
                  >
                    <PlusIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              {/* Stock info */}
              <p className="text-[10px] text-gray-500 mb-2">
                {remainingStock > 0 ? `${remainingStock} available to add` : 'Out of stock'}
                {cartQuantity > 0 && ` (${cartQuantity} in cart)`}
              </p>
              
              {/* Add Button */}
              <Button
                onClick={onAddToCart}
                disabled={isAddingToCart || remainingStock === 0}
                size="sm"
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-light tracking-wide py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span className="text-xs">Adding {quantity}...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-3.5 w-3.5" />
                    <span className="text-xs uppercase tracking-wider">
                      Add {quantity > 1 ? `${quantity} × ` : ''}to Cart
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 via-red-400 to-amber-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>

      {/* Success Message Toast */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
          ✅ Added {quantity} item{quantity > 1 ? 's' : ''} to cart!
        </div>
      )}

      {/* Variant Selector Modal with Quantity */}
      {showVariantSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-serif font-bold text-red-900 mb-4">
                Select {product.name}
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {variants.map((variant) => {
                  const variantCartItem = items.find(
                    (item) => item.id === product.id && item.color === variant.color && item.size === variant.size
                  );
                  const variantCartQuantity = variantCartItem?.quantity || 0;
                  const variantRemainingStock = variant.stock - variantCartQuantity;
                  const isVariantOutOfStock = variant.stock === 0;
                  const isVariantMaxReached = variantCartQuantity >= variant.stock;
                  
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        if (!isVariantOutOfStock && !isVariantMaxReached) {
                          setSelectedVariant(variant);
                          setShowVariantSelector(false);
                          // Reset quantity before adding
                          setQuantity(1);
                          // After selection, show the add to cart with quantity
                          setTimeout(() => {
                            const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
                            onAddToCart(fakeEvent);
                          }, 100);
                        }
                      }}
                      disabled={isVariantOutOfStock || isVariantMaxReached}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${
                        !isVariantOutOfStock && !isVariantMaxReached
                          ? 'hover:border-amber-500 hover:bg-amber-50 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-red-900 capitalize">
                          {variant.color} - Size {variant.size.toUpperCase()}
                        </p>
                        <p className={`text-sm ${!isVariantOutOfStock && !isVariantMaxReached ? 'text-green-600' : 'text-red-500'}`}>
                          {isVariantOutOfStock 
                            ? 'Out of stock' 
                            : isVariantMaxReached 
                            ? 'Max reached in cart' 
                            : `${variantRemainingStock} available`}
                        </p>
                        {variantCartQuantity > 0 && !isVariantOutOfStock && (
                          <p className="text-xs text-amber-600">
                            {variantCartQuantity} already in cart
                          </p>
                        )}
                      </div>
                      <p className="text-amber-700 font-semibold">{displayPrice()}</p>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowVariantSelector(false)}
                className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};