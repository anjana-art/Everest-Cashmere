// components/carousel.tsx - LUXURY EDITION (No white space)
'use client';
import { Card, CardContent, CardTitle } from "./ui/card";
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
    }, 4000); // Slightly slower for luxury feel

    return () => clearInterval(interval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return (
      <Card className="relative w-full h-full overflow-hidden rounded-lg shadow-xl border-0 bg-gradient-to-br from-amber-50 to-red-50">
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
      <Card className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl border-0 group cursor-pointer">
        {/* Image Container - fills the entire card with no padding/margin */}
        <div className="relative w-full h-full">
          {currentProduct?.images?.[0] ? (
            <>
              <Image
                src={currentProduct.images[0]}
                alt={currentProduct.name || "Product image"}
                fill
                className="object-contain transition-all duration-700 ease-in-out group-hover:scale-110"
                sizes="(max-width: 850px) 100vw, (max-width: 1500px) 50vw, 33vw"
                priority
              />
              
              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500"></div>
              
              {/* Progress Indicator Dots */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                {products.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === current 
                        ? 'w-6 bg-amber-400' 
                        : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
              
            
              
              {/* Title overlay at the bottom - Luxury styled */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                  <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-white drop-shadow-2xl mb-1">
                    {currentProduct?.name || "Product Name"}
                  </CardTitle>
                  
                  {/* Price - Optional: uncomment if you want to show price */}
                  {/* <p className="text-amber-300 font-light text-sm md:text-base">
                    {currentProduct?.price ? `€${currentProduct.price.toFixed(2)}` : ''}
                  </p> */}
                  
                  {/* Decorative line */}
                  <div className="h-0.5 w-12 bg-amber-400 mt-2 group-hover:w-20 transition-all duration-500"></div>
                </div>
              </div>
              
              {/* Slide Number Indicator */}
              <div className="absolute bottom-4 right-4 text-xs font-light text-white/70 z-20">
                {current + 1} / {products.length}
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