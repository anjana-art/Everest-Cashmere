import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Everesté | Our Mission & Story",
  description:
    "Everesté bridges Nepalese artisan craftsmanship with conscious European living. Pure cashmere, marine wool, and timeless design — made with transparency, care, and tradition.",
};

const values = [
  {
    icon: "✦",
    title: "Pure Origin",
    description:
      "Our cashmere originates from the high plateaus of Mongolia — home to the world's finest fibres. Each strand is hand-combed from free-roaming Hircus goats, then carried to Nepal where centuries-old craftsmanship transforms raw fibre into something extraordinary.",
  },
  {
    icon: "✦",
    title: "Nepalese Mastery",
    description:
      "In the workshops of Nepal, artisans use traditional drop spindles and hand looms — tools unchanged for generations. No modern machines. No shortcuts. Just skilled hands spinning yarn with a patience that cannot be replicated. This is where the softness is born.",
  },
  {
    icon: "✦",
    title: "Radical Transparency",
    description:
      "We believe you deserve to know exactly what you are wearing. Every Everesté piece comes with full disclosure: fibre origin, artisan region, material composition, and care guidance. Luxury should never be mysterious about what matters.",
  },
  {
    icon: "✦",
    title: "Slow Fashion",
    description:
      "We are not for every season. We are for every year. Our pieces are designed to outlast trends, care instructions included, so your investment deepens with time rather than diminishing. Buy less. Wear more. Keep longer.",
  },
  {
    icon: "✦",
    title: "Complete Comfort",
    description:
      "From winter's first chill to summer's warmth — we have you covered. Pure cashmere and marine wool for the colder months, and the finest organic cotton for summer. Because caring for you means caring for every season.",
  },
  {
    icon: "✦",
    title: "Artisan Economy",
    description:
      "Behind every piece is a person. We work directly with Nepalese artisan communities, ensuring fair compensation and preserving handicraft traditions — from cashmere knitwear to Mandala art, jewellery, and home décor. When you buy Everesté, you sustain a craft.",
  },
];

const materials = [
  {
    season: "Autumn — Winter",
    name: "Pure Cashmere",
    description:
      "The gold standard of natural fibres. Exceptionally soft, 8x warmer than sheep wool, and lightweight enough to layer without bulk. Our cashmere is grade A — the finest available.",
  },
  {
    season: "Spring — Autumn",
    name: "Marine Wool",
    description:
      "Rare. Refined. Resilient. Sourced exclusively from coastal breeds, marine wool carries a natural lanolin richness that makes it uniquely breathable, moisture-wicking, and enduringly soft.",
  },
  {
    season: "Summer",
    name: "Pure Cotton",
    description:
      "Because warmth is not always the goal. Our summer collection uses only the finest organic cotton — breathable, gentle on skin, and grown without compromise.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                #92400e 0px,
                #92400e 1px,
                transparent 1px,
                transparent 60px
              )`,
            }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-28 md:py-40">
          <p
            className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-8"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Est. Europe · Crafted in Nepal
          </p>
          <h1
            className="text-5xl md:text-7xl font-light text-stone-800 leading-[1.05] mb-10"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Luxury rooted
            <br />
            <em className="italic text-amber-800">in tradition.</em>
          </h1>
          <p
            className="text-lg md:text-xl text-stone-600 max-w-2xl leading-relaxed font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Everesté was born from a conviction: that the finest things in life
            should be made with care, worn with intention, and understood
            completely. We bridge Nepalese artisan mastery with a conscious
            European way of living.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span
          className="text-xs uppercase tracking-[0.4em] text-amber-700"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Our Mission
        </span>
        <blockquote
          className="mt-8 text-3xl md:text-4xl font-light text-stone-800 leading-relaxed italic"
          style={{ fontFamily: "Georgia, serif" }}
        >
          "To offer timeless pieces of pure quality — made transparently, worn
          consciously, and treasured for a lifetime."
        </blockquote>
        <div className="mt-10 w-16 h-px bg-amber-700 mx-auto" />
      </section>

      {/* The Journey */}
      <section className="bg-stone-800 text-amber-50">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p
                className="text-xs uppercase tracking-[0.4em] text-amber-400 mb-6"
                style={{ fontFamily: "Georgia, serif" }}
              >
                The Journey
              </p>
              <h2
                className="text-4xl md:text-5xl font-light leading-tight mb-8"
                style={{ fontFamily: "Georgia, serif" }}
              >
                From the roof
                <br />
                <em className="italic text-amber-300">of the world</em>
                <br />
                to your wardrobe.
              </h2>
            </div>
            <div
              className="space-y-6 text-stone-300 font-light leading-relaxed"
              style={{ fontFamily: "Georgia, serif" }}
            >
              <p>
                It begins in Mongolia, at altitude — where Hircus goats roam
                freely across vast plateaus and grow fibre of incomparable
                fineness to survive the extreme cold. Each spring, this fibre is
                hand-combed with patience, collected, and begins its journey
                south.
              </p>
              <p>
                In Nepal, artisans receive the raw fibre and begin the ancient
                process: hand-spinning on traditional drop spindles, dyeing with
                care, and weaving on looms that have existed for centuries. No
                industrial machines. No mass production. Every thread carries
                the mark of a human hand.
              </p>
              <p>
                From Lisbon, we curate, guide, and bring these pieces to you —
                with every detail of the process documented and shared. Because
                at Everesté, transparency is not a feature. It is a foundation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p
            className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            What We Stand For
          </p>
          <h2
            className="text-4xl font-light text-stone-800"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Six pillars of Everesté
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-200">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-amber-50 p-8 hover:bg-amber-100 transition-colors duration-300"
            >
              <span className="text-amber-700 text-lg mb-4 block">
                {value.icon}
              </span>
              <h3
                className="text-lg font-normal text-stone-800 mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {value.title}
              </h3>
              <p
                className="text-stone-500 text-sm leading-relaxed font-light"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section className="border-t border-stone-200 bg-stone-50">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p
              className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Our Materials
            </p>
            <h2
              className="text-4xl font-light text-stone-800"
              style={{ fontFamily: "Georgia, serif" }}
            >
              The right fibre, for every season
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {materials.map((mat) => (
              <div
                key={mat.name}
                className="border border-stone-200 bg-white p-8"
              >
                <p
                  className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {mat.season}
                </p>
                <h3
                  className="text-2xl font-light text-stone-800 mb-4"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {mat.name}
                </h3>
                <div className="w-8 h-px bg-amber-700 mb-4" />
                <p
                  className="text-stone-500 text-sm leading-relaxed font-light"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {mat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beyond Clothing */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Beyond Clothing
            </p>
            <h2
              className="text-4xl font-light text-stone-800 leading-tight mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Nepalese art,
              <br />
              <em className="italic">brought to your home.</em>
            </h2>
            <p
              className="text-stone-500 leading-relaxed font-light mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Everesté is more than a clothing brand. We carry the spirit of
              Nepalese craftsmanship into every corner of life — from
              hand-painted Mandala art and intricate jewellery to home décor
              that brings warmth and intention to your space.
            </p>
            <p
              className="text-stone-500 leading-relaxed font-light"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Every object is made by the same artisan communities we work with
              for our textiles — supporting their livelihoods, preserving their
              traditions, and sharing their extraordinary skill with the world.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Mandala Art", "Nepalese Jewellery", "Home Décor", "Handicrafts"].map(
              (item) => (
                <div
                  key={item}
                  className="border border-stone-200 bg-white p-6 text-center"
                >
                  <div className="w-8 h-8 border border-amber-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-amber-700 text-xs">✦</span>
                  </div>
                  <p
                    className="text-stone-600 text-sm font-light"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {item}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Care Promise */}
      <section className="bg-amber-800 text-amber-50">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p
            className="text-xs uppercase tracking-[0.4em] text-amber-300 mb-6"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Our Promise to You
          </p>
          <h2
            className="text-4xl md:text-5xl font-light leading-tight mb-8"
            style={{ fontFamily: "Georgia, serif" }}
          >
            We guide you — not just sell to you.
          </h2>
          <p
            className="text-amber-100 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Every piece comes with care instructions, seasonal guidance, and our
            commitment to answer any question you have. We tell you which
            material suits your climate, how to wash it, how to store it, and
            how to make it last decades. Because a piece that lasts is a piece
            worth making.
          </p>
          <Link
            href="/founders-story"
            className="inline-block border border-amber-300 text-amber-100 px-10 py-4 text-sm uppercase tracking-[0.3em] hover:bg-amber-700 transition-colors duration-300"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Read the Founder's Story
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2
          className="text-4xl font-light text-stone-800 mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Ready to experience Everesté?
        </h2>
        <p
          className="text-stone-500 font-light mb-10 max-w-xl mx-auto"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Explore our collection of pure cashmere, marine wool, and Nepalese
          handicrafts — each piece a quiet act of intention.
        </p>
        <Link
          href="/products"
          className="inline-block bg-stone-800 text-amber-50 px-12 py-4 text-sm uppercase tracking-[0.3em] hover:bg-stone-700 transition-colors duration-300"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Shop the Collection
        </Link>
      </section>
    </div>
  );
}