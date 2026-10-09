// app/clothing/[...slug]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card'; // ✅ NEW

// Import different components for different materials
import CashmerePage from '@/components/cashmerePage';
import MarinoWoolPage from '@/components/marinoWoolPage';
import CashmereMarinoPage from '@/components/cashmereMarinoPage';
import DefaultMaterialPage from '@/components/defaultMaterialPage';
import MaterialCards from '@/components/MaterialCards';

interface Props {
  params: Promise<{ slug: string[] }> | { slug: string[] };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function ClothingCatchAllPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { slug } = resolvedParams;
  const [first, second] = slug || [];
  const genderParam = resolvedSearchParams.gender as string;

  let currentGender: string | null = null;
  let currentMaterial: string | null = null;

  if (first === 'women' || first === 'men' || first === 'unisex') {
    currentGender = first;
    if (second) currentMaterial = second;
  } else if (first) {
    currentMaterial = first;
    if (genderParam) currentGender = genderParam;
  }

  // ✅ No material → show ALL gender products + material cards
  if (!currentMaterial) {
    return <DefaultClothingPage currentGender={currentGender} />;
  }

  // Fetch products for this material
  const where: any = {
    category: 'CLOTHING',
    clothingType: currentMaterial.toUpperCase().replace(/-/g, '_'),
    isActive: true,
  };

  if (currentGender) {
    where.gender = currentGender.toUpperCase();
  }

  const productsFromDb = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const products = productsFromDb.map(product => ({
    ...product,
    price: Number(product.price),
  }));

  switch (currentMaterial) {
    case 'cashmere':
      return <CashmerePage products={products} currentGender={currentGender} material={currentMaterial} />;
    case 'merino-wool':
      return <MarinoWoolPage products={products} currentGender={currentGender} material={currentMaterial} />;
    case 'cashmere-merino-wool':
      return <CashmereMarinoPage products={products} currentGender={currentGender} material={currentMaterial} />;
    default:
      return <DefaultMaterialPage products={products} currentGender={currentGender} material={currentMaterial} />;
  }
}

// ✅ UPDATED: now async and fetches ALL gender products
async function DefaultClothingPage({ currentGender }: { currentGender: string | null }) {
  const where: any = {
    category: 'CLOTHING',
    isActive: true,
  };

  if (currentGender) {
    where.gender = currentGender.toUpperCase();
  }

  const productsFromDb = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const products = productsFromDb.map(product => ({
    ...product,
    price: Number(product.price),
  }));

  return (
    <div className="container mx-auto px-2 py-2">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight">
          {currentGender ? `${currentGender}'s ` : ''}
        </h1>
        <p className="mt-3 text-neutral-500">
          100 % Pure Cashmere. Merino &amp; 50/50 blend
        </p>
      </div>

      {/* ✅ ADDED: All products first */}
      <AllProductsGrid products={products} currentGender={currentGender} />

      {/* ✅ UNCHANGED: Material cards still navigable */}
      <div className="mt-16">
        <h2 className="text-2xl font-light mb-6">Shop by Material</h2>
        <MaterialCards currentGender={currentGender} />
      </div>
    </div>
  );
}

// ✅ NEW: all-products grid
function AllProductsGrid({ products, currentGender }: any) {
  if (!products || products.length === 0) {
    return <p className="text-neutral-500 mb-10">No products available yet.</p>;
  }

  return (
    <>
      <h2 className="text-2xl font-light mb-6">
        All {currentGender ? `${currentGender}'s ` : ''}Clothing
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any, index: number) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </>
  );
}

function MaterialCard({ href, title, description, image }: any) {
  return (
    <Link href={href} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}