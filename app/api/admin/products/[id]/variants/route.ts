// app/api/admin/products/[id]/variants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params promise
    
    const variants = await prisma.productVariant.findMany({
      where: {
        productId: id,
        isActive: true,
      },
      select: {
        id: true,
        color: true,
        size: true,
        stock: true,
        sku: true,
        isActive: true,
      },
      orderBy: [
        { color: 'asc' },
        { size: 'asc' }
      ]
    });

    return NextResponse.json({ 
      success: true,
      variants,
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    );
  }
}