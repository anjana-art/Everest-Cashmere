// components/FoundersStory.jsx
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

      {/* Story content */}
      <div className="space-y-6 text-gray-700 leading-relaxed">
        {/* Opening */}
        <div className="bg-amber-50 p-8 rounded-2xl border-l-4 border-amber-500 shadow-sm">
          <p className="text-lg">
            HIM-KASH was born from a vision to bridge two worlds—the timeless craftsmanship of Nepal 
            and the conscious, quality-driven lifestyle of Europe.
          </p>
        </div>

        {/* Journey */}
        <div className="grid gap-5">
          <p className="bg-white p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700">🇳🇵 → 🇵🇹</span>
            After moving to Portugal in 2016, I discovered a deep appreciation for European 
            sophistication while carrying the rich heritage of Nepalese artistry. This fusion 
            became the foundation of HIM-KASH.
          </p>

          <p className="bg-amber-50/50 p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700">🎯</span>
            Our mission is simple: deliver exceptional cashmere and fine wool products that combine 
            Himalayan authenticity with contemporary European elegance. Every piece tells a story 
            of patience, skill, and cultural pride.
          </p>

          <p className="bg-white p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700">🧶</span>
            Growing up surrounded by Nepalese craftsmanship, I learned early that quality cannot be rushed. 
            From ethical sourcing to artisanal finishing, each garment reflects generations of expertise 
            and respect for natural materials.
          </p>

          <div className="bg-gradient-to-r from-amber-50 to-white p-8 rounded-2xl border border-amber-200 shadow-sm">
            <p className="font-semibold text-amber-700 mb-3">🤝 Built on Partnership</p>
            <p className="mb-4">
              HIM-KASH is supported by a dedicated team. My husband, Dipak Shrestha, leads our digital 
              strategy, while my brother, Keshav Bhatta, oversees manufacturing and serves as business 
              advisor in Nepal.
            </p>
            <p>
              Together, we ensure ethical production, transparent operations, and uncompromising 
              quality from the Himalayas to your home.
            </p>
          </div>

          <p className="bg-amber-50/50 p-6 rounded-xl italic text-gray-600 border-l-4 border-amber-300">
            "From learning a new language and culture to building a business from the ground up, 
            this journey has been one of continuous growth, resilience, and purpose."
          </p>

          <p className="bg-white p-6 rounded-xl shadow-sm">
            <span className="font-semibold text-amber-700">✨</span>
            HIM-KASH is more than a brand—it's a commitment to sustainable luxury. We believe in 
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

      {/* Footer */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <div className="flex justify-center space-x-2">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>
        <p className="mt-2 text-amber-600 font-medium">
          Handmade in Nepal | Designed for Europe
        </p>
      </div>
    </div>
  );
}