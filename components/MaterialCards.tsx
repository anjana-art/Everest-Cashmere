// components/MaterialCards.tsx
import Link from "next/link";
import Image from "next/image";

interface MaterialCardItem {
  href: string;
  title: string;
  description: string;
  image: string;
}

interface MaterialCardsProps {
  currentGender?: string | null;
  items?: MaterialCardItem[];
}

const DEFAULT_ITEMS: Omit<MaterialCardItem, "href">[] = [
  {
    title: "Cashmere",
    description: "Ultra-soft, luxurious, and warm",
    image: "/cashmere sweater gray folded.webp",
  },
  {
    title: "Cashmere  & Merino 50/50 ",
    description: "The perfect blend of softness and durability",
    image: "/toupe_brunello_zoom.webp",
  },
  {
    title: "Merino Wool",
    description: "Sustainable, breathable, and eco-friendly",
    image: "/5_cashmere_bg_sweater.webp",
  },
];

const SLUGS = ["cashmere", "cashmere-merino-wool", "merino-wool"];

export default function MaterialCards({
  currentGender,
  items,
}: MaterialCardsProps) {
  const genderQuery = currentGender ? `?gender=${currentGender}` : "";

  const cards: MaterialCardItem[] =
    items ??
    DEFAULT_ITEMS.map((item, i) => ({
      ...item,
      href: `/clothing/${SLUGS[i]}${genderQuery}`,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-10">
      {cards.map((card) => (
        <MaterialCard key={card.href} {...card} />
      ))}
    </div>
  );
}

function MaterialCard({ href, title, description, image }: MaterialCardItem) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl bg-neutral-100
                 aspect-[3/4] w-full
                 shadow-sm hover:shadow-2xl
                 transition-shadow duration-500 ease-out
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-[1200ms] ease-out
                   group-hover:scale-110"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent
                   transition-opacity duration-500
                   group-hover:from-black/80 group-hover:via-black/40"
      />

      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <span
          className="inline-block self-start mb-3 rounded-full
                     border border-white/40 bg-white/10 backdrop-blur-sm
                     px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-medium
                     transition-transform duration-500
                     group-hover:-translate-y-1"
        >
          Collection
        </span>

        <h3
          className="text-2xl md:text-3xl font-light leading-tight tracking-tight
                     transition-transform duration-500
                     group-hover:-translate-y-1"
        >
          {title}
        </h3>

        <p
          className="mt-2 text-sm text-white/80
                     transition-all duration-500
                     group-hover:text-white group-hover:-translate-y-1"
        >
          {description}
        </p>

        <div
          className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium
                     opacity-100 translate-y-0
                     md:opacity-0 md:translate-y-2
                     transition-all duration-500
                     md:group-hover:opacity-100 md:group-hover:translate-y-0"
        >
          <span>Explore</span>
          <span
            aria-hidden
            className="transition-transform duration-500
                       group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>

      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-white
                   transition-all duration-500 ease-out
                   group-hover:w-full"
      />
    </Link>
  );
}