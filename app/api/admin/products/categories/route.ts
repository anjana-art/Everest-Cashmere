// app/api/products/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get distinct categories from products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { 
        category: true,
        clothingType: true,
        accessoriesType: true 
      },
    });

    // Extract unique categories
    const categories = Array.from(
      new Set(products.filter(p => p.category).map(p => p.category))
    );

    // Count products in each category
    const categoryCounts = {
      CLOTHING: products.filter(p => p.category === 'CLOTHING').length,
      HOME_DECORE: products.filter(p => p.category === 'HOME_DECORE').length,
      ACCESSORIES: products.filter(p => p.category === 'ACCESSORIES').length,
    };

    return NextResponse.json({
      success: true,
      categories,
      counts: categoryCounts,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}