// components/product-detail.tsx - LUXURY EDITION
"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { SimilarProducts } from "./similar-products";

interface Product {
  id: string;           // Database ID
  stripeId: string;     // Stripe ID
  name: string;
  description: string | null;
  price: number;        // Already in euros
  images: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
  availableColors?: string[];
  availableSizes?: string[];
  defaultColor?: string | null;
  defaultSize?: string | null;
  category?: string | null;
}

interface Props {
  product: Product;
}

// Enhanced color mapping for luxury palette
const COLOR_MAP: Record<string, { name: string, class: string, hex?: string }> = {
  'baby-pink': { name: 'Blush Pink', class: 'bg-rose-200 border border-rose-300', hex: '#fbc4c4' },
  'amber-200': { name: 'Champagne', class: 'bg-amber-200 border border-amber-300', hex: '#f7e5c2' },
  'black-300': { name: 'Charcoal', class: 'bg-gray-400 border border-gray-500', hex: '#9ca3af' },
  'gray': { name: 'Pearl Gray', class: 'bg-gray-500 border border-gray-600', hex: '#6b7280' },
  'sky-blue': { name: 'Azure', class: 'bg-blue-300 border border-blue-400', hex: '#93c5fd' },
  'cream': { name: 'Ivory', class: 'bg-amber-50 border border-amber-200', hex: '#fef3c7' },
  'black': { name: 'Onyx', class: 'bg-gray-900 border border-black', hex: '#111827' },
  'green': { name: 'Emerald', class: 'bg-green-600 border border-green-700', hex: '#059669' },
  'yellow-200': { name: 'Saffron', class: 'bg-yellow-300 border border-yellow-400', hex: '#fcd34d' },
  'red-900': { name: 'Burgundy', class: 'bg-red-900 border border-red-950', hex: '#7f1d1d' },
  'burgundy': { name: 'Burgundy', class: 'bg-red-900 border border-red-950', hex: '#7f1d1d' },
  'white': { name: 'Pearl', class: 'bg-white border border-amber-200', hex: '#ffffff' },
};

export const ProductDetail = ({ product }: Props) => {
  const router = useRouter();
  const { items, addItem, removeItem } = useCartStore();
  
  const dbColors = product.availableColors || [];
  const dbSizes = product.availableSizes || [];
  
  const defaultColor = dbColors.length > 0 ? dbColors[0] : "";
  const defaultSize = dbSizes.length > 0 ? dbSizes[0].toLowerCase() : "";
  
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const cartItem = items.find((item) => 
    item.id === product?.id && 
    item.color === selectedColor && 
    item.size === selectedSize
  );
  
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // Get user ID on mount
  useEffect(() => {
    const getUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            setUserId(user.id);
            console.log('User ID found:', user.id);
          }
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    };
    
    getUser();
  }, []);

  // Check wishlist status
  useEffect(() => {
    if (userId && product?.id) {
      checkWishlistStatus();
    }
  }, [product?.id, userId]);

  const checkWishlistStatus = async () => {
    if (!userId || !product?.id) return;
    
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

  const handleAddToWishlist = async () => {
    if (!userId) {
      alert('Please login to add to wishlist');
      return;
    }

    if (!product?.id) {
      alert('Product data incomplete');
      return;
    }

    try {
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
          body: JSON.stringify({ productId: product.id }),
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

  const careDescription = "Machine wash cold with similar colors. Tumble dry low. Do not bleach. Iron on low heat if needed.";

  const onAddItem = () => {
    if (!product) {
      alert('Product data is missing');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0] || '',
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
    });
  };

  const onBuyNow = () => {
    if (!product) {
      alert('Product data is missing');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.images?.[0] || '',
        quantity: 1,
        color: selectedColor,
        size: selectedSize,
      });
    }

    router.push('/checkout');
  };

  const onRemoveItem = () => {
    removeItem(product.id, selectedColor, selectedSize);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const displayPrice = () => {
    const price = product.price;
    if (typeof price !== 'number' || isNaN(price)) {
      return '€0,00';
    }
    return `€${price.toFixed(2).replace('.', ',')}`;
  };

  if (!product || !product.id || !product.stripeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-amber-100">
            <SparklesIcon className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold text-red-900 mb-4">Product Not Found</h1>
            <p className="text-red-700">The product you're looking for doesn't exist or has invalid data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-amber-100/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column - Product Images */}
            <div className="bg-gradient-to-br from-amber-50/50 to-rose-50/50 p-8 lg:p-10">
              <div className="space-y-4">
                {/* Main Image with Luxury Frame */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner border border-amber-100">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-700 hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50">
                      <span className="text-amber-300 font-light">Luxury image coming soon</span>
                    </div>
                  )}
                  
                  {/* Wishlist Button - Luxury Styled */}
                  <button
                    onClick={handleAddToWishlist}
                    disabled={loadingWishlist}
                    className="absolute top-4 right-4 p-3.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 disabled:opacity-50 border border-amber-200/50 group"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {loadingWishlist ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-900"></div>
                    ) : isWishlisted ? (
                      <HeartIconSolid className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-red-900 group-hover:text-red-500 transition-colors" />
                    )}
                  </button>

                  {/* Category Badge - Luxury */}
                  {product.category && (
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-2 text-xs font-light tracking-wider uppercase bg-white/90 backdrop-blur-sm text-red-900 rounded-full shadow-sm border border-amber-200">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images with Luxury Style */}
                <div className="grid grid-cols-4 gap-3">
                  {product.images?.slice(0, 4).map((image, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-xl overflow-hidden bg-white cursor-pointer hover:opacity-90 transition-all duration-300 border border-amber-100 hover:shadow-md hover:scale-105"
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Product Details with Luxury Typography */}
            <div className="p-8 lg:p-10 space-y-6 bg-white">
              {/* Title Section */}
              <div className="border-b border-amber-100 pb-4">
                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-red-900 mb-3 tracking-tight">
                  {product.name}
                </h1>
                
                {/* Price - Luxury Format */}
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-serif font-medium text-amber-700">
                    {displayPrice()}
                  </p>
                  <span className="text-xs text-red-950 font-light tracking-wider">EXCL. TAX</span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose max-w-none">
                  <p className="text-red-800 leading-relaxed font-light italic">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Color Selection - Luxury Style */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-red-900 tracking-wide">
                    Colour
                  </h3>
                  <span className="text-sm text-red-950 font-light capitalize">
                    {selectedColor ? (COLOR_MAP[selectedColor]?.name || selectedColor) : "Select"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {dbColors.length > 0 ? (
                    dbColors.map((colorValue) => {
                      const colorInfo = COLOR_MAP[colorValue] || { 
                        name: colorValue, 
                        class: `bg-${colorValue}-500 border border-amber-300`
                      };
                      return (
                        <button
                          key={colorValue}
                          onClick={() => setSelectedColor(colorValue)}
                          className={`relative w-12 h-12 rounded-full ${colorInfo.class} ${
                            selectedColor === colorValue 
                              ? 'ring-2 ring-offset-2 ring-amber-500 scale-110 shadow-lg' 
                              : 'hover:ring-2 hover:ring-offset-2 hover:ring-amber-300 hover:scale-105'
                          } transition-all duration-300`}
                          aria-label={`Select ${colorInfo.name} colour`}
                          title={colorInfo.name}
                        >
                          {selectedColor === colorValue && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-red-600 text-sm font-light">No colours available</p>
                  )}
                </div>
              </div>

              {/* Size Selection - Luxury Style */}
              {product.category !== 'HOME_DECORE' && dbSizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg text-red-900 tracking-wide">
                      Size
                    </h3>
                    <span className="text-sm text-red-950 font-light uppercase">
                      {selectedSize || "Select"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 max-w-xs">
                    {dbSizes.map((sizeValue) => {
                      const size = sizeValue.toUpperCase();
                      const sizeLower = sizeValue.toLowerCase();
                      return (
                        <button
                          key={sizeValue}
                          onClick={() => setSelectedSize(sizeLower)}
                          className={`py-3 px-5 text-center rounded-lg border font-medium transition-all duration-300 min-w-[70px] ${
                            selectedSize === sizeLower
                              ? 'bg-amber-600 text-white border-amber-600 scale-105 shadow-md'
                              : 'bg-white text-red-800 border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:shadow-sm'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-4">
                <h3 className="font-serif text-lg text-red-900 tracking-wide">
                  Quantity
                </h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decreaseQuantity}
                    className="h-12 w-12 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all duration-300"
                  >
                    <span className="text-xl">–</span>
                  </Button>
                  <span className="text-2xl font-serif font-medium w-12 text-center text-red-900">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseQuantity}
                    className="h-12 w-12 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all duration-300"
                  >
                    <span className="text-xl">+</span>
                  </Button>
                </div>
              </div>

              {/* Care Instructions - Luxury Card */}
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-5 border border-amber-100">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-serif font-semibold text-red-900 mb-1 tracking-wide">
                      Care Instructions
                    </h4>
                    <p className="text-sm text-red-800 font-light leading-relaxed">
                      {careDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={onAddItem}
                    className="flex-1 flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 text-white font-medium py-6 text-lg rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group"
                  >
                    <div className="relative">
                      <ShoppingBagIcon className="h-6 w-6" />
                      <PlusIcon className="h-3 w-3 absolute -top-1 -right-1" />
                    </div>
                    <span className="tracking-wide">Add to Cart</span>
                  </Button>

                  <Button
                    onClick={onBuyNow}
                    variant="outline"
                    className="flex-1 py-6 text-lg font-medium border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all duration-300 hover:border-amber-300"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Cart Status */}
                {cartQuantity > 0 && (
                  <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-xl p-4 text-center">
                    <p className="text-amber-700 font-medium">
                      You have {cartQuantity} in your cart
                      <span className="block text-sm text-amber-600 mt-1 font-light">
                        ({COLOR_MAP[selectedColor]?.name || selectedColor}, {selectedSize.toUpperCase()})
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRemoveItem}
                      className="mt-3 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full px-6"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Shipping & Returns - Luxury Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-amber-100">
                <div className="flex items-center gap-3 text-red-800 group hover:bg-amber-50 p-3 rounded-xl transition-all">
                  <TruckIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-serif text-sm text-red-900">Free Shipping</p>
                    <p className="text-xs text-red-700 font-light">Orders over €50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-red-800 group hover:bg-amber-50 p-3 rounded-xl transition-all">
                  <ArrowPathIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-serif text-sm text-red-900">Easy Returns</p>
                    <p className="text-xs text-red-700 font-light">30-day policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-red-800 group hover:bg-amber-50 p-3 rounded-xl transition-all">
                  <ShieldCheckIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-serif text-sm text-red-900">Secure Payment</p>
                    <p className="text-xs text-red-700 font-light">100% secure</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {product.metadata && Object.keys(product.metadata).length > 0 && (
                <div className="pt-4 border-t border-amber-100">
                  <h3 className="font-serif text-lg text-red-900 mb-4 tracking-wide">
                    Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.metadata).map(([key, value]) => (
                      <div key={key} className="text-sm p-3 bg-amber-50/50 rounded-lg">
                        <span className="font-serif text-red-800 capitalize block mb-1">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-amber-700 font-light">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SimilarProducts 
          currentProductId={product.id}
          category={product.category || product.metadata?.category}
        />
    </div>
  );
};