// app/clothing/[...slug]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Import different components for different materials
import CashmerePage from '@/components/cashmerePage';
 import MarinoWoolPage from '@/components/marinoWoolPage';
import CashmereMarinoPage from '@/components/cashmereMarinoPage';
import DefaultMaterialPage from '@/components/defaultMaterialPage'; 

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
  
  // Determine what we're viewing
  let currentGender: string | null = null;
  let currentMaterial: string | null = null;
  
  // Parse the route
  if (first === 'women' || first === 'men' || first === 'unisex') {
    currentGender = first;
    if (second) {
      currentMaterial = second;
    }
  } else if (first) {
    currentMaterial = first;
    if (genderParam) {
      currentGender = genderParam;
    }
  }
  
  // If no material is selected, show default clothing page
  if (!currentMaterial) {
    return <DefaultClothingPage currentGender={currentGender} />;
  }
  
  // Fetch products for this material
  const where: any = {
    category: 'CLOTHING',
    clothingType: currentMaterial.toUpperCase().replace(/-/g, '_'),
    isActive: true
  };
  
  if (currentGender) {
    where.gender = currentGender.toUpperCase();
  }
  
  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });
  
  // 🎯 RENDER DIFFERENT PAGE COMPONENTS BASED ON MATERIAL
  switch (currentMaterial) {
    case 'cashmere':
      return (
        <CashmerePage 
          products={products} 
          currentGender={currentGender}
          material={currentMaterial}
        />
      );
      
    case 'marino-wool':
      return (
        <MarinoWoolPage 
          products={products} 
          currentGender={currentGender}
          material={currentMaterial}
        />
      );
      
    case 'cashmere-marino-wool':
      return (
        <CashmereMarinoPage 
          products={products} 
          currentGender={currentGender}
          material={currentMaterial}
        />
      );
      
    default:
      return (
        <DefaultMaterialPage 
          products={products} 
          currentGender={currentGender}
          material={currentMaterial}
        />
      );
  }
}

// Default clothing page (when no material selected)
function DefaultClothingPage({ currentGender }: { currentGender: string | null }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-light mb-4">
        {currentGender ? `${currentGender}'s ` : ''}Clothing Collection
      </h1>
      <p className="text-gray-600">Select a material to explore our collections.</p>
      
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <MaterialCard 
          href={`/clothing/cashmere${currentGender ? `?gender=${currentGender}` : ''}`}
          title="Cashmere"
          description="Ultra-soft, luxurious, and warm"
          image="/cashmere-preview.jpg"
        />
        <MaterialCard 
          href={`/clothing/cashmere-marino-wool${currentGender ? `?gender=${currentGender}` : ''}`}
          title="Cashmere + Marino Wool"
          description="The perfect blend of softness and durability"
          image="/cashmere-marino-preview.jpg"
        />
        <MaterialCard 
          href={`/clothing/marino-wool${currentGender ? `?gender=${currentGender}` : ''}`}
          title="Marino Wool"
          description="Sustainable, breathable, and eco-friendly"
          image="/marino-preview.jpg"
        />
      </div>
    </div>
  );
}

function MaterialCard({ href, title, description, image }: any) {
  return (
    <Link href={href} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 mb-4">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}