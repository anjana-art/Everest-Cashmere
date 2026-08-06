// components/product-detail.tsx - Fixed size guide with debug

"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/cart-store";
import { useState, useEffect } from "react";
import { HeartIcon, ShoppingBagIcon, PlusIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, SparklesIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { SimilarProducts } from "./similar-products";
import { ProductShare } from './ProductShare';

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
  sizeGuide?: string | null;
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
  
  // NEW: Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
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
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  
  const cartItem = items.find((item) => 
    item.id === product?.id && 
    item.color === selectedColor && 
    item.size === selectedSize
  );
  
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  
  // Get current selected size stock
  const currentStock = sizeStockMap[selectedSize] || 0;
  
  // Calculate remaining stock after cart items
  const remainingStock = currentStock - cartQuantity;
  
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

    // Add items based on quantity
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
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
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

    // Check if trying to buy more than remaining stock
    if (quantity > remainingStock) {
      alert(`Maximum ${remainingStock} items available. Please reduce quantity.`);
      setQuantity(remainingStock > 0 ? remainingStock : 0);
      return;
    }

    if (quantity < 1) {
      alert('Please select at least 1 item');
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

  const displayPrice = () => {
    const price = product.price;
    if (typeof price !== 'number' || isNaN(price)) {
      return '€0,00';
    }
    return `€${price.toFixed(2).replace('.', ',')}`;
  };

  // NEW: Lightbox navigation functions
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const prevImage = () => {
    setLightboxIndex((prev) => 
      prev === 0 ? (product.images?.length || 1) - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setLightboxIndex((prev) => 
      prev === (product.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

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

  // Debug: Log sizeGuide to console
  console.log('🔍 [DEBUG] Product sizeGuide from props:', product.sizeGuide);
  console.log('🔍 [DEBUG] Product sizeGuide type:', typeof product.sizeGuide);
  console.log('🔍 [DEBUG] Product sizeGuide length:', product.sizeGuide?.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-amber-100/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Column - Product Images with Gallery */}
            <div className="bg-gradient-to-br from-amber-50/50 to-rose-50/50 p-8 lg:p-10">
              <div className="space-y-4">
                {/* Main Image - NOW CLICKABLE */}
                <div 
                  className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-inner border border-amber-100 cursor-zoom-in group"
                  onClick={() => openLightbox(0)}
                >
                  {mainImage ? (
                    <>
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-700 hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {/* Zoom icon overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-700">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-50">
                      <span className="text-amber-300 font-light">Luxury image coming soon</span>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist();
                    }}
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

                {/* Share button */}
                <div className="flex items-center justify-between pt-2">
                  <ProductShare product={product} />
                </div>

                {/* Success Message */}
                {showSuccessMessage && (
                  <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
                    ✅ Added {quantity} item{quantity > 1 ? 's' : ''} to cart!
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

                {/* Size Chart Section - FIXED with debug */}
                <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-xl p-5 border border-amber-100">
                  <button 
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="flex items-start gap-3 w-full text-left"
                  >
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-600 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-semibold text-red-900 tracking-wide">
                          Size Guide
                        </h4>
                        <span className="text-amber-600 text-xl">
                          {showSizeChart ? '−' : '+'}
                        </span>
                      </div>
                      
                      {!showSizeChart && (
                        <p className="text-sm text-red-700 font-light mt-1">
                          {product.sizeGuide && product.sizeGuide.trim() !== '' 
                            ? 'Click to view size guide →' 
                            : 'No size guide available for this product'}
                        </p>
                      )}
                    </div>
                  </button>
                  
                  {/* Show the image when sizeGuide exists */}
                  {showSizeChart && product.sizeGuide && product.sizeGuide.trim() !== '' && (
                    <div className="mt-4 pt-2">
                      <div className="relative w-full overflow-hidden rounded-lg">
                        <Image
                          src={product.sizeGuide}
                          alt="Size guide"
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain"
                          sizes="(max-width: 768px) 100vw, 800px"
                          onError={(e) => {
                            console.error('❌ [DEBUG] Image failed to load:', product.sizeGuide);
                            e.currentTarget.style.display = 'none';
                            // Show error message
                            const parent = e.currentTarget.parentElement?.parentElement;
                            if (parent) {
                              const errorMsg = document.createElement('p');
                              errorMsg.className = 'text-red-600 text-sm text-center p-4';
                              errorMsg.textContent = 'Failed to load size guide image';
                              parent.appendChild(errorMsg);
                            }
                          }}
                          onLoad={() => {
                            console.log('✅ [DEBUG] Image loaded successfully:', product.sizeGuide);
                          }}
                        />
                      </div>
                      <div className="mt-3 text-xs text-center text-red-700 font-light">
                        <p>Measurements in centimeters (cm). For best fit, measure your chest and compare with our chart.</p>
                      </div>
                    </div>
                  )}
                  
                  {showSizeChart && (!product.sizeGuide || product.sizeGuide.trim() === '') && (
                    <div className="mt-4 p-4 text-center text-red-600 text-sm">
                      No size guide available for this product
                    </div>
                  )}
                </div>

                {/* Shipping & Returns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-amber-100">
                  <div className="flex items-center gap-3 text-red-800 group hover:bg-amber-50 p-3 rounded-xl transition-all">
                    <TruckIcon className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-serif text-sm text-red-900">Complimentry and Fast Shipping</p>
                      <p className="text-xs text-red-700 font-light">within 5-6 business days</p>
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
                <div className="mt-8 space-y-5 text-stone-700">
                  {product.description
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line, index) => {
                      const isHeading = [
                        "Product details",
                        "Fit and styling",
                        "Care",
                      ].includes(line);

                      const isBullet = line.startsWith("•");

                      if (isHeading) {
                        return (
                          <h3
                            key={index}
                            className="pt-4 text-sm font-semibold uppercase tracking-[0.18em] text-stone-900"
                          >
                            {line}
                          </h3>
                        );
                      }

                      if (isBullet) {
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-3 border-b border-stone-200/70 pb-3 text-sm leading-6"
                          >
                            <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-red-800" />

                            <span>{line.replace(/^•\s*/, "")}</span>
                          </div>
                        );
                      }

                      return (
                        <p
                          key={index}
                          className={
                            index === 0
                              ? "font-serif text-xl leading-8 text-stone-900"
                              : "text-[15px] font-light leading-7"
                          }
                        >
                          {line}
                        </p>
                      );
                    })}
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
                    <div className="space-y-1">
                      <p className="text-xs text-green-600">
                        ✓ {currentStock} items total in stock
                      </p>
                      {cartQuantity > 0 && (
                        <p className="text-xs text-amber-600">
                          🛒 {cartQuantity} already in cart • {remainingStock} available to add
                        </p>
                      )}
                    </div>
                  )}
                  {selectedSize && currentStock === 0 && (
                    <p className="text-xs text-red-600">
                      ✗ Out of stock - Please select another size
                    </p>
                  )}
                </div>
              )}

              {/* Quantity Selection - Fixed with remaining stock */}
              {selectedSize && currentStock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg text-red-900 tracking-wide">
                      Quantity
                    </h3>
                    <span className="text-sm text-amber-600 font-medium">
                      {cartQuantity >= currentStock ? 'Max reached' : `${remainingStock} available to add`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1 || cartQuantity >= currentStock}
                      className="h-12 w-12 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl">–</span>
                    </Button>
                    
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={remainingStock}
                      disabled={cartQuantity >= currentStock}
                      className="text-2xl font-serif font-medium w-20 text-center text-red-900 border border-amber-200 rounded-lg py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseQuantity}
                      disabled={quantity >= remainingStock || cartQuantity >= currentStock}
                      className="h-12 w-12 border-amber-200 text-red-900 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-xl">+</span>
                    </Button>
                  </div>
                  
                  {cartQuantity >= currentStock && (
                    <p className="text-xs text-red-600">
                      You've reached the maximum available stock for this size
                    </p>
                  )}
                  
                  {quantity === remainingStock && remainingStock > 0 && cartQuantity < currentStock && (
                    <p className="text-xs text-amber-600">
                      Maximum quantity reached ({remainingStock} items available to add)
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons - Fixed with proper stock limits */}
              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={onAddItem}
                    disabled={!selectedSize || currentStock === 0 || cartQuantity >= currentStock}
                    className={`flex-1 flex items-center justify-center gap-3 font-medium py-6 text-lg rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group ${
                      !selectedSize || currentStock === 0 || cartQuantity >= currentStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <div className="relative">
                      <ShoppingBagIcon className="h-6 w-6" />
                      <PlusIcon className="h-3 w-3 absolute -top-1 -right-1" />
                    </div>
                    <span className="tracking-wide">
                      {!selectedSize ? 'Select Size' : 
                       currentStock === 0 ? 'Out of Stock' : 
                       cartQuantity >= currentStock ? 'Max Reached' : 
                       `Add ${quantity > 1 ? `${quantity} × ` : ''}to Cart`}
                    </span>
                  </Button>

                  <Button
                    onClick={onBuyNow}
                    disabled={!selectedSize || currentStock === 0 || cartQuantity >= currentStock}
                    variant="outline"
                    className={`flex-1 py-6 text-lg font-medium rounded-xl transition-all duration-300 ${
                      !selectedSize || currentStock === 0 || cartQuantity >= currentStock
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
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Lightbox/Modal for full-screen image viewing */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            aria-label="Close image viewer"
          >
            <XMarkIcon className="w-10 h-10" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-light bg-black/50 px-4 py-2 rounded-full">
            {lightboxIndex + 1} / {product.images?.length || 1}
          </div>

          {/* Main image */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {product.images && product.images[lightboxIndex] ? (
              <Image
                src={product.images[lightboxIndex]}
                alt={`${product.name} - View ${lightboxIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <span>Image not available</span>
              </div>
            )}
          </div>

          {/* Navigation buttons - only show if more than 1 image */}
          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 bg-black/30 backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10 bg-black/30 backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>

              {/* Thumbnail strip at bottom */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto px-4 pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === lightboxIndex 
                        ? 'border-amber-400 scale-110 shadow-lg shadow-amber-400/30' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Hint text */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-xs font-light hidden sm:block">
            Click outside image to close • Use arrow keys to navigate
          </div>
        </div>
      )}

      <SimilarProducts 
        currentProductId={product.id}
        category={product.category || product.metadata?.category}
      />
    </div>
  );
};