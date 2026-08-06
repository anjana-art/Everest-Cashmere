// app/page.tsx - REFACTORED HIGH-LUXURY LANDING PAGE
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ShareButtons from "@/components/ShareButtons";
import type { Metadata } from "next";
import { SimpleImageGrid } from "@/components/simple-image-grid";
import { NavigationLink } from "@/components/navigation-link";
import { FeaturedModelSpotlight } from "@/components/featured-model-spotlight";


export const metadata: Metadata = {
  title: "Himkash | Handcrafted Himalayan Cashmere & Fine Wool",
  description:
    "Ethically hand-spun by master artisans in Nepal, bridging timeless Himalayan heritage with modern European elegance. Discover 100% pure cashmere and merino wool.",
  openGraph: {
    title: "Himkash | Handcrafted Himalayan Cashmere",
    description: "Ethically hand-spun luxury cashmere from Nepal, designed for Europe.",
    url: "https://www.himkash.com",
    siteName: "Himkash",
    images: [
      {
        url: "https://www.himkash.com/Anjana_proff_image.webp",
        width: 800,
        height: 800,
        alt: "Anjana Bhatta - Founder of Himkash",
      },
    ],
  },
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

export const revalidate = 300; //Caches for 5 minutes, then refreshes seamlessly

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 6,
    orderBy: { createdAt: "desc" },
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

  const formattedProducts: Product[] = dbProducts.map((product) => {
    let metadata: { category?: string; [key: string]: any } = {};
    if (product.metadata && typeof product.metadata === "object" && product.metadata !== null) {
      metadata = product.metadata as { category?: string; [key: string]: any };
    } else if (product.category) {
      metadata = { category: product.category };
    }
    return {
      id: product.id,
      stripeId: product.stripeId || "",
      name: product.name,
      description: product.description,
      price: Number(product.price),
      images: product.images || [],
      metadata: metadata,
    };
  });

  return (
    <div className="bg-[#FAF8F5] text-stone-800 selection:bg-amber-100 selection:text-amber-900 font-sans antialiased">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 z-0 opacity-80 scale-105 transition-transform duration-1000">
          <SimpleImageGrid />
        </div>
        
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 md:py-36">
          <div className="max-w-2xl space-y-8">
            <span className="inline-block text-xs uppercase tracking-[0.3em] font-medium text-amber-300/90 border-b border-amber-300/40 pb-1">
              Sustainable Luxury · Handcrafted in Nepal
            </span>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white leading-[1.1] tracking-tight">
              Himalayan Heritage. <br />
              <span className="italic font-light text-amber-200/90">European Elegance.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-200 leading-relaxed font-light max-w-xl">
              Discover timeless warmth in pure cashmere, fine merino wool, and our signature 50/50 blend. Each piece is hand-spun by Nepalese artisans using generational techniques.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <NavigationLink
                href="/clothing"
                className="px-8 py-4 rounded-full text-sm font-medium tracking-wide bg-amber-600 text-white hover:bg-amber-500 transition-all shadow-lg hover:shadow-amber-900/20 hover:-translate-y-0.5"
              >
                Explore Collection
              </NavigationLink>

              <NavigationLink
                href="/founders-story"
                variant="outline"
                className="px-8 py-4 rounded-full text-sm font-medium tracking-wide border border-white/30 text-white hover:bg-white hover:text-stone-900 transition-all backdrop-blur-sm"
              >
                Our Story
              </NavigationLink>
            </div>
          </div>
        </div>
      </section>

        {/* 🟢 FEATURED MODEL SPOTLIGHT COMPONENT */}
      <FeaturedModelSpotlight imageSrc="/edited featured model.webp" />

      {/* 2. VALUE PROPOSITION BAR */}
      <section className="bg-white border-y border-stone-200/60 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-xl shrink-0 text-amber-800">
              🧶
            </div>
            <div>
              <h3 className="font-serif font-medium text-stone-900 text-lg mb-1">Authentic Handloom</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Hand-spun without mass machinery. Direct support to Nepalese artisan communities.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-xl shrink-0 text-amber-800">
              🌿
            </div>
            <div>
              <h3 className="font-serif font-medium text-stone-900 text-lg mb-1">100% Sustainable Fibers</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Ethically harvested cashmere & fine wool with natural low-impact dyes.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-xl shrink-0 text-amber-800">
              ✨
            </div>
            <div>
              <h3 className="font-serif font-medium text-stone-900 text-lg mb-1">12–19 Micron Fineness</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                Exceptionably soft fibers selected for enduring comfort and year-round durability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY COLLECTIONS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-medium">Curated Wardrobe</span>
          <h2 className="text-3xl md:text-5xl font-serif text-stone-900">Explore Collections</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Women */}
          <NavigationLink
            href="/clothing/women"
            className="group relative block overflow-hidden rounded-2xl aspect-[3/4] bg-stone-200 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <Image
              src="/pink folded sweater.webp"
              alt="Women's Cashmere Collection"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-xs uppercase tracking-widest text-amber-200 font-light block mb-1">Handcrafted</span>
              <h3 className="text-2xl font-serif">Women's Collection</h3>
            </div>
          </NavigationLink>

          {/* Men */}
          <NavigationLink
            href="/clothing/men"
            className="group relative block overflow-hidden rounded-2xl aspect-[3/4] bg-stone-200 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <Image
              src="/royal_blue polo folded.webp"
              alt="Men's Wool Collection"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-xs uppercase tracking-widest text-amber-200 font-light block mb-1">Timeless</span>
              <h3 className="text-2xl font-serif">Men's Collection</h3>
            </div>
          </NavigationLink>

          {/* Unisex */}
          <NavigationLink
            href="/clothing/unisex"
            className="group relative block overflow-hidden rounded-2xl aspect-[3/4] bg-stone-200 shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <Image
              src="/blue_brunello_folded.webp"
              alt="Unisex Artisanal Collection"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute top-6 right-6 z-10">
              <span className="bg-white/90 backdrop-blur-md text-stone-900 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide shadow-sm">
                New Arrival      
              </span>
            </div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <span className="text-xs uppercase tracking-widest text-amber-200 font-light block mb-1">Versatile</span>
              <h3 className="text-2xl font-serif">Unisex Collection</h3>
            </div>
          </NavigationLink>
        </div>
      </section>

      {/* 4. FOUNDER'S STORY FEATURE */}
      <section className="bg-white py-24 border-y border-stone-200/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="md:col-span-5 relative">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-[#FAF8F5]">
                <Image
                  src="/Anjana_proff_image.webp"
                  alt="Anjana Bhatta - Founder of Himkash"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 256px, 320px"
                  priority
                />
              </div>
            </div>

            <div className="md:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-medium">The Visionary</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">
                Created by Anjana Bhatta
              </h2>
              
              <blockquote className="text-lg text-stone-600 font-serif italic border-l-2 border-amber-500 pl-4 py-1">
                "Himkash was born from a vision to bridge two worlds—the timeless craftsmanship of Nepal and the conscious lifestyle of Europe."
              </blockquote>

              <p className="text-stone-500 text-base leading-relaxed font-light">
                After moving to Portugal in 2016, I carried with me the rich heritage of Nepalese artistry. Together with my family, every garment is thoughtfully curated from high-altitude ethical sourcing to generational hand-spinning.
              </p>

              <div>
                <NavigationLink
                  href="/founders-story"
                  className="inline-flex items-center text-sm uppercase tracking-widest font-medium text-stone-900 border-b border-stone-900 pb-1 hover:text-amber-700 hover:border-amber-700 transition-colors"
                >
                  Read Founder's Full Journey →
                </NavigationLink>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. VIP LAUNCH / NEWSLETTER */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-white p-12 sm:p-16 rounded-3xl border border-stone-200/80 shadow-sm">
          <span className="text-xs uppercase tracking-[0.3em] text-amber-700 font-medium">Exclusive Access</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
            Official Launch: <span className="italic text-amber-800">July 2026</span>
          </h2>
          <p className="text-stone-500 text-base max-w-lg mx-auto font-light leading-relaxed">
            Be the first to know when our new seasonal drops arrive. Join our circle for private collection releases and artisan stories.
          </p>

          <div className="pt-2 flex justify-center">
            <NavigationLink
              href="/signup"
              className="px-10 py-4 bg-stone-900 text-white hover:bg-amber-800 rounded-full text-sm tracking-widest uppercase transition-all shadow-lg hover:shadow-stone-900/20"
            >
              Join the VIP Launch Year List
            </NavigationLink>
          </div>
        </div>
      </section>

      {/* 6. SOCIAL SHARE STRIP */}
      <section className="py-12 border-t border-stone-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-stone-400 font-medium">Share Himkash</p>
          <div className="flex justify-center">
            <ShareButtons
              title="Himkash - Handcrafted Himalayan Luxury Cashmere"
              description="Discover pure cashmere and fine wool pieces ethically hand-spun in Nepal."
              hashtag="#Himkash #SustainableLuxury #HandcraftedCashmere"
              iconSize={40}
              round={true}
              className="justify-center gap-3"
            />
          </div>
        </div>
      </section>


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Brand",
            "name": "Himkash",
            "url": "https://www.himkash.com",
            "logo": "https://www.himkash.com/himkash_logo_ragister.webp",
            "description": "Handcrafted Himalayan Cashmere & Fine Merino Wool ethically made in Nepal.",
            "foundingDate": "2026",
            "founder": {
              "@type": "Person",
              "name": "Anjana Bhatta"
            }
          }),
        }}
      />

    </div>
  );
}