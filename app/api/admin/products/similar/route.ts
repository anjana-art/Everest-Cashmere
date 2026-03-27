// app/api/products/similar/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const excludeId = searchParams.get('exclude');
    const limit = parseInt(searchParams.get('limit') || '8');

    console.log('Fetching similar products:', { category, excludeId, limit });

    if (!category) {
      return NextResponse.json(
        { products: [], error: 'Category is required' },
        { status: 400 }
      );
    }

    // Build the where clause
    const whereClause: any = {
      category: category,
      isActive: true, // ✅ Only fetch active products
    };

    // Exclude current product if specified
    if (excludeId) {
      whereClause.NOT = {
        id: excludeId
      };
    }

    // Fetch similar products from the same category
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        stripeId: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        clothingType: true,      
        accessoriesType: true,   
        metadata: true,
        availableColors: true,
        availableSizes: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc', // Show newest first
      },
    });

    console.log(`Found ${products.length} similar products`);

    return NextResponse.json({ 
      products,
      count: products.length 
    });
    
  } catch (error) {
    console.error('Error fetching similar products:', error);
    return NextResponse.json(
      { products: [], error: 'Failed to fetch similar products' },
      { status: 500 }
    );
  }
}