// app/page.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { prisma } from "@/lib/prisma";
import FoundersStory from "@/components/foundersStory";
import SignupForm from "@/components/signup-form";
import ShareButtons from '@/components/ShareButtons';
import type { Metadata } from "next";
import { SimpleImageGrid } from "@/components/simple-image-grid";

export const metadata: Metadata = {
  title: "Pure Cashmere | Kashmere & Wool | Nepalese Luxury | Finest Quality | Elegance + Softness | Timeless | Finest Fiber",
  description: "From Mountains -For LIFETIME || Browse our Collection of Handmade Cashmere sweaters and Fine Marino wool pieces. Every HIM-KASH piece is hand-spum by nepalese artisans using generational old techniques",
};

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

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
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

  const formattedProducts: Product[] = dbProducts.map(product => {
    let metadata: { category?: string; [key: string]: any } = {};
    if (product.metadata && typeof product.metadata === 'object' && product.metadata !== null) {
      metadata = product.metadata as { category?: string; [key: string]: any };
    } else if (product.category) {
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

  return (
    <div className="bg-[#FDFBF7]">
      
      {/* SECTION 1: Hero Section - FULL WIDTH with Image Grid */}
      <section className="relative w-full min-h-screen flex items-center justify-center  overflow-hidden">
        {/* Full width image grid - takes priority */}
        <div className="absolute inset-0 z-0">
          <SimpleImageGrid />
        </div>
        
        {/* Overlay content - subtle gradient for text readability */}
        <div className="relative z-10 w-full bg-gradient-to-r from-black/60 via-black/30 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-16 py-20 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              
              {/* Left side - Text Content with transparent background */}
              <div className="flex flex-col justify-center space-y-6 text-white backdrop-blur-sm bg-black/20 rounded-2xl p-6 md:p-8">
                <h1 className="text-5xl md:text-7xl font-mono tracking-tight text-amber-300">
                  Welcome to <span className="text-white">Himkash</span>
                </h1>
                <p className="text-xl text-amber-200 italic">- Himalayan Cashmere</p>
                
                <div className="w-20 h-[2px] bg-amber-400"></div>
                
                <p className="text-lg text-gray-100 leading-relaxed">
                  Discover timeless elegance crafted from pure cashmere and fine wool. 
                  Each piece is thoughtfully handmade and hand-spun, rooted in Nepalese 
                  craftsmanship and refined for a conscious European lifestyle.
                </p>
                
                <p className="text-lg text-gray-100 leading-relaxed">
                  From the quiet strength of the mountains to your wardrobe, 
                  HIM-KASH represents sustainable luxury — honoring local artisans, 
                  respecting the environment, and offering enduring comfort with style.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild className="text-lg inline-flex items-center justify-center rounded-full px-8 py-6 text-white bg-amber-600 hover:bg-amber-700 border-none transform transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
                    <Link href="/clothing">Browse all Products</Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="text-lg rounded-full px-8 py-6 border-white text-black hover:bg-white/10">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              
              {/* Right side - Empty to let image show through */}
              <div className="hidden md:block"></div>
              
            </div>
          </div>
        </div>
      </section>

      {/* BRAND VALUES STRIP - Clean white with subtle border */}
      <section className="py-16 px-6 bg-white border-b border-amber-100/50 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs tracking-[4px] uppercase text-amber-600 mb-4">Our Philosophy</p>
          <h2 className="text-3xl md:text-4xl font-light text-neutral-800 mb-6">
            Born in the Himalayas,<br className="hidden md:block" /> refined for modern living
          </h2>
          <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Every Himkash piece begins high in the mountains, where master artisans 
            hand-spin the finest cashmere using techniques passed down through generations. 
            We believe luxury should be conscious — kind to the people who create it, 
            and enduring enough to last a lifetime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🏔️", title: "Nepalese Craftsmanship", desc: "Each piece is handmade by skilled artisans in Nepal, preserving century-old traditions." },
              { icon: "🌿", title: "Sustainably Made", desc: "Pure cashmere and fine wool, sourced responsibly with respect for nature and community." },
              { icon: "✨", title: "Timeless Quality", desc: "Designed to outlast trends — pieces you'll wear and love for years to come." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <h3 className="font-medium text-neutral-800">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Launch Information - Warm amber gradient */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-50/50 to-red-50/50 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-light tracking-wide text-red-900">
              Launching 
              <span className="block text-amber-600 font-medium">
                May 20, 2026
              </span>
            </h2>
            <div className="w-16 h-[2px] bg-amber-600 mx-auto md:mx-0"></div>
            <p className="text-neutral-700 text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
              Be among the first to experience 
              <span className="text-red-900 font-medium"> HIMKASH</span> —
              timeless Nepalese craftsmanship reimagined for Europe.
            </p>
            <div className="pt-6 flex justify-center md:justify-start">
              <Link href='/signup' className="px-8 py-3 cursor-pointer bg-red-800 text-white rounded-full tracking-wide hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg">
                Sign Up to Join the Launch List
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Founder's Story - Cream background */}
      <section className="py-20 px-6 bg-[#FDFBF7] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative w-80 h-80 mx-auto rounded-full overflow-hidden shadow-xl border-4 border-amber-100">
              <Image
                src="/anjana_formal_dress.webp"
                alt="Anjana Bhatta - Founder of HIM-KASH"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-red-900">Founder's Story</h2>
              <p className="text-lg text-amber-600 font-medium">Anjana Bhatta</p>
              <p className="text-neutral-700 leading-relaxed italic">
                "From learning a new language and culture to building a business from the ground up, 
                this journey has been one of continuous growth, resilience, and purpose."
              </p>
              <p className="text-neutral-700 leading-relaxed">
                HIM-KASH was born from a vision to bridge two worlds—the timeless craftsmanship of Nepal 
                and the conscious, quality-driven lifestyle of Europe.
              </p>
              <Link href="/founders-story" className="inline-flex items-center text-amber-600 font-medium group">
                Read full story 
                <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Category Collection Grid */}
      <section className="py-16 bg-white relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 lg:gap-16">
            
            <Link href="/clothing/women" className="group relative block overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 bg-amber-50/30">
              <Image
                src="/women_s_xs_roundneck_cashmere_sweaters.webp"
                alt="Women's Collection"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
                <h3 className="text-white text-2xl md:text-4xl font-light tracking-wide drop-shadow-lg font-serif italic">
                  Women's Collection
                </h3>
              </div>
              <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
                <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg border border-white/20">
                  Coming Soon
                </span>
              </div>
            </Link>

            <Link href="/clothing/men" className="group relative block overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 bg-amber-50/30">
              <Image
                src="/men's_m_l_xl_roundneck_cashmere_sweaters.webp"
                alt="Men's Collection"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
                <h3 className="text-white text-2xl md:text-4xl font-light tracking-wide drop-shadow-lg font-serif italic">
                  Men's Collection
                </h3>
              </div>
              <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
                <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg border border-white/20">
                  Coming Soon
                </span>
              </div>
            </Link>

            <Link href="/clothing/unisex" className="group relative block overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300 bg-amber-50/30">
              <Image
                src="/himkash_logo_ragister.webp"
                alt="Unisex Collection"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
                <h3 className="text-white text-2xl md:text-4xl font-light tracking-wide drop-shadow-lg font-serif italic">
                  Uni-Sex Collection
                </h3>
              </div>
              <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
                <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg border border-white/20">
                  Coming Soon
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="relative bg-gradient-to-r from-red-800/5 to-amber-800/5 py-16 z-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-3 text-neutral-500">Share with friends:</p>
          <div className="flex justify-center">
            <ShareButtons 
              title="Check out HIM-KASH - Luxury Cashmere"
              description="Discover timeless Himalayan craftsmanship"
              hashtag="#HIMKASH #LuxuryCashmere"
              iconSize={44}
              round={true}
              className="justify-center"
            />
          </div>
        </div>
      </section>
    </div>
  );
}