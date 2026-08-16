import type { Metadata } from "next";
import Link from "next/link";

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
      "Our cashmere originates from the high plateaus of Mongolia — home to some of the world's finest fibres. Each strand begins with the soft undercoat of Hircus goats, selected for exceptional fineness before continuing its journey to Nepal, where skilled craftsmanship transforms fibre into something made to be lived in.",
  },
  {
    icon: "✦",
    title: "Nepalese Mastery",
    description:
      "In Nepal, skilled makers transform natural fibres through techniques shaped by generations of textile craftsmanship. From spinning and knitting to finishing by hand, each process is approached with care, patience, and close attention to detail. Every piece carries the presence of the people who made it.",
  },
  {
    icon: "✦",
    title: "Radical Transparency",
    description:
      "We believe you should understand what you are wearing. We share the composition, origin, craftsmanship, care, and purpose behind our pieces as clearly as possible. As Himkash grows, so will the record of the hands, materials, and processes behind each collection.",
  },
  {
    icon: "✦",
    title: "Slow Fashion",
    description:
      "We design beyond seasons and beyond trends. Our pieces are made to return to your wardrobe year after year, with care guidance that helps preserve their softness, shape, and character. Buy less. Wear more. Keep longer.",
  },
  {
    icon: "✦",
    title: "Comfort Through the Seasons",
    description:
      "Luxury should not belong to one season. From pure cashmere for colder days to featherlight cashmere–merino knits made for layering, we choose fibres and constructions for how they feel throughout the year. Some pieces warm you in winter; others are light enough for a cool Portuguese summer evening.",
  },
  {
    icon: "✦",
    title: "Artisan Economy",
    description:
      "Behind every piece is a person. We work with Nepalese makers and artisan communities, supporting skilled work while helping preserve generations of textile craftsmanship. When you choose Himkash, you help keep that craft in motion.",
  },
];

const materials = [
  {
    season: "Autumn — Winter",
    name: "Pure Cashmere",
    description:
      "The purest expression of Himkash. Exceptionally soft, naturally insulating, and remarkably light for the warmth it provides. Our pure cashmere pieces are created for colder days, quiet layering, and the kind of comfort that becomes more personal with every wear.",
  },
  {
    season: "All Year — Layering",
    name: "Cashmere & Merino 50/50",
    description:
      "A considered balance of softness, breathability, and resilience. By combining cashmere with fine merino wool, we create pieces that feel luxurious without unnecessary weight. In our lighter openwork knits, the result is almost featherlike — ideal over a shirt or dress, for a cool Portuguese summer evening, between seasons, or layered beneath a coat in winter.",
  },
  {
    season: "Transitional Seasons",
    name: "Fine Merino Wool",
    description:
      "Naturally breathable, soft, and resilient, fine merino wool brings structure and versatility to knitwear. It helps maintain comfort as temperatures change, making it especially suited to layering and to pieces designed to move easily between seasons.",
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
            Himkash was born from a conviction: that the finest things in life
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
            Six pillars of Himkash
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
              Natural fibres, made for changing seasons
            </h2>

            <p
              className="mt-6 max-w-2xl mx-auto text-stone-500 font-light leading-relaxed"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Different fibres serve different moments. Some surround you with
              warmth, while others are chosen for breathability, lightness, and
              effortless layering. Our aim is not to dress one season, but to
              create pieces that remain useful as the year changes around you.
            </p>
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

      {/* Year-Round Dressing */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p
              className="text-xs uppercase tracking-[0.4em] text-amber-700 mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Made To Live With You
            </p>

            <h2
              className="text-4xl font-light text-stone-800 leading-tight mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              From winter warmth
              <br />
              <em className="italic">to summer evenings.</em>
            </h2>
          </div>

          <div
            className="space-y-6 text-stone-500 leading-relaxed font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            <p>
              In Portugal, even warm days can give way to a cool evening breeze.
              This is where our lighter cashmere–merino pieces come into their
              own — soft enough to feel special, breathable enough to layer
              lightly, and refined enough to remain part of the outfit rather
              than simply something thrown over it.
            </p>

            <p>
              An openwork cardigan can sit over a dress on a summer evening,
              return with a blouse in autumn, and become an additional layer
              beneath a coat in winter. We believe luxury becomes more
              meaningful when a piece earns its place in your wardrobe
              throughout the year.
            </p>
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
            Our Care Promise
          </p>

          <h2
            className="text-3xl md:text-4xl font-light mb-8"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Made to be worn. Made to be kept.
          </h2>

          <p
            className="text-amber-100 text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ fontFamily: "Georgia, serif" }}
          >
            A beautiful natural-fibre piece should live with you for years, not
            seasons. Every Himkash piece comes with guidance for washing,
            storing, layering, and wearing it well. From pure cashmere through
            winter to featherlight cashmere–merino on a cool summer evening, we
            want you to understand not only what you own, but how to enjoy it
            fully.
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
          Ready to experience Himkash?
        </h2>

        <p
          className="text-stone-500 font-light mb-10 max-w-xl mx-auto leading-relaxed"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Discover pure cashmere and cashmere–merino pieces handcrafted in
          Nepal — from winter warmth to featherlight layers made for the
          changing rhythm of European seasons.
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