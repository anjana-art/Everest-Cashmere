// components/carousel.tsx
'use client';
import { Card, CardContent, CardTitle } from "./ui/card";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlaceholderImage } from "./placeholder-image"; // Import your component

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
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return (
      <Card className="flex flex-col relative overflow-hidden rounded-lg shadow-md border-gray-300 min-h-80">
        <div className="relative h-80 w-full aspect-video">
          <PlaceholderImage /> {/* Use placeholder here */}
        </div>
      </Card>
    );
  }

  const currentProduct = products[current];
  const productUrl = `/products/${currentProduct.id}`;

  return (
    <Link href={productUrl}>
      <Card className="flex flex-col relative overflow-hidden rounded-lg shadow-md border-gray-300 hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative h-80 w-full aspect-video">
          {currentProduct?.images?.[0] ? (
            <Image
              src={currentProduct.images[0]}
              alt={currentProduct.name || "Product image"}
              fill
              style={{ objectFit: "contain" }}
              className="transition-opacity duration-500 ease-in-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <PlaceholderImage />
          )}
        </div>
        
        <CardContent className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 p-4">
          <CardTitle className="text-2xl font-bold text-amber-600 mb-2 text-center">
            {currentProduct?.name || "Product Name"}
          </CardTitle>
          <p className="text-xl font-medium text-gray-600">
            €{(typeof currentProduct.price === 'number' && !isNaN(currentProduct.price)) 
              ? currentProduct.price.toFixed(2) 
              : '0.00'}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};