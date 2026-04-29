// app/api/admin/products/[id]/variants/check-stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params promise
    const { color, size, quantity } = await request.json();
    
    const variant = await prisma.productVariant.findUnique({
      where: {
        productId_color_size: {
          productId: id,
          color: color,
          size: size,
        }
      }
    });
    
    if (!variant) {
      return NextResponse.json(
        { available: false, message: 'Variant not found' },
        { status: 404 }
      );
    }
    
    const available = variant.stock >= quantity;
    
    return NextResponse.json({
      available,
      stock: variant.stock,
      sku: variant.sku,
    });
  } catch (error) {
    console.error('Error checking stock:', error);
    return NextResponse.json(
      { error: 'Failed to check stock' },
      { status: 500 }
    );
  }
}