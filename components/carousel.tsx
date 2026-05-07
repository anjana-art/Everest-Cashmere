// components/carousel.tsx - OPTIMIZED IMAGES (Clean version)

'use client';
import { Card } from "./ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  products: Product[];
}

export const Carousel = ({ products = [] }: Props) => {
  const [current, setCurrent] = useState<number>(0);
  
  useEffect(() => {
    if (products.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % products.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return (
      <Card className="relative w-full h-full overflow-hidden rounded-lg shadow-xl border-0 bg-transparent">
        <div className="relative w-full h-full">
          <PlaceholderImage />
        </div>
      </Card>
    );
  }

  const currentProduct = products[current];
  const productUrl = `/products/${currentProduct.id}`;

  return (
    <Link href={productUrl} className="block w-full h-full">
      <Card className="relative w-full h-full overflow-hidden rounded-xl shadow-lg border-0 bg-transparent group cursor-pointer">
        {/* Image Container - NO padding/margin, transparent background */}
        <div className="relative w-full h-full">
          {currentProduct?.images?.[0] ? (
            <>
              {/* ✅ OPTIMIZED: Image with proper sizing and quality */}
              <Image
                src={currentProduct.images[0]}
                alt={currentProduct.name || "Product image"}
                fill
                className="object-contain transition-all duration-700 ease-in-out group-hover:scale-105"
                // ✅ OPTIMIZED: Responsive sizes for different screen widths
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, (max-width: 1500px) 50vw, 33vw"
                // ✅ OPTIMIZED: Quality setting (80-85 is sweet spot for product images)
                quality={85}
                // ✅ OPTIMIZED: Priority for carousel (above the fold)
                priority
                // ✅ OPTIMIZED: Fetch priority for faster LCP
                fetchPriority="high"
              />
              
              {/* Minimal gradient for text readability only */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent"></div>
              
              {/* Progress Indicator Dots - Top right */}
              <div className="absolute top-3 right-3 flex gap-1.5 z-20">
                {products.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === current 
                        ? 'w-5 bg-amber-500' 
                        : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
              
              {/* Product Name - SMALL, on TOP */}
              <div className="absolute top-0 left-0 right-0 p-3 z-20">
                <p className="text-xs sm:text-sm font-medium text-white drop-shadow-md">
                  {currentProduct?.name || "Product Name"}
                </p>
              </div>
              
              {/* Slide Number - Bottom right */}
              <div className="absolute bottom-2 right-2 text-[10px] font-light text-white/50 z-20">
                {current + 1}/{products.length}
              </div>
            </>
          ) : (
            <div className="relative w-full h-full">
              <PlaceholderImage />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};