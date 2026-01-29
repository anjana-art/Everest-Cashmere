import Image from "next/image"
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { prisma } from "@/lib/prisma"; // Import your Prisma client

export default async function Home() {
  // ✅ FETCH FROM YOUR DATABASE, NOT STRIPE
  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true, // Only show active products
    },
    take: 6, // Get at least 6 for carousel + banner
    orderBy: {
      createdAt: 'desc', // Show newest first
    },
    select: {
      id: true,
      stripeId: true,
      name: true,
      description: true,
      price: true,
      images: true,
      metadata: true,
      isActive: true,
      category: true,
    },
  });

  // ✅ Format products for your components
  const formattedProducts = dbProducts.map(product => ({
    id: product.id, // Database ID
    stripeId: product.stripeId || '', // Stripe ID (if exists)
    name: product.name,
    description: product.description,
    price: Number(product.price), // Convert Decimal to number
    images: product.images || [],
    metadata: product.metadata || {},
  }));

  // Get products for carousel (first 4)
  const carouselProducts = formattedProducts.slice(0, 4);
  
  // Get a product for the banner (use 3rd product or first if less than 3)
  const bannerProduct = formattedProducts.length >= 3 
    ? formattedProducts[2] 
    : formattedProducts[0] || null;

  console.log('Home page products:', {
    totalProducts: formattedProducts.length,
    carouselProducts: carouselProducts.length,
    bannerProduct: bannerProduct ? {
      id: bannerProduct.id,
      name: bannerProduct.name,
      price: bannerProduct.price,
      hasImage: bannerProduct.images?.length > 0
    } : null,
    firstProduct: formattedProducts[0] ? {
      id: formattedProducts[0].id,
      name: formattedProducts[0].name,
      price: formattedProducts[0].price,
      priceType: typeof formattedProducts[0].price,
      images: formattedProducts[0].images?.length
    } : null
  });

  return (
    <div> 
      {/* Hero Section */}
      <section className="rounded bg-neutral-100 py-0 items-center sm:py-4">
        <div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8 px-8 sm:px-16 md:grid-cols-2">
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-red-900">
              Welcome to Everesté!
            </h1>
            <p className="text-neutral-600">
              Discover the timeless elegance with style. Pure Cashmere. Handmade with love, 
              wrapped under the mountain and direct to your closet. Support sustainable, 
              luxury and timeless fashion from Everesté. Because we care: Environment friendly, 
              local artisans and your comfort along with style.
            </p>
            
            <Button 
              asChild 
              className="text-2xl inline-flex items-center justify-center rounded-full px-6 py-3 text-white bg-amber-600 hover:bg-amber-500"
            >
              <Link href="/products" className="inline-flex items-center justify-center">
                Browse all Products
              </Link>
            </Button>
          </div>

          {/* Banner Image - Use database product */}
          {bannerProduct?.images?.[0] ? (
            <div className="relative w-full max-w-md aspect-square">
              <Image
                alt={bannerProduct.name || "Banner Image"}
                src={bannerProduct.images[0]}
                fill
                className="rounded object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <div className="relative w-full max-w-md aspect-square bg-gray-200 rounded flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Featured Products
        </h2>
        <Carousel products={carouselProducts} />
      </section>

      {/* Optional: Show all products in a grid */}
      {formattedProducts.length > 0 && (
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Our Collection
          </h2>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {formattedProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4"
                >
                  {product.images?.[0] ? (
                    <div className="relative aspect-square mb-4">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded mb-4 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No image</p>
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    €{typeof product.price === 'number' && !isNaN(product.price) 
                      ? product.price.toFixed(2) 
                      : '0.00'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}