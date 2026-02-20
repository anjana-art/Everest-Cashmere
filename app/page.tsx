import Image from "next/image"
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { prisma } from "@/lib/prisma";
import FoundersStory from "@/components/founderStory";
import SignupForm from "@/components/signup-form";

// Define the Product type matching your Carousel component
interface Product {
  id: string;
  stripeId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

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

  // ✅ Format products with the correct Product type
  const formattedProducts: Product[] = dbProducts.map(product => {
    // Handle metadata - convert from JsonValue to the expected structure
    let metadata: { category?: string; [key: string]: any } = {};
    
    if (product.metadata && typeof product.metadata === 'object' && product.metadata !== null) {
      metadata = product.metadata as { category?: string; [key: string]: any };
    } else if (product.category) {
      // If no metadata but we have category, use it
      metadata = { category: product.category };
    }
    
    return {
      id: product.id,
      stripeId: product.stripeId || '',
      name: product.name,
      description: product.description,
      price: Number(product.price),
      images: product.images || [],
      metadata: metadata,
    };
  });

  // Get products for carousel (first 4)
  const carouselProducts = formattedProducts.slice(0, 4);
  
  // Get products for hero carousel (all products or first 4-5)
  const heroCarouselProducts = formattedProducts.length > 0 ? formattedProducts : [];

  console.log('Home page products:', {
    totalProducts: formattedProducts.length,
    carouselProducts: carouselProducts.length,
    heroCarouselProducts: heroCarouselProducts.length,
    firstProduct: formattedProducts[0] ? {
      id: formattedProducts[0].id,
      name: formattedProducts[0].name,
      price: formattedProducts[0].price,
      metadata: formattedProducts[0].metadata
    } : null
  });

  return (
    <div> 
      {/* Hero Section with Carousel */}
      <section className="rounded bg-neutral-100 py-0 items-center sm:py-4">
        <div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-4 px-4 sm:px-16 md:grid-cols-2">
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-red-900">
              Welcome to Everesté!
            </h1>
           <p className="text-neutral-600 leading-relaxed">
                Discover timeless elegance crafted from pure cashmere and fine wool. 
                Each piece is thoughtfully handmade and hand-spun, rooted in Nepalese 
                craftsmanship and refined for a conscious European lifestyle. 

                From the quiet strength of the mountains to your wardrobe, 
                Everesté represents sustainable luxury — honoring local artisans, 
                respecting the environment, and offering enduring comfort with style.
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

          {/* Hero Carousel - Replaces the banner image */}
          <div className="relative w-full max-w-md">
            {heroCarouselProducts.length > 0 ? (
              <div className="aspect-square">
                <Carousel products={heroCarouselProducts} />
              </div>
            ) : (
              <div className="relative w-full max-w-md aspect-square bg-gray-200 rounded flex items-center justify-center">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </div>
        </div>
      </section>


     {/* Founder's story */}
   <section>
      <FoundersStory/>
      
   </section>

  <section className="py-20 px-6 bg-neutral-50">
  <div className="max-w-5xl mx-auto">

    <div className="space-y-6 text-center md:text-left">

      <h2 className="text-3xl md:text-4xl font-light tracking-wide text-red-900">
        Launching 
        <span className="block text-amber-700 font-medium">
          April 9, 2026
        </span>
      </h2>

      <div className="w-16 h-[2px] bg-amber-700 mx-auto md:mx-0"></div>

      <p className="text-neutral-700 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
        Be among the first to experience 
        <span className="text-red-900 font-medium"> Everesté</span> —
        timeless Nepalese craftsmanship reimagined for Europe.
      </p>

      <div className="pt-6 flex justify-center md:justify-start">
        <Link  href='/signup' className="px-8 py-3 cursor-pointer bg-red-900 text-white rounded-full tracking-wide 
                           hover:bg-amber-700 transition-all duration-300">
         Sign Up to Join the Launch List
        </Link>
      </div>

    </div>

  </div>
</section>




     

      {/* Category Collection Grid - 4 items */}
      <section className="py-8">
        <div className="container mx-auto px-4">
         
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Women's Collection */}
            <Link href="/products?category=CLOTHING&gender=WOMEN" className=" border bg-fuchsia-300 group relative block overflow-hidden rounded-lg aspect-square">
              {/* Banner Image - FIXED: Added leading slash */}
              <Image
                src="/stand up collar ladies sweater.webp"
                alt="Women's Collection Banner"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Title on Top Left */}
              <div className="absolute top-4 left-4">
                <h3 className="text-red-900 text-3xl font-bold drop-shadow-lg">Women's Collection</h3>
              </div>
              {/* Coming Soon on Bottom Right */}
              <div className="absolute bottom-4 right-4">
                <span className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Coming Soon
                </span>
              </div>
            </Link>

            {/* Men's Collection */}
            <Link href="/products?category=CLOTHING&gender=MEN" className=" border bg-fuchsia-300 group relative block overflow-hidden rounded-lg aspect-square">
              {/* Banner Image - FIXED: Added leading slash */}
              <Image
                src="/cashmere toyer.webp"
                alt="Men's Collection Banner"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Title on Top Left */}
              <div className="absolute top-4 left-4 ">
                <h3 className="text-red-900 text-3xl font-bold drop-shadow-lg">Men's Collection</h3>
              </div>
              {/* Coming Soon on Bottom Right */}
              <div className="absolute bottom-4 right-4">
                <span className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Coming Soon
                </span>
              </div>
            </Link>

            {/* Home Decor */}
            <Link href="/products?category=HOME_DECORE" className="  border bg-fuchsia-300 group relative block overflow-hidden rounded-lg aspect-square">
              {/* Banner Image - FIXED: Added leading slash */}
              <Image
                src="/evereste_logo_new.png"
                alt="Home Decor Banner"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Title on Top Left */}
              <div className="absolute top-4 left-4">
                <h3 className="text-red-900 text-3xl font-bold drop-shadow-lg">Home Decor</h3>
              </div>
              {/* Coming Soon on Bottom Right */}
              <div className="absolute bottom-4 right-4">
                <span className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Coming Soon
                </span>
              </div>
            </Link>

            {/* Accessories */}
            <Link href="/products?category=ACCESSORIES" className="  border bg-fuchsia-300 group relative block overflow-hidden rounded-lg aspect-square">
              {/* Banner Image - FIXED: Added leading slash */}
              <Image
                src="/scarf unisex.webp"
                alt="Accessories Banner"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Title on Top Left */}
              <div className="absolute top-4 left-4">
                <h3 className="text-red-900 text-3xl font-bold drop-shadow-lg">Accessories</h3>
              </div>
              {/* Coming Soon on Bottom Right */}
              <div className="absolute bottom-4 right-4">
                <span className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Coming Soon
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}