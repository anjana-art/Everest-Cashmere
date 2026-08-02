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
      {/* Hero - Blend Focus */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-500 text-white rounded-2xl p-12 mb-12 text-center">
        <h1 className="text-5xl font-light mb-4">Cashmere + Marino Wool</h1>
        <p className="text-xl">The Perfect Blend of Luxury and Performance</p>
        <div className="flex flex-wrap justify-center gap-6 mt-6">
          <div className="bg-white/20 px-4 py-2 rounded-full">✨ Ultra-soft Cashmere</div>
          <div className="bg-white/20 px-4 py-2 rounded-full">💪 Durable Marino</div>
          <div className="bg-white/20 px-4 py-2 rounded-full">🌡️ Temperature Regulating</div>
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
            <li>✓ 70% Cashmere / 30% Marino Wool blend</li>
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