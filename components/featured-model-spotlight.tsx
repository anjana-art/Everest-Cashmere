import Image from "next/image";
import { NavigationLink } from "@/components/navigation-link";

interface FeaturedModelSpotlightProps {
  imageSrc?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  href?: string;
}

export function FeaturedModelSpotlight({
  imageSrc = "/feature model pic.webp", // Replace with your saved model image path
  badge = "Artisan Signature Series",
  title = "The Pure Cream Crewneck",
  subtitle = "Himalayan Softness. European Elegance.",
  description = "Hand-spun in small batches by master weavers in Nepal using 100% Grade-A raw cashmere. Styled effortless for modern living with a supple, featherlight feel against the skin.",
  href = "/clothing/cashmere?gender=women",
}: FeaturedModelSpotlightProps) {
  return (
    <section className="py-20 px-6 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Column: Featured Model Image */}
          <div className="lg:col-span-6 relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-stone-100 group">
            <Image
              src={imageSrc}
              alt="Model wearing Himkash Handcrafted Pure Cashmere Cream Sweater"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top filter brightness-95 contrast-105 transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            
            {/* Subtle Gradient & Floating Badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-black/10" />
            <div className="absolute top-6 left-6 z-10">
              <span className="bg-white/95 backdrop-blur-md text-stone-900 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium shadow-sm border border-stone-200">
                100% Pure Cashmere
              </span>
            </div>
          </div>

          {/* Right Column: Luxury Details & Story */}
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 space-y-8">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-800 font-medium">
                {badge}
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 leading-tight">
                {title}
              </h2>
              <p className="text-lg font-serif italic text-amber-900/80">
                {subtitle}
              </p>
            </div>

            <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-light">
              {description}
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-b border-stone-200/70 py-6">
              <div>
                <span className="block text-2xl font-serif text-stone-900">12.5 µm to 19 µm </span>
                <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                  Ultra-Fine Micron
                </span>
              </div>
              <div>
                <span className="block text-2xl font-serif text-stone-900">Handloom</span>
                <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                  Nepalese Artisanal
                </span>
              </div>
            </div>

            {/* Call to Action Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <NavigationLink
                href={href}
                className="px-8 py-4 rounded-full text-sm uppercase tracking-widest font-medium bg-stone-900 text-white hover:bg-amber-800 transition-all shadow-lg hover:shadow-amber-900/20"
              >
                Shop This Piece
              </NavigationLink>

              <NavigationLink
                href="/about"
                variant="outline"
                className="px-8 py-4 rounded-full text-sm font-medium tracking-wide text-stone-800 border border-stone-300 hover:bg-stone-100 transition-colors"
              >
                Learn Craftsmanship
              </NavigationLink>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}