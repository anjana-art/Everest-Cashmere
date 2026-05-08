// app/clothing/page.tsx
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Clothing | HIM-KASH',
  description: 'Discover our complete collection of handmade cashmere and fine wool clothing.',
};

export default async function ClothingPage() {
  const products = await prisma.product.findMany({
    where: {
      category: 'CLOTHING',
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Get unique materials for quick filters
  const materials = await prisma.product.findMany({
    where: { category: 'CLOTHING', isActive: true },
    select: { clothingType: true },
    distinct: ['clothingType']
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-light mb-4">All Clothing</h1>
      <p className="text-gray-600 mb-8">{products.length} products</p>
      
      {/* Quick Material Links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <span className="text-gray-500">Shop by material:</span>
        {materials.map(m => m.clothingType && (
          <Link
            key={m.clothingType}
            href={`/clothing/${m.clothingType.toLowerCase().replace(/_/g, '-')}`}
            className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-amber-100 transition"
          >
            {m.clothingType.toLowerCase().replace(/_/g, ' ')}
          </Link>
        ))}
      </div>
      
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-3">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                )}
              </div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-amber-700 font-semibold mt-1">
                €{product.price.toFixed(2)}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}