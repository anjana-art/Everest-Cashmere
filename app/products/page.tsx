// app/products/page.tsx - FIXED VERSION (remove active filter)
import { ProductList } from "@/components/product-list";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface DatabaseProduct {
  id: string;
  stripeId: string;
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
    // Remove the where clause entirely or use a valid field
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('📦 Products from database:', products.map(p => ({
    id: p.id,
    stripeId: p.stripeId,
    name: p.name,
    price: p.price,
    areIdsDifferent: p.id !== p.stripeId
  })));

  // Check if any products have same ID as stripeId (problem!)
  const problematicProducts = products.filter(p => p.id === p.stripeId);
  if (problematicProducts.length > 0) {
    console.warn('⚠️ WARNING: Some products have Stripe IDs as database IDs:', 
      problematicProducts.map(p => p.name));
  }

  const formattedProducts: DatabaseProduct[] = products.map(product => ({
    ...product,
    price: Number(product.price),
    description: product.description || null,
    category: product.category || null,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex  items-center text-center mb-8">
        <h1 className="text-3xl font-bold ">All Products</h1>
        
       
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