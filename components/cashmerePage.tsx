'use client';
import Link from 'next/link';
import Image from 'next/image'; // ✅ ADDED: Import Next.js Image
import { ProductCard } from './product-card';

// ✅ ADDED: Static images for better performance
const cashmereBackground = "/cashmere_stacked.webp"; // Create this image or use existing

export default function CashmerePage({ products, currentGender, material }: any) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section - Luxury Storytelling with Optimized Background */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-amber-900 to-amber-700">
        {/* ✅ OPTIMIZED: Hero background image with proper Next.js Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/polo light blue zoom.webp"
            alt="Luxury Cashmere"
            fill
            className="object-cover"
            sizes="100vw"
            priority
            quality={85}
            onError={(e) => {
              // Fallback if image doesn't exist - hide the image element
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-20">
          <div>
            <h1 className="text-5xl md:text-7xl font-light mb-4 tracking-wide">
             A Grade Pure Cashmere
            </h1>
            <p className="text-xl max-w-2xl mx-auto px-4">
             Handcrafted in Nepal , using Generational traditional techniques which ensures quality, softness and longevity
            </p>
          </div>
        </div>
      </div>

      

      {/* Product Grid */}
      <ProductGrid products={products} currentGender={currentGender} />
      
     
    </div>
  );
}

function ProductGrid({ products, currentGender }: any) {
  return (
    <>
      <h2 className="text-2xl font-light mb-6">
        {currentGender ? `${currentGender}'s ` : ''}Cashmere Collection
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any, index: number) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            priority={index < 4} // First 4 products load immediately
          />
        ))}
      </div>
    </>
  );
}