import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Carousel } from "@/components/carousel";
import { prisma } from "@/lib/prisma";
import FoundersStory from "@/components/foundersStory";
import SignupForm from "@/components/signup-form";
import ShareButtons from '@/components/ShareButtons';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pure Cashmere & Wool | Everesté",
  description: "Browse our collection of  handmade cashmere sweaters and fine wool pieces.",
};

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

  return (
    <div> 
     
      {/* SECTION 1: Hero with background image roses.jpeg */}
<section className="relative min-h-[600px] md:min-h-[600px]  flex items-center justify-center overflow-hidden py-8">
  {/* Background Image - darker overlay for better readability */}
  <div className="absolute inset-0 z-0">
   {/*  <Image
      src="/rose_edit.jpeg"
      alt="Everesté background"
      fill
      className="object-cover"
      priority
      sizes="100vw"
    /> */}
    {/* Darker overlay for better text readability */}
    <div className="absolute inset-0 bg-amber-100"></div>
  </div>
  
  {/* Content - Two column layout with carousel on right */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-16 w-full">
    {/* Grid changes to single column on mobile */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Left side - Text with larger font */}
      <div className="flex flex-col justify-center max-w-md space-y-6 text-red-900 mx-auto md:mx-0">
       <h1 className="text-5xl md:text-6xl font-serif font-italian tracking-tight text-amber-700 text-center md:text-left 
                     clip-text  ">
            Welcome to <span className="text-red-900">HIM-KASH</span> ! 
          </h1>
          <p>-Himalayan Kashmere</p>
        <p className="text-xl text-red-800 leading-relaxed text-center md:text-left">
          Discover timeless elegance crafted from pure cashmere and fine wool. 
          Each piece is thoughtfully handmade and hand-spun, rooted in Nepalese 
          craftsmanship and refined for a conscious European lifestyle.
        </p>
        <p className="text-xl text-red-800 leading-relaxed text-center md:text-left">
          From the quiet strength of the mountains to your wardrobe, 
          HIM-KASH represents sustainable luxury — honoring local artisans, 
          respecting the environment, and offering enduring comfort with style.
        </p>
        
        <div className="flex justify-center md:justify-start">
        <Button 
  asChild 
  className="text-2xl inline-flex items-center justify-center rounded-full px-8 py-4 text-white 
             bg-red-800 hover:bg-amber-700 border-none w-fit
             transform transition-all duration-150
             hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
             shadow-md hover:shadow-lg active:shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            >
              <Link href="/products" className="inline-flex items-center justify-center">
                Browse all Products
              </Link>
            </Button>
        </div>
      </div>

      {/* Right side - Carousel */}
      <div className="w-full mt-8 md:mt-0">
        {heroCarouselProducts.length > 0 ? (
          <div className="w-full h-[400px] sm:h-[450px] md:h-full">
            <Carousel products={heroCarouselProducts} />
          </div>
        ) : (
          <div className="relative w-full h-[400px] bg-gray-200 rounded flex items-center justify-center">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </div>
    </div>
  </div>
</section>

      {/* BRAND VALUES STRIP */}
      <section className="py-16 px-6 bg-white border-b border-neutral-100">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs tracking-[4px] uppercase text-amber-700 mb-4">Our Philosophy</p>
          <h2 className="text-3xl md:text-4xl font-light text-neutral-800 mb-6">
            Born in the Himalayas,<br className="hidden md:block" /> refined for modern living
          </h2>
          <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Every HIMKASH piece begins high in the mountains, where master artisans 
            hand-spin the finest cashmere using techniques passed down through generations. 
            We believe luxury should be conscious — kind to the people who create it, 
            and enduring enough to last a lifetime.
          </p>

          {/* Three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="font-medium text-neutral-800">Nepalese Craftsmanship</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Each piece is handmade by skilled artisans in Nepal, preserving century-old traditions.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <span className="text-2xl">🌿</span>
              </div>
              <h3 className="font-medium text-neutral-800">Sustainably Made</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Pure cashmere and fine wool, sourced responsibly with respect for nature and community.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-medium text-neutral-800">Timeless Quality</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Designed to outlast trends — pieces you'll wear and love for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Launch Information - April 9, 2026 */}
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
              <Link href='/signup' className="px-8 py-3 cursor-pointer bg-red-900 text-white rounded-full tracking-wide 
                                 hover:bg-amber-700 transition-all duration-300">
                Sign Up to Join the Launch List
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Founder's Story with Round Image and Less Text */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Founder Image - ROUND */}
            <div className="relative w-80 h-80 mx-auto rounded-full overflow-hidden shadow-xl">
              <Image
                src="/anjana_formal_dress.jpeg"
                alt="Anjana Bhatta - Founder of Everesté"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Founder Story Preview - Less Text */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-red-900">Founder's Story</h2>
              
              <p className="text-neutral-700 leading-relaxed">
                Storytelling has always been a part of my life. This is my lifetime story — a journey of becoming — shared with anyone who feels curious enough to listen.
              </p>
              
              <p className="text-neutral-700 leading-relaxed">
                🇳🇵🇵🇹 Hi, my name is Anjana Bhatta. I still remember the day I arrived in Portugal in 2016. There was hope, a little fear of the unknown, but mostly the dreams of a 23-year-old girl imagining what life could become.
              </p>
              
              <Link 
                href="/founders-story" 
                className="inline-flex items-center text-amber-700 font-medium group"
              >
                Read full story 
                <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
  {/* SECTION 4: Category Collection Grid - 4 items with smaller size */}
<section className="py-16">
  <div className="container mx-auto px-4 max-w-6xl"> {/* Increased max-width for better spread */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 lg:gap-16"> {/* Increased gaps for better spacing */}
      
      {/* Women's Collection */}
      <Link href="/products?category=CLOTHING&gender=WOMEN" className="border bg-fuchsia-50 hover:bg-fuchsia-100 group relative block overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300">
        <Image
          src="/women_s_xs_roundneck_cashmere_sweaters.jpg"
          alt="Women's Collection Banner"
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Lighter gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
        
        {/* Collection Name at BOTTOM */}
        <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
          <h3 className="text-white text-2xl md:text-4xl font-light tracking-wide drop-shadow-lg font-['Playfair_Display'] italic">
            Women's Collection
          </h3>
        </div>
        
        {/* Coming Soon at TOP */}
        <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
          <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg border border-white/20">
            Coming Soon
          </span>
        </div>
      </Link>

      {/* Men's Collection */}
      <Link href="/products?category=CLOTHING&gender=MEN" className="border bg-fuchsia-50 hover:bg-fuchsia-100 group relative block overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300">
        <Image
          src="/men's_m_l_xl_roundneck_cashmere_sweaters.jpg"
          alt="Men's Collection Banner"
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Lighter gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
        
        {/* Collection Name at BOTTOM */}
        <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
          <h3 className="text-white text-2xl md:text-4xl font-light tracking-wide drop-shadow-lg font-['Playfair_Display'] italic">
            Men's Collection
          </h3>
        </div>
        
        {/* Coming Soon at TOP */}
        <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
          <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg border border-white/20">
            Coming Soon
          </span>
        </div>
      </Link>

      {/* Home Decor */}
      <Link href="/products?category=HOME_DECORE" className="border bg-fuchsia-50 hover:bg-fuchsia-100 group relative block overflow-hidden rounded-xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-300">
        <Image
          src="/himkash_clean.png"
          alt="Home Decor Banner"
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Lighter gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
          <h3 className="text-white text-2xl md:text-4xl font-light tracking-wide drop-shadow-lg font-['Playfair_Display'] italic">
            Uni-Sex Collection
          </h3>
        </div>
        
        {/* Coming Soon at TOP */}
        <div className="absolute top-3 right-3 md:top-5 md:right-5 z-10">
          <span className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg border border-white/20">
            Coming Soon
          </span>
        </div>
      </Link>

      
    </div>
  </div>
</section>
      {/* SECTION 5: Round Buttons for Contact, About, FAQ */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            
            <Link href="/contact" className="group flex flex-col items-center">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-red-900 flex items-center justify-center 
                            group-hover:bg-amber-500 transition-colors duration-300 shadow-lg">
                <svg className="w-12 h-12 md:w-14 md:h-14 text-amber-100 group-hover:text-white transition-colors" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="mt-4 text-lg font-medium text-red-900 group-hover:text-amber-700 transition-colors">
                Contact Us
              </span>
            </Link>
            
            <Link href="/about" className="group flex flex-col items-center">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-red-900 flex items-center justify-center 
                            group-hover:bg-amber-500 transition-colors duration-300 shadow-lg">
                <svg className="w-12 h-12 md:w-14 md:h-14 text-amber-100 group-hover:text-white transition-colors" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="mt-4 text-lg font-medium text-red-900 group-hover:text-amber-700 transition-colors">
                About Us
              </span>
            </Link>
            
            <Link href="/frequentlyAskedQuestions" className="group flex flex-col items-center">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-red-900 flex items-center justify-center 
                            group-hover:bg-amber-500 transition-colors duration-300 shadow-lg">
                <svg className="w-12 h-12 md:w-14 md:h-14 text-amber-100 group-hover:text-white transition-colors" 
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="mt-4 text-lg font-medium text-red-900 group-hover:text-amber-700 transition-colors">
                FAQ
              </span>
            </Link>
            
          </div>
        </div>
      </section>

       {/* Hero Section with Share Buttons */}
      <section className="relative bg-gradient-to-r from-red-100 to-amber-100 text-white py-20">
        <div className="container mx-auto px-4 text-center">
         
          
          {/* Share Buttons in Hero */}
          <div className="mt-12">
            <p className="text-m mb-3 opacity-90 text-red-900">Share with friends:</p>
            <div className="flex justify-center">
              <ShareButtons 
                title="Check out this amazing store!"
                description="Great products and amazing deals"
                hashtag="#AmazingStore"
                iconSize={44}
                round={true}
                className="justify-center"
              />
            </div>
          </div>
          
         
        </div>
      </section>

      {/* SECTION 6: Footer - keep existing footer component here */}
      {/* Your existing footer component should go here */}
      
    </div>
  );
}