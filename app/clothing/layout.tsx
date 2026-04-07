// app/clothing/layout.tsx
import ClothingNav from "@/components/navigation/ClothingNav";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for real-time e-commerce data
export const dynamic = 'force-dynamic';

export default async function ClothingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch counts for the navigation badges
  const [materialCounts, genderCounts] = await Promise.all([
    prisma.product.groupBy({
      by: ['clothingType'],
      where: { category: 'CLOTHING', isActive: true },
      _count: true
    }),
    prisma.product.groupBy({
      by: ['gender'],
      where: { category: 'CLOTHING', isActive: true },
      _count: true
    })
  ]);
  
  const counts = {
    CASHMERE: materialCounts.find(m => m.clothingType === 'CASHMERE')?._count || 0,
    CASHMERE_MARINO_WOOL: materialCounts.find(m => m.clothingType === 'CASHMERE_MARINO_WOOL')?._count || 0,
    MARINO_WOOL: materialCounts.find(m => m.clothingType === 'MARINO_WOOL')?._count || 0,
    MEN: genderCounts.find(g => g.gender === 'MEN')?._count || 0,
    WOMEN: genderCounts.find(g => g.gender === 'WOMEN')?._count || 0,
    UNISEX: genderCounts.find(g => g.gender === 'UNISEX')?._count || 0,
  };

  return (
    <>
      <ClothingNav 
        materialCounts={{
          CASHMERE: counts.CASHMERE,
          CASHMERE_MARINO_WOOL: counts.CASHMERE_MARINO_WOOL,
          MARINO_WOOL: counts.MARINO_WOOL
        }}
        genderCounts={{
          MEN: counts.MEN,
          WOMEN: counts.WOMEN,
          UNISEX: counts.UNISEX
        }}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  );
}