"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

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
  // NEW: Add these fields from database
  availableColors?: string[];    // e.g., ['black', 'baby-pink', 'green']
  availableSizes?: string[];     // e.g., ['S', 'M', 'L']
  defaultColor?: string | null;  // e.g., 'black'
  defaultSize?: string | null;   // e.g., 'M'
  // ADD THIS LINE: category field
  category?: string | null;
}

interface Props {
  product: Product;
}

// Color mapping from database values to display properties
const COLOR_MAP: Record<string, { name: string, class: string }> = {
  'baby-pink': { name: 'Baby Pink', class: 'bg-pink-200 border border-pink-300' },
  'amber-200': { name: 'Amber', class: 'bg-amber-200 border border-amber-300' },
  'black-300': { name: 'Dark Gray', class: 'bg-gray-400 border border-gray-500' },
  'gray': { name: 'Gray', class: 'bg-gray-500 border border-gray-600' },
  'sky-blue': { name: 'Sky Blue', class: 'bg-blue-300 border border-blue-400' },
  'cream': { name: 'Cream', class: 'bg-amber-50 border border-gray-300' },
  'black': { name: 'Black', class: 'bg-gray-900 border border-black' },
  'green': { name: 'Green', class: 'bg-green-600 border border-green-700' },
  'yellow-200': { name: 'Yellow', class: 'bg-yellow-300 border border-yellow-400' },
  'red-900': { name: 'Red', class: 'bg-red-900 border border-red-950' },
  // Legacy fallbacks (keep for compatibility)
  'burgundy': { name: 'Burgundy', class: 'bg-red-900 border border-red-950' },
  'white': { name: 'White', class: 'bg-white border border-gray-300' },
};

export const ProductDetail = ({ product }: Props) => {
  const router = useRouter();
  const { items, addItem, removeItem } = useCartStore();
  
  // ✅ GET COLORS & SIZES FROM DATABASE
  const dbColors = product.availableColors || [];
  const dbSizes = product.availableSizes || [];
  
  // ✅ SET DEFAULTS FROM DATABASE
  const defaultColor = dbColors.length > 0 ? dbColors[0] : "";
  const defaultSize = dbSizes.length > 0 ? dbSizes[0].toLowerCase() : "";
  
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // ✅ FIND CART ITEM WITH MATCHING COLOR & SIZE
  const cartItem = items.find((item) => 
    item.id === product?.id && 
    item.color === selectedColor && 
    item.size === selectedSize
  );
  
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  // Debug: Log product data
  useEffect(() => {
    console.log('ProductDetail:', {
      id: product?.id,
      dbColors,
      dbSizes,
      defaultColor,
      defaultSize,
      selectedColor,
      selectedSize,
      cartQuantity,
      cartItems: items.filter(item => item.id === product?.id)
    });
  }, [product, selectedColor, selectedSize, items]);

  // Get user ID on mount
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

  // Check wishlist status on component mount
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

    if (!product?.stripeId) {
      alert('Product data incomplete');
      return;
    }

    try {
      setLoadingWishlist(true);

      if (isWishlisted) {
        // Remove from wishlist
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
        // Add to wishlist
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

  // Care description
  const careDescription = "Machine wash cold with similar colors. Tumble dry low. Do not bleach. Iron on low heat if needed.";

  const onAddItem = () => {
    if (!product) {
      alert('Product data is missing');
      return;
    }

    // ✅ USE SELECTED COLOR & SIZE (from database)
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0] || '',
      quantity: 1,
      color: selectedColor, // From database
      size: selectedSize,   // From database
    });
  };

  // NEW: Buy Now function - adds item and redirects to checkout
  const onBuyNow = () => {
    if (!product) {
      alert('Product data is missing');
      return;
    }

    // Add the item to cart with selected quantity
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

    // Redirect to checkout page
    router.push('/checkout');
  };

  const onRemoveItem = () => {
    removeItem(product.id, selectedColor, selectedSize);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Don't render if product is invalid
  if (!product || !product.id || !product.stripeId) {
    console.error('ProductDetail: Invalid product data:', product);
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist or has invalid data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left Column - Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {product.images && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No image available</span>
                  </div>
                )}
                
                {/* Wishlist Button */}
                <button
                  onClick={handleAddToWishlist}
                  disabled={loadingWishlist || !userId}
                  className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 disabled:opacity-50"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  title={!userId ? "Login to add to wishlist" : ""}
                >
                  {loadingWishlist ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
                  ) : isWishlisted ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6 text-gray-700 hover:text-red-500" />
                  )}
                </button>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-3">
                {product.images?.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
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

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Product Title & Category */}
              <div>
                {product.category && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-3">
                    {product.category}
                  </span>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h1>
                
                {/* Price - Now in euros, already converted */}
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  €{typeof product.price === 'number' && !isNaN(product.price) ? product.price.toFixed(2) : '0.00'}
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              {/* Color Selection - UPDATED: Show ONLY available colors from database */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Color: <span className="font-normal capitalize">
                    {selectedColor ? (COLOR_MAP[selectedColor]?.name || selectedColor) : "Select a color"}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {dbColors.length > 0 ? (
                    dbColors.map((colorValue) => {
                      const colorInfo = COLOR_MAP[colorValue] || { 
                        name: colorValue, 
                        class: `bg-${colorValue.includes('gray') ? 'gray' : colorValue.split('-')[0] || 'gray'}-500 border border-gray-300`
                      };
                      return (
                        <button
                          key={colorValue}
                          onClick={() => setSelectedColor(colorValue)}
                          className={`relative w-10 h-10 rounded-full ${colorInfo.class} ${
                            selectedColor === colorValue 
                              ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                              : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                          } transition-all duration-200`}
                          aria-label={`Select ${colorInfo.name} color`}
                          title={colorInfo.name}
                        >
                          {selectedColor === colorValue && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No colors available</p>
                  )}
                </div>
              </div>

              {/* Size Selection - ONLY SHOW IF NOT HOME DECORE AND HAS SIZES */}
              {/* FIXED: Added optional chaining to check category safely */}
              {product.category !== 'HOME_DECORE' && dbSizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Size: <span className="font-normal uppercase">{selectedSize || "Select a size"}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 max-w-xs">
                    {dbSizes.map((sizeValue) => {
                      const size = sizeValue.toUpperCase();
                      const sizeLower = sizeValue.toLowerCase();
                      return (
                        <button
                          key={sizeValue}
                          onClick={() => setSelectedSize(sizeLower)}
                          className={`py-3 px-4 text-center rounded-lg border font-medium transition-all duration-200 min-w-[60px] ${
                            selectedSize === sizeLower
                              ? 'bg-blue-600 text-white border-blue-600 scale-105'
                              : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
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
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decreaseQuantity}
                    className="h-12 w-12"
                  >
                    <span className="text-xl">–</span>
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={increaseQuantity}
                    className="h-12 w-12"
                  >
                    <span className="text-xl">+</span>
                  </Button>
                </div>
              </div>

              {/* Care Description */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Care Instructions</h4>
                    <p className="text-sm text-gray-600">{careDescription}</p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Add to Cart Button with Icon */}
                  <Button
                    onClick={onAddItem}
                    className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
                  >
                    <div className="relative">
                      <ShoppingBagIcon className="h-6 w-6" />
                      <PlusIcon className="h-3 w-3 absolute -top-1 -right-1" />
                    </div>
                    <span>Add to Cart</span>
                  </Button>

                  {/* Buy Now Button - UPDATED with onClick handler */}
                  <Button
                    onClick={onBuyNow}
                    variant="outline"
                    className="flex-1 py-6 text-lg font-semibold"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Cart Status - Shows specific color/size combination */}
                {cartQuantity > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-blue-700 font-medium">
                      You have {cartQuantity} of this item in your cart
                      <span className="block text-sm text-blue-600 mt-1">
                        (Color: {COLOR_MAP[selectedColor]?.name || selectedColor}, Size: {selectedSize.toUpperCase()})
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRemoveItem}
                      className="mt-2"
                    >
                      Remove This Variant
                    </Button>
                  </div>
                )}
              </div>

              {/* Shipping & Returns Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <TruckIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Free Shipping</p>
                    <p className="text-sm">On orders over €50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <ArrowPathIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Easy Returns</p>
                    <p className="text-sm">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <ShieldCheckIcon className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-gray-900">Secure Payment</p>
                    <p className="text-sm">100% secure checkout</p>
                  </div>
                </div>
              </div>

              {/* Additional Metadata */}
              {product.metadata && Object.keys(product.metadata).length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.metadata).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace('_', ' ')}:
                        </span>
                        <span className="ml-2 text-gray-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



