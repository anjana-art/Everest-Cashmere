// components/carousel.tsx
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
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (!products || products.length === 0) {
    return (
      <Card className="relative w-full h-full overflow-hidden rounded-lg shadow-md border-gray-300">
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
      <Card className="relative w-full h-full overflow-hidden rounded-lg shadow-md border-gray-300 hover:shadow-xl transition-shadow duration-300 group">
        {/* Image Container - fills the entire card */}
        <div className="relative w-full h-full">
          {currentProduct?.images?.[0] ? (
            <Image
              src={currentProduct.images[0]}
              alt={currentProduct.name || "Product image"}
              fill
              className="object-contain transition-opacity duration-500 ease-in-out group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 850px) 100vw, (max-width: 1500px) 50vw, 33vw"
              priority
            />
          ) : (
            <PlaceholderImage />
          )}
          
          {/* Title overlay at the top */}
          {/* Title overlay at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <CardTitle className="text-xl font-italic text-white drop-shadow-lg">
              {currentProduct?.name || "Product Name"}
            </CardTitle>
          </div>
        </div>
      </Card>
    </Link>
  );
};