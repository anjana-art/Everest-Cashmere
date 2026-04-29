// app/api/wishlist/route.ts - Best practice with variant support

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get user's wishlist OR check if product variant is in wishlist
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const check = searchParams.get('check');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId'); // Optional: check specific variant
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // If checking specific product/variant
    if (check === 'true' && productId) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            where: variantId 
              ? { productId, variantId }  // Check specific variant
              : { productId }              // Check any variant of product
          }
        }
      });

      return NextResponse.json({
        isInWishlist: wishlist ? wishlist.items.length > 0 : false,
        item: wishlist?.items[0] || null
      });
    }

    // Return full wishlist with variant details
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true  // Include variant details
          },
          orderBy: {
            addedAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(wishlist?.items || []);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add product variant to wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { productId, variantId, color, size } = await request.json();
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    console.log('Adding to wishlist:', { userId, productId, variantId, color, size });

    // First, ensure wishlist exists for user
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId }
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If variantId provided, verify it exists and belongs to product
    if (variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: { 
          id: variantId,
          productId: productId
        }
      });

      if (!variant) {
        return NextResponse.json(
          { error: 'Variant not found' },
          { status: 404 }
        );
      }
    }

    // Check if already in wishlist (with same variant)
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId_variantId: {
          wishlistId: wishlist.id,
          productId: product.id,
          variantId: variantId || null  // null for product-level wishlist
        }
      }
    });

    if (existingItem) {
      return NextResponse.json({
        success: true,
        message: 'Product already in wishlist',
        alreadyExists: true
      });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: product.id,
        variantId: variantId || null,
        color: color || null,
        size: size || null,
      },
      include: {
        product: true,
        variant: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist',
      item: wishlistItem
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId'); // Optional: remove specific variant
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    console.log('Removing from wishlist:', { userId, productId, variantId });

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Remove specific variant or any variant of product
    if (variantId) {
      await prisma.wishlistItem.delete({
        where: {
          wishlistId_productId_variantId: {
            wishlistId: wishlist.id,
            productId: productId,
            variantId: variantId
          }
        }
      });
    } else {
      // Remove all variants of this product from wishlist
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId: productId
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}