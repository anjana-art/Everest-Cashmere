// app/products/page.tsx - FIXED VERSION
import { ProductList } from "@/components/product-list";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Match the exact Product type expected by ProductList component
// Check what ProductList expects and use the same interface
interface Product {
  id: string;
  stripeId: string; // Must be string, not string | null
  name: string;
  description: string | null;
  price: number;
  images: string[];
  metadata?: any;
  category?: string | null;
}

export default async function ProductsPage() {
  // Fetch products from your database
  const products = await prisma.product.findMany({
    select: {
      id: true,
      stripeId: true,
      name: true,
      description: true,
      price: true,
      images: true,
      metadata: true,
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('📦 Products from database:', products.length);

  // Convert to the Product type expected by ProductList
  const formattedProducts: Product[] = products.map(product => ({
    id: product.id,
    // Ensure stripeId is always a string (not null)
    stripeId: product.stripeId || product.id, // Use product.id as fallback if stripeId is null
    name: product.name,
    description: product.description || null,
    price: Number(product.price),
    images: product.images || [],
    metadata: product.metadata || {},
    category: product.category || null,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-center mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
      </div>
      
      {formattedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No products found in database.</div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              You need to sync products from Stripe first.
            </p>
            <a 
              href="/api/sync-products" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Sync Products Now
            </a>
          </div>
        </div>
      ) : (
        <ProductList products={formattedProducts} />
      )}
    </div>
  );
}