// components/CashmereMarinoPage.tsx
'use client';

import Link from 'next/link';

interface Props {
  products: any[];
  currentGender: string | null;
  material: string;
}

export default function CashmereMarinoPage({ products, currentGender, material }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero - Full Width Banner with Background Image */}
      <div className="relative -mx-4 md:-mx-8 lg:-mx-12 rounded-none md:rounded-2xl overflow-hidden mb-12">
        <div 
          className="relative w-full min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-center justify-center"
          style={{
            backgroundImage: 'url("/cashmere-marino-banner.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dark gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
          
          {/* Content - centered with max-width */}
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
            <div className="inline-block mb-4 px-4 py-1 border border-white/30 rounded-full text-xs uppercase tracking-wider text-white/80 backdrop-blur-sm bg-white/10">
              Premium Collection
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-light mb-4 tracking-tight">
              Cashmere + Marino Wool
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl font-light text-white/90 mb-8 max-w-2xl mx-auto">
              The Perfect Blend of Luxury and Performance
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full text-sm md:text-base border border-white/20">
                ✨ Ultra-soft Cashmere
              </div>
              <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full text-sm md:text-base border border-white/20">
                💪 Durable Marino
              </div>
              <div className="bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full text-sm md:text-base border border-white/20">
                🌡️ Temperature Regulating
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-amber-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Why This Blend?</h3>
          <p className="text-gray-700 leading-relaxed">
            Combining the unparalleled softness of cashmere with the durability 
            and breathability of Marino wool creates the perfect year-round fabric.
          </p>
        </div>
        <div className="bg-amber-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Key Benefits</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ 50% Cashmere / 50% Marino Wool blend</li>
            <li>✓ Enhanced durability without sacrificing softness</li>
            <li>✓ Perfect for all seasons</li>
            <li>✓ Retains shape better than pure cashmere</li>
          </ul>
        </div>
      </div>

      {/* Product Grid */}
      <h2 className="text-2xl font-light mb-6">
        {currentGender ? `${currentGender}'s ` : ''}Blend Collection
      </h2>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        )}
      </div>
      <h3 className="font-medium text-gray-900 group-hover:text-amber-600 transition">
        {product.name}
      </h3>
      <p className="text-amber-700 font-semibold mt-1">
        ${product.price.toFixed(2)}
      </p>
    </Link>
  );
}