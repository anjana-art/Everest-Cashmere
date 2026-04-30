// components/product-detail.tsx - Full page with variant wishlist tracking

"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { SimilarProducts } from "./similar-products";

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
  metadata?: {
    category?: string;
    [key: string]: any;
  };
  availableColors?: string[];
  availableSizes?: string[];
  defaultColor?: string | null;
  defaultSize?: string | null;
  category?: string | null;
  clothingType?: string | null;
  accessoriesType?: string | null;
}

interface Props {
  product: Product;
}

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
  'beige': { name: 'Beige', class: 'bg-[#F5F5DC] border border-amber-300', hex: '#F5F5DC' },
  'charcoal': { name: 'Charcoal', class: 'bg-[#36454F] border border-gray-600', hex: '#36454F' },
  'taupe': { name: 'Taupe', class: 'bg-[#483C32] border border-amber-700', hex: '#483C32' },
  'indigo': { name: 'Indigo', class: 'bg-[#4B0082] border border-purple-800', hex: '#4B0082' },  

};

export const ProductDetail = ({ product }: Props) => {
  const router = useRouter();
  const { items, addItem, removeItem } = useCartStore();
  
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [sizeStockMap, setSizeStockMap] = useState<Record<string, number>>({});
  
  const [mainImage, setMainImage] = useState<string>(product.images?.[0] || '');
  
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
  const [showCareDetails, setShowCareDetails] = useState(false);

  
  const cartItem = items.find((item) => 
    item.id === product?.id && 
    item.color === selectedColor && 
    item.size === selectedSize
  );
  
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  
  // Get current selected size stock
  const currentStock = sizeStockMap[selectedSize] || 0;
  
  // Get current selected variant
  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);

  // Fetch variants
  useEffect(() => {
    if (product?.id) {
      fetchVariants();
    }
  }, [product?.id]);

  // Update size stock map when variants are loaded or color changes
  useEffect(() => {
    if (variants.length > 0 && selectedColor) {
      const stockMap: Record<string, number> = {};
      variants
        .filter(v => v.color === selectedColor)
        .forEach(v => {
          stockMap[v.size] = v.stock;
        });
      setSizeStockMap(stockMap);
      
      // Reset quantity when color/size changes
      setQuantity(1);
      
      // Auto-select first available size if current size is out of stock
      const firstAvailableSize = Object.entries(stockMap).find(([_, stock]) => stock > 0)?.[0];
      if (selectedSize && stockMap[selectedSize] === 0 && firstAvailableSize) {
        setSelectedSize(firstAvailableSize);
      }
    }
  }, [variants, selectedColor, selectedSize]);

  const fetchVariants = async () => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}/variants`);
      const data = await response.json();
      setVariants(data.variants);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

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

  // Check wishlist status for selected variant
  const checkWishlistStatus = async () => {
    if (!userId || !product?.id || !selectedVariant) return;
    
    try {
      const url = `/api/wishlist?check=true&productId=${product.id}&variantId=${selectedVariant.id}`;
      const response = await fetch(url, {
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

  // Re-check wishlist when selected variant changes
  useEffect(() => {
    if (userId && product?.id && selectedVariant) {
      checkWishlistStatus();
    }
  }, [userId, product?.id, selectedVariant]);

  const handleAddToWishlist = async () => {
    if (!userId) {
      alert('Please login to add to wishlist');
      return;
    }

    if (!product?.id) {
      alert('Product data incomplete');
      return;
    }

    if (!selectedVariant) {
      alert('Please select a color and size first');
      return;
    }

    try {
      setLoadingWishlist(true);

      if (isWishlisted) {
        // Remove specific variant from wishlist
        const response = await fetch(`/api/wishlist?productId=${product.id}&variantId=${selectedVariant.id}`, {
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
        // Add specific variant to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ 
            productId: product.id,
            variantId: selectedVariant.id,
            color: selectedColor,
            size: selectedSize
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

  const onAddItem = () => {
    if (!product) {
      alert('Product data is missing');
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    // Check if selected size is in stock
    if (currentStock <= 0) {
      alert(`Sorry, ${selectedSize.toUpperCase()} is out of stock`);
      return;
    }

    if (quantity > currentStock) {
      alert(`Only ${currentStock} items available in ${selectedSize.toUpperCase()}`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images?.[0] || '',
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
    });
  };

  const onBuyNow = () => {
    if (!product) {
      alert('Product data is missing');
      return;
    }

    if (!selectedSize) {
      alert('Please select a size');
      return;
    }

    if (currentStock <= 0) {
      alert(`Sorry, ${selectedSize.toUpperCase()} is out of stock`);
      return;
    }

    if (quantity > currentStock) {
      alert(`Only ${currentStock} items available in ${selectedSize.toUpperCase()}`);
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

  const increaseQuantity = () => {
    if (quantity < currentStock) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

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

  const formatSubCategory = (product: Product) => {
    if (product.category === 'CLOTHING' && product.clothingType) {
      const map: Record<string, string> = {
        'CASHMERE':             'Pure Cashmere',
        'MARINO_WOOL':          'Merino Wool',
        'CASHMERE_MARINO_WOOL': 'Cashmere & Merino',
      };
      return map[product.clothingType] || product.clothingType;
    }
    if (product.category === 'ACCESSORIES' && product.accessoriesType) {
      const map: Record<string, string> = {
        'MEN':    'Men',
        'WOMEN':  'Women',
        'UNISEX': 'Unisex',
      };
      return map[product.accessoriesType] || product.accessoriesType;
    }
    return null;
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-amber-100/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column - Product Images with Gallery */}
            <div className="bg-gradient-to-br from-amber-50/50 to-rose-50/50 p-8 lg:p-10">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner border border-amber-100">
                  {mainImage ? (
                    <Image
                      src={mainImage}
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
                  
                  <button
                    onClick={handleAddToWishlist}
                    disabled={loadingWishlist || !selectedVariant}
                    className="absolute top-4 right-4 p-3.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200/50 group"
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

                  {formatSubCategory(product) && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-3 py-1.5 text-xs font-light tracking-wider uppercase bg-white/90 backdrop-blur-sm text-red-900 rounded-full shadow-sm border border-amber-200">
                        {formatSubCategory(product)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-3">
                  {product.images?.map((image, index) => (
                    <div 
                      key={index} 
                      onClick={() => setMainImage(image)}
                      className={`aspect-square rounded-xl overflow-hidden bg-white cursor-pointer transition-all duration-300 border ${
                        mainImage === image 
                          ? 'border-amber-500 ring-2 ring-amber-200 scale-105 shadow-lg' 
                          : 'border-amber-100 hover:border-amber-300 hover:shadow-md hover:scale-105'
                      }`}
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

            {/* Right Column - Product Details */}
            <div className="p-8 lg:p-10 space-y-6 bg-white">
              <div className="border-b border-amber-100 pb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-red-900 mb-3 tracking-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-serif font-medium text-amber-700">
                    {displayPrice()}
                  </p>
                  <span className="text-xs text-red-950 font-light tracking-wider">INCLU. TAX</span>
                </div>
              </div>

              {product.description && (
                <div className="prose max-w-none">
                  <p className="text-red-800 leading-relaxed font-light italic">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Color Selection */}
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

              {/* Size Selection */}
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
                  <div className="flex flex-wrap gap-3">
                    {dbSizes.map((sizeValue) => {
                      const size = sizeValue.toUpperCase();
                      const sizeLower = sizeValue.toLowerCase();
                      const stock = sizeStockMap[sizeLower] ?? 0;
                      const isOutOfStock = stock === 0;
                      const isSelected = selectedSize === sizeLower;
                      
                      return (
                        <button
                          key={sizeValue}
                          onClick={() => !isOutOfStock && setSelectedSize(sizeLower)}
                          disabled={isOutOfStock}
                          className={`py-3 px-5 text-center rounded-lg border font-medium transition-all duration-300 min-w-[70px] relative ${
                            isSelected && !isOutOfStock
                              ? 'bg-amber-600 text-white border-amber-600 scale-105 shadow-md'
                              : isOutOfStock
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60 line-through'
                              : 'bg-white text-red-800 border-amber-200 hover:bg-amber-50 hover:border-amber-300 hover:shadow-sm'
                          }`}
                        >
                          {size}
                          {isOutOfStock && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              Out
                            </span>
                          )}
                          {!isOutOfStock && stock < 5 && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {stock} left
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSize && currentStock > 0 && (
                    <p className="text-xs text-green-600">
                      ✓ {currentStock} items in stock
                    </p>
                  )}
                  {selectedSize && currentStock === 0 && (
                    <p className="text-xs text-red-600">
                      ✗ Out of stock - Please select another size
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selection */}
              {selectedSize && currentStock > 0 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-red-900 tracking-wide">
                    Quantity
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                      className="h-12 w-12 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={quantity >= currentStock}
                      className="h-12 w-12 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl">+</span>
                    </Button>
                    <span className="text-sm text-gray-500">
                      Max: {currentStock}
                    </span>
                  </div>
                </div>
              )}

              {/* Care Instructions */}
              <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-5 border border-amber-100">
                <button 
                  onClick={() => setShowCareDetails(!showCareDetails)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <ShieldCheckIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-semibold text-red-900 tracking-wide">
                        Care Instructions for Nepalese Cashmere
                      </h4>
                      <span className="text-amber-600 text-xl">
                        {showCareDetails ? '−' : '+'}
                      </span>
                    </div>
                    
                    {!showCareDetails && (
                      <p className="text-sm text-red-700 font-light mt-1">
                        Hand wash cold, lay flat to dry, store folded. Click for full details →
                      </p>
                    )}
                  </div>
                </button>
                
                {showCareDetails && (
                  <div className="mt-4 space-y-3 text-sm pl-8">
                    <div>
                      <p className="font-medium text-red-800">🧼 Washing Instructions</p>
                      <p className="text-red-700 font-light">Dry clean only, or hand wash in cold water (below 30°C) using cashmere-specific shampoo. Never rub, wring, or twist the fabric – gently squeeze water through. Rinse thoroughly with cold water.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-800">🌀 Drying Method</p>
                      <p className="text-red-700 font-light">After washing, roll in a clean towel to remove excess water. Lay flat on a drying rack away from direct sunlight and heat. Reshape while damp. Never hang – the weight will stretch the cashmere.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-800">📦 Storage Tips for Portugal</p>
                      <p className="text-red-700 font-light">Store folded (never hanging) in a breathable cotton bag. Use cedar balls or lavender sachets to naturally repel moths – especially important in humid Portuguese climates. Avoid plastic bags which trap moisture and can cause mildew.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-800">✨ Pilling Maintenance</p>
                      <p className="text-red-700 font-light">Natural pilling is normal for premium cashmere and shows authentic fiber quality. Remove pills gently with a cashmere comb or fabric shaver. Never pull pills with fingers as this damages the fibers.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-800">🌡️ For Portugal's Climate</p>
                      <p className="text-red-700 font-light">Best worn during cooler months (October-March). Allow sweater to rest 24 hours between wears. Air out after each use to maintain freshness and prevent moisture buildup.</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-red-800">❌ What to Avoid</p>
                      <p className="text-red-700 font-light">Never use fabric softeners, bleach, or regular detergent. Avoid machine washing and tumble drying. Keep away from direct perfume and lotion contact. Never hang on hooks or wire hangers.</p>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-xs text-amber-700 font-light italic border-t border-amber-200 pt-3">
                        🇳🇵 Each sweater is uniquely handcrafted in Kathmandu Valley, Nepal, using traditional techniques passed down through generations. With proper care, your cashmere will develop a beautiful patina and last for decades.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={onAddItem}
                    disabled={!selectedSize || currentStock === 0}
                    className={`flex-1 flex items-center justify-center gap-3 font-medium py-6 text-lg rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group ${
                      !selectedSize || currentStock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <div className="relative">
                      <ShoppingBagIcon className="h-6 w-6" />
                      <PlusIcon className="h-3 w-3 absolute -top-1 -right-1" />
                    </div>
                    <span className="tracking-wide">
                      {!selectedSize ? 'Select Size' : currentStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                  </Button>

                  <Button
                    onClick={onBuyNow}
                    disabled={!selectedSize || currentStock === 0}
                    variant="outline"
                    className={`flex-1 py-6 text-lg font-medium rounded-xl transition-all duration-300 ${
                      !selectedSize || currentStock === 0
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'
                    }`}
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

              {/* Shipping & Returns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-amber-100">
                <div className="flex items-center gap-3 text-red-800 group hover:bg-amber-50 p-3 rounded-xl transition-all">
                  <TruckIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-serif text-sm text-red-900">Free Shipping</p>
                    <p className="text-xs text-red-700 font-light">Orders over €100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-red-800 group hover:bg-amber-50 p-3 rounded-xl transition-all">
                  <ArrowPathIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="font-serif text-sm text-red-900">Easy Returns</p>
                    <p className="text-xs text-red-700 font-light">14-day policy</p>
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