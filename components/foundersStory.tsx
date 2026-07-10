// components/FoundersStory.jsx - WITH FOUNDER IMAGE

import Image from "next/image";

export default function FoundersStory() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Decorative header */}
      <div className="text-center mb-12">
        <div className="inline-block">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative">
            Founder's Story
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-500 rounded-full"></span>
          </h1>
        </div>
        <p className="text-lg text-amber-600 font-medium mt-6">Anjana Bhatta</p>
      </div>

      {/* Founder Image Section - ADDED */}
      <div className="mb-12 flex justify-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-xl border-4 border-amber-200">
          <Image
            src="/Anjana_proff_image.webp"
            alt="Anjana Bhatta - Founder of HIM-KASH"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 192px, 256px"
            priority
          />
        </div>
      </div>

      {/* Story content */}
      <div className="space-y-6 text-gray-700 leading-relaxed">
        {/* Opening with decorative image */}
        <div className="bg-amber-50 p-8 rounded-2xl border-l-4 border-amber-500 shadow-sm relative overflow-hidden">
          {/* Decorative background image */}
          <div className="absolute right-0 top-0 w-32 h-32 opacity-5 pointer-events-none">
            <Image
              src="/himkash_favicon.png"
              alt=""
              fill
              className="object-contain"
              sizes="128px"
              aria-hidden="true"
            />
          </div>
          <p className="text-lg relative z-10">
            Himkash was born from a vision to bridge two worlds—the timeless craftsmanship of Nepal 
            and the conscious, quality-driven lifestyle of Europe.
          </p>
        </div>

        {/* Journey */}
        <div className="grid gap-5">
          <p className="bg-white p-6 rounded-xl shadow-sm relative overflow-hidden">
            <span className="relative z-10 inline-flex items-center gap-2">
              <span className="font-semibold text-amber-700 text-xl">🇳🇵 → 🇵🇹</span>
            </span>
            <span className="relative z-10 block mt-2">
              After moving to Portugal in 2016, I discovered a deep appreciation for European 
              sophistication while carrying the rich heritage of Nepalese artistry. This fusion 
              became the foundation of Himkash.
            </span>
          </p>

          <p className="bg-amber-50/50 p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700 text-xl inline-block mr-2">🎯</span>
            Our mission is simple: deliver exceptional cashmere and fine wool products that combine 
            Himalayan authenticity with contemporary European elegance. Every piece tells a story 
            of patience, skill, and cultural pride.
          </p>

          <p className="bg-white p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700 text-xl inline-block mr-2">🧶</span>
            Growing up surrounded by Nepalese craftsmanship, I learned early that quality cannot be rushed. 
            From ethical sourcing to artisanal finishing, each garment reflects generations of expertise 
            and respect for natural materials.
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-white p-8 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
            {/* Decorative subtle pattern */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-5 pointer-events-none">
              <Image
                src="/himkash_favicon.png"
                alt=""
                fill
                className="object-contain"
                sizes="96px"
                aria-hidden="true"
              />
            </div>
           <p className="font-semibold text-amber-700 mb-3 text-lg relative z-10"> Solo Project</p>
          <p className="mb-4 relative z-10">
            Himkash is my dream, born from a deep desire to share Nepal's rich textile heritage with Europe. The most fascinating thing
             about a Himkash piece is the careful steps taken throughout the process—like hand-spinning,
             hand-knitting using traditional techniques, natural dyeing, linking, mending, and careful inspection. 
              
          </p>
          <p className="relative z-10">
            With the support of my family—my husband, Dipak Shrestha, leading our digital strategy, and my brother, Keshav Bhatta, managing manufacturing in Nepal as my business advisor—I ensure that each garment reflects my deepest
             values of ethical sourcing, artisanal integrity, and timeless elegance; this is my story, my purpose, and my promise to you.
          </p>
          </div>

          <p className="bg-amber-50/50 p-6 rounded-xl italic text-gray-600 border-l-4 border-amber-300">
            "From learning a new language and culture to building a business from the ground up, 
            this journey has been one of continuous growth, resilience, and purpose."
          </p>

          <p className="bg-white p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700 text-xl inline-block mr-2">✨</span>
            Himkash is more than a brand—it's a commitment to sustainable luxury. We believe in 
            timeless design, honest craftsmanship, and creating pieces that you'll treasure for years, 
            not seasons.
          </p>

          {/* Closing */}
          <div className="text-center mt-6">
            <p className="inline-block bg-amber-500 text-white px-8 py-4 rounded-full text-lg font-medium shadow-lg">
              Thank you for being part of our journey. 💫
            </p>
          </div>
        </div>
      </div>

      {/* Footer with decorative elements */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <div className="flex justify-center space-x-2">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
        <p className="mt-2 text-amber-600 font-medium">
          Handmade in Nepal | Designed for Europe
        </p>
        
        {/* Small decorative logo at bottom */}
        <div className="relative w-8 h-8 mx-auto mt-4 opacity-50">
          <Image
            src="/himkash_favicon.png"
            alt="HIMKASH"
            fill
            className="object-contain"
            sizes="32px"
          />
        </div>
      </div>
    </div>
  );
}