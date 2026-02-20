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
        <div className="relative h-80 w-full">
          <PlaceholderImage /> {/* Use placeholder here */}
        </div>
      </Card>
    );
  }

  const currentProduct = products[current];
  const productUrl = `/products/${currentProduct.id}`;

  return (
    <Link href={productUrl}>
      <Card className="flex flex-col relative overflow-hidden rounded-lg shadow-md border-gray-300 hover:shadow-xl transition-shadow duration-300 group">
        {/* Image Container - full background */}
        <div className="relative h-80 w-full">
          {currentProduct?.images?.[0] ? (
            <Image
              src={currentProduct.images[0]}
              alt={currentProduct.name || "Product image"}
              fill
              style={{ objectFit: "contain" }}
              className=" object-contain transition-opacity duration-500 ease-in-out group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          ) : (
            <PlaceholderImage />
          )}
          
          {/* Title at the top - no overlay */}
          <CardTitle className="absolute top-0 left-4 right-4 text-2xl font-2xl text-red-900 drop-shadow-lg z-10">
            {currentProduct?.name || "Product Name"}
          </CardTitle>
        </div>
      </Card>
    </Link>
  );
};