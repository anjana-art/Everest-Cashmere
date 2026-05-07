'use client';
import Link from 'next/link';
import Image from 'next/image'; // ✅ ADDED: Import Next.js Image
import { ProductCard } from './product-card';

// ✅ ADDED: Static images for better performance
const cashmereBackground = "/cashmere-hero-bg.webp"; // Create this image or use existing

export default function CashmerePage({ products, currentGender, material }: any) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section - Luxury Storytelling with Optimized Background */}
      <div className="relative h-[500px] rounded-2xl overflow-hidden mb-12 bg-gradient-to-r from-amber-900 to-amber-700">
        {/* ✅ OPTIMIZED: Hero background image with proper Next.js Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image3.webp"
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
              Pure Cashmere
            </h1>
            <p className="text-xl max-w-2xl mx-auto px-4">
              Sourced from the finest Mongolian goats, our cashmere represents 
              the pinnacle of luxury, softness, and timeless elegance.
            </p>
          </div>
        </div>
      </div>

      {/* Heritage Story - Unique to Cashmere */}
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-3xl font-light mb-4">The Cashmere Heritage</h2>
          <p className="text-gray-700 leading-relaxed">
            For over three decades, we've partnered with herders in the Altai Mountains, 
            where the harsh winters produce the finest cashmere fibers in the world.
          </p>
        </div>
        <div className="bg-amber-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">Why Our Cashmere is Special:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ 15μm ultra-fine fibers</li>
            <li>✓ 100% ethically sourced</li>
            <li>✓ Hand-combed during natural molting</li>
            <li>✓ 30+ years of craftsmanship</li>
          </ul>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} currentGender={currentGender} />
      
      {/* Care Instructions - Unique to Cashmere */}
      <div className="mt-16 p-6 bg-gray-50 rounded-lg text-center">
        <h3 className="font-semibold mb-2">Caring for Your Cashmere</h3>
        <p className="text-gray-600 text-sm">
          Hand wash cold, lay flat to dry, and store folded with cedar blocks.
        </p>
      </div>
    </div>
  );
}

function ProductGrid({ products, currentGender }: any) {
  return (
    <>
      <h2 className="text-2xl font-light mb-6">
        {currentGender ? `${currentGender}'s ` : ''}Cashmere Collection
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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