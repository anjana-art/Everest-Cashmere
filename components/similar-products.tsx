// components/similar-products.tsx - Updated version
"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  SparklesIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ShoppingBagIcon,
  ExclamationCircleIcon 
} from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cart-store";

interface SimilarProduct {
  id: string;
  stripeId: string;
  name: string;
  price: number;
  images: string[];
  category?: string | null;
  availableColors?: string[];
  availableSizes?: string[];
}

interface Props {
  currentProductId: string;
  category?: string | null;
}

export const SimilarProducts = ({ currentProductId, category }: Props) => {
  const [products, setProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  // Fetch similar products
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!category) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Fetching similar products for category:', category);
        
        const params = new URLSearchParams({
          category: category,
          exclude: currentProductId,
          limit: '8'
        });

        const response = await fetch(`/api/admin/products/similar?${params}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Similar products response:', data);
        
        setProducts(data.products || []);
      } catch (err) {
        console.error('Error fetching similar products:', err);
        setError('Unable to load similar products');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [currentProductId, category]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 300;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + 
      (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleQuickAdd = (product: SimilarProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: product.images?.[0] || '',
      quantity: 1,
      color: product.availableColors?.[0] || '',
      size: product.availableSizes?.[0] || '',
    });

    // Show feedback
    const button = e.currentTarget;
    button.classList.add('bg-amber-700');
    setTimeout(() => button.classList.remove('bg-amber-700'), 200);
  };

  
  const displayPrice = (price: any) => {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) return '€0,00';
  return `€${numericPrice.toFixed(2).replace('.', ',')}`;
};

  // Loading skeleton
  if (loading) {
    return (
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-serif font-bold text-red-900 mb-8 flex items-center gap-2">
            <SparklesIcon className="h-6 w-6 text-amber-500 animate-pulse" />
            You May Also Like
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-none w-64">
                <div className="bg-white/50 rounded-2xl p-4 animate-pulse">
                  <div className="aspect-square bg-amber-100 rounded-xl mb-4"></div>
                  <div className="h-4 bg-amber-100 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-amber-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-16">
        <div className="container mx-auto px-4">
          <div className="bg-amber-50 rounded-2xl p-8 text-center border border-amber-200">
            <ExclamationCircleIcon className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-serif text-red-900 mb-2">Unable to load suggestions</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no products (and not loading)
  if (products.length === 0) {
    console.log('No similar products found for category:', category);
    return null;
  }

  return (
    <div className="mt-16 md:mt-24">
      <div className="container mx-auto px-4 relative">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-red-900 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
              Complete Your Look
            </h2>
            <p className="text-sm text-red-700 font-light mt-1">
              {products.length} {products.length === 1 ? 'item' : 'items'} from our {category?.toLowerCase().replace('_', ' ')} collection
            </p>
          </div>

          {/* Navigation Arrows - Only show if enough products */}
          {products.length > 3 && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-amber-200 text-red-900 hover:bg-amber-50 transition-all duration-300"
                aria-label="Previous products"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-amber-200 text-red-900 hover:bg-amber-50 transition-all duration-300"
                aria-label="Next products"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-64 sm:w-72 snap-start group"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100/50 hover:border-amber-200">
                
                {/* Image Container */}
                <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-amber-50 to-rose-50">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 256px, 288px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-amber-300 font-light">Image</span>
                    </div>
                  )}

                  {/* Category Tag */}
                  {product.category && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-xs font-light tracking-wider uppercase bg-white/90 backdrop-blur-sm text-red-900 rounded-full shadow-sm border border-amber-200">
                        {product.category.replace('_', ' ')}
                      </span>
                    </div>
                  )}

                  {/* Quick Add Overlay */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className="w-full py-3 bg-amber-600/95 backdrop-blur-sm text-white font-medium hover:bg-amber-700 transition-colors text-sm tracking-wide flex items-center justify-center gap-2"
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                      Quick Add
                    </button>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-serif font-medium text-red-900 mb-1 hover:text-amber-700 transition-colors line-clamp-1 text-sm md:text-base">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-amber-700 font-serif text-base md:text-lg">
                      {displayPrice(product.price)}
                    </p>
                    
                    {/* Mobile quick add */}
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className="md:hidden p-2 bg-amber-600 text-white rounded-full"
                      aria-label="Add to cart"
                    >
                      <ShoppingBagIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile scroll indicator - Show if there are products to scroll */}
        {products.length > 2 && (
          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex gap-1">
              <div className="h-1 w-12 bg-amber-600 rounded-full"></div>
              <div className="h-1 w-12 bg-amber-200 rounded-full"></div>
            </div>
            <span className="text-xs text-red-500 ml-2 font-light">
              {products.length} items • Swipe to see more
            </span>
          </div>
        )}
      </div>
    </div>
  );
};