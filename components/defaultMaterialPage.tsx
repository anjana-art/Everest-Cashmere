'use client';

import Link from 'next/link';

interface Props {
  products: any[];
  currentGender: string | null;
  material: string;
}

export default function DefaultMaterialPage({ products, currentGender, material }: Props) {
  const displayName = material?.replace(/-/g, ' ') || 'Material';
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light mb-4 capitalize">
        {currentGender ? `${currentGender}'s ` : ''}{displayName} Collection
      </h1>
      <p className="text-gray-600 mb-8">{products.length} products</p>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            No {displayName} products found.
          </p>
          <Link 
            href="/clothing"
            className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700"
          >
            Browse All Clothing
          </Link>
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
      {product.gender && (
        <p className="text-sm text-gray-500 capitalize mt-1">
          {product.gender.toLowerCase()}
        </p>
      )}
    </Link>
  );
}