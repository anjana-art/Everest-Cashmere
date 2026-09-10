import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Himkash | Our Mission & Story",
  description:
    "Himkash brings Nepalese craftsmanship to contemporary European living through pure cashmere and featherlight cashmere–merino pieces, handcrafted for warmth, layering, and year-round comfort.",
};

const values = [
  {
    icon: "✦",
    title: "Pure Origin",
    description:
      "Fine fibres, chosen at their source for softness, warmth, and natural lightness.",
  },
  {
    icon: "✦",
    title: "Nepalese Mastery",
    description:
      "Spun, knitted, and finished in Nepal by skilled hands shaped by generations of craft.",
  },
  {
    icon: "✦",
    title: "Radical Transparency",
    description:
      "Clear composition, honest origins, and the story behind every piece.",
  },
  {
    icon: "✦",
    title: "Slow Fashion",
    description:
      "Fewer, better pieces designed to be worn often and kept for years.",
  },
  {
    icon: "✦",
    title: "Comfort Through the Seasons",
    description:
      "Winter warmth and featherlight layers for cool European evenings.",
  },
  {
    icon: "✦",
    title: "Artisan Economy",
    description:
      "Every choice supports skilled makers and keeps Nepalese textile knowledge in motion.",
  },
];

const materials = [
  {
    season: "Autumn — Winter",
    name: "Pure Cashmere",
    description:
      "Exceptional softness. Natural warmth. Remarkably little weight.",
  },
  {
    season: "All Year — Layering",
    name: "Cashmere & Merino 50/50",
    description:
      "A featherlight balance of softness, breathability, and resilience.",
  },
  {
    season: "Transitional Seasons",
    name: "Fine Merino Wool",
    description:
      "Breathable comfort and refined structure as the seasons change.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero — large weaving image with descriptive caption below */}
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

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left — welcome text */}
            <div>
              <p
                className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-8"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Est. Europe · Crafted in Nepal
              </p>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-light text-stone-800 leading-[1.05] mb-10"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Luxury rooted
                <br />
                <em className="italic text-amber-800">in tradition.</em>
              </h1>

              <p
                className="text-lg md:text-xl text-stone-600 max-w-xl leading-relaxed font-light"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Himkash was born from a conviction: that the finest things in
                life should be made with care, worn with intention, and
                understood completely. We bridge Nepalese artisan mastery with
                a conscious European way of living.
              </p>
            </div>

            {/* Right — large weaving image with caption */}
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden group animate-[fadeUp_1s_ease-out]">
                <Image
                  src="/himkash-traditional-weaving-process-nepal.webp"
                  alt="Traditional Nepalese handloom machine used for weaving cashmere shawls"
                  fill
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent" />
              </div>

              {/* Descriptive caption below the image */}
              <p
                className="mt-5 text-sm text-stone-500 font-light leading-relaxed italic"
                style={{ fontFamily: "Georgia, serif" }}
              >
                A traditional Nepalese handloom — the wooden frame on which
                skilled artisans weave pure cashmere yarn into shawls and
                knitwear. Each pass of the shuttle is guided by hand, a
                technique passed down through generations of Himalayan
                craftsmanship.
              </p>
            </div>
          </div>
        </div>

        {/* keyframe for soft fade-up on load */}
        <style>{`
          @keyframes fadeUp {
            0% { opacity: 0; transform: translateY(24px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
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

      {/* The Journey — with two images side by side */}
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
                across vast plateaus and develop an exceptionally fine undercoat
                to endure the extreme cold. This precious fibre begins its
                journey south, selected for softness, warmth, and natural
                lightness.
              </p>

              <p>
                In Nepal, skilled artisans transform these fibres through
                techniques shaped by generations of textile craftsmanship. From
                spinning and knitting to finishing by hand, each stage is
                approached with patience, skill, and close attention to detail.
                Every piece carries the presence of the people who made it.
              </p>

              <p>
                From Portugal, we curate these pieces for a European way of
                living — balancing warmth, lightness, layering, and year-round
                versatility. From winter cashmere to featherlight openwork
                knits, every piece is chosen with both place and season in mind.
              </p>
            </div>
          </div>

          {/* Two images side by side — workshop craftsmanship + garment finishing */}
          <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Workshop craftsmanship */}
            <div className="relative aspect-[4/3] overflow-hidden group animate-[fadeUp_1s_ease-out]">
              <Image
                src="/himkash-nepal-workshop-craftsmanship.webp"
                alt="Himkash artisan workshop in Nepal — careful craftsmanship"
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p
                className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Inside the workshop · Nepal
              </p>
            </div>

            {/* Garment finishing */}
            <div className="relative aspect-[4/3] overflow-hidden group animate-[fadeUp_1s_ease-out_0.15s_both]">
              <Image
                src="/himkash-nepal-garment-finishing-workshop.webp"
                alt="Himkash garment finishing workshop in Nepal — hand-finished details"
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p
                className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Garment finishing · Nepal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Six Pillars — concise, visual, and easy to scan */}
      <section className="relative overflow-hidden bg-[#f8f1e5] px-6 py-20 md:py-28">
        <div className="pillar-orb absolute -right-24 top-8 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-3xl text-center reveal-copy">
            <p
              className="mb-4 text-xs uppercase tracking-[0.4em] text-amber-700"
              style={{ fontFamily: "Georgia, serif" }}
            >
              What We Stand For
            </p>
            <h2
              className="text-4xl font-light text-stone-800 md:text-5xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Six promises. <em className="text-amber-800">One standard.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-stone-500 md:text-base">
              Everything we make begins with origin, intention, and respect for
              the hands behind it.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, index) => (
              <article
                key={value.title}
                className="pillar-card group relative overflow-hidden border border-stone-300/70 bg-amber-50/70 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-amber-700/40 hover:bg-white hover:shadow-[0_24px_60px_-36px_rgba(120,53,15,0.65)]"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <span className="absolute right-5 top-3 font-serif text-5xl font-light text-amber-900/[0.06] transition-colors duration-500 group-hover:text-amber-900/[0.1]">
                  0{index + 1}
                </span>
                <span className="mb-5 block text-lg text-amber-700 transition-transform duration-500 group-hover:rotate-45">
                  {value.icon}
                </span>
                <h3
                  className="mb-3 text-xl font-normal text-stone-800"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {value.title}
                </h3>
                <p className="max-w-xs text-sm font-light leading-6 text-stone-500">
                  {value.description}
                </p>
                <div className="mt-6 h-px w-8 bg-amber-700 transition-all duration-500 group-hover:w-16" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Materials — one editorial story instead of long repeated sections */}
      <section className="overflow-hidden bg-stone-900 text-amber-50">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[460px] overflow-hidden lg:min-h-[720px]">
            <Image
              src="/pink-yarn.webp"
              alt="Pink cashmere yarn prepared in a Nepalese workshop"
              fill
              className="material-image object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-900/5 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12">
              <p className="text-xs uppercase tracking-[0.38em] text-amber-200">
                Touched by many hands. Rushed by none.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-16 lg:py-20">
            <div className="reveal-copy">
              <p className="mb-5 text-xs uppercase tracking-[0.4em] text-amber-400">
                Our Materials
              </p>
              <h2
                className="max-w-lg text-4xl font-light leading-tight md:text-5xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Softness with a
                <em className="block text-amber-300">reason to remain.</em>
              </h2>
              <p className="mt-6 max-w-lg font-light leading-7 text-stone-300">
                Pure warmth for winter. Featherlight breathability for the
                seasons between. Each fibre is chosen for how beautifully it
                lives with you.
              </p>
            </div>

            <div className="mt-10 divide-y divide-stone-700 border-y border-stone-700">
              {materials.map((mat, index) => (
                <div
                  key={mat.name}
                  className="material-row group grid gap-2 py-6 sm:grid-cols-[1fr_1.15fr] sm:items-center"
                  style={{ animationDelay: `${300 + index * 120}ms` }}
                >
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-amber-400">
                      {mat.season}
                    </p>
                    <h3
                      className="text-xl font-light text-amber-50 transition-colors group-hover:text-amber-300"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {mat.name}
                    </h3>
                  </div>
                  <p className="text-sm font-light leading-6 text-stone-400">
                    {mat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing statement and CTA */}
      <section className="relative overflow-hidden bg-amber-50 px-6 py-24 text-center md:py-32">
        <div className="absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-amber-700" />
        <div className="relative mx-auto max-w-4xl reveal-copy">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-amber-700">
            Made to be worn · Made to be kept
          </p>
          <h2
            className="text-4xl font-light leading-tight text-stone-800 md:text-6xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Not just something you wear.
            <em className="mt-2 block text-amber-800">Something you keep.</em>
          </h2>
          <p className="mx-auto mt-7 max-w-xl font-light leading-7 text-stone-500">
            Handcrafted in Nepal. Chosen in Portugal. Designed to move through
            seasons—and stay in your story for years.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex min-w-56 items-center justify-center gap-3 bg-stone-800 px-9 py-4 text-xs uppercase tracking-[0.28em] text-amber-50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-800 hover:shadow-xl"
            >
              Shop the Collection
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/founders-story"
              className="inline-flex min-w-56 items-center justify-center border border-stone-400 px-9 py-4 text-xs uppercase tracking-[0.28em] text-stone-700 transition-all duration-300 hover:border-amber-800 hover:bg-white hover:text-amber-800"
            >
              Meet the Founder
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes editorialReveal {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes softDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-18px, 18px, 0) scale(1.06); }
        }
        @keyframes imageBreathe {
          from { transform: scale(1.04); }
          to { transform: scale(1); }
        }
        .reveal-copy,
        .pillar-card,
        .material-row {
          opacity: 0;
          animation: editorialReveal 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .pillar-orb { animation: softDrift 9s ease-in-out infinite; }
        .material-image { animation: imageBreathe 1800ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .reveal-copy,
          .pillar-card,
          .material-row,
          .pillar-orb,
          .material-image {
            opacity: 1;
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
