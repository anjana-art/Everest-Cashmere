// components/MarinoWoolPage.tsx
'use client';
import Link from "next/link";

interface Props {
  products: any[];
  currentGender: string | null;
  material: string;
}

export default function MarinoWoolPage({ products, currentGender, material }: Props) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero - Sustainability Focus */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white rounded-2xl p-12 mb-12 text-center">
        <h1 className="text-5xl font-bold mb-4">Marino Wool</h1>
        <p className="text-xl">Nature's Performance Fabric</p>
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
          <div className="bg-white/20 px-4 py-2 rounded-full">⚡ Temperature Regulating</div>
          <div className="bg-white/20 px-4 py-2 rounded-full">🌍 Biodegradable</div>
          <div className="bg-white/20 px-4 py-2 rounded-full">💧 Moisture Wicking</div>
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="text-4xl mb-2">🌱</div>
          <div className="text-2xl font-bold">100%</div>
          <div className="text-gray-600">Renewable & Biodegradable</div>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="text-4xl mb-2">💧</div>
          <div className="text-2xl font-bold">-89%</div>
          <div className="text-gray-600">Water vs. Cotton</div>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="text-4xl mb-2">⚡</div>
          <div className="text-2xl font-bold">ZQ Certified</div>
          <div className="text-gray-600">Ethical Wool Standard</div>
        </div>
      </div>

      {/* Product Grid */}
      <h2 className="text-2xl font-light mb-6">
        {currentGender ? `${currentGender}'s ` : ''}Marino Wool Collection
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
    <Link href={`/product/${product.id}`} className="group">
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