import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get user's wishlist OR check if product is in wishlist
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const check = searchParams.get('check');
    const productId = searchParams.get('productId'); // This is DATABASE ID
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // If checking specific product - FIXED: Use database ID
    if (check === 'true' && productId) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            where: {
              productId: productId // Use database ID directly
            }
          }
        }
      });

      return NextResponse.json({
        isInWishlist: wishlist ? wishlist.items.length > 0 : false
      });
    }

    // Return full wishlist
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
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

// POST - Add product to wishlist - FIXED: Accept database ID directly
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { productId } = await request.json(); // This is DATABASE ID
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    console.log('Adding to wishlist:', { userId, productId });

    // First, ensure wishlist exists for user
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId }
      });
    }

    // Check if product exists in your database - FIXED: Use database ID
    const product = await prisma.product.findUnique({
      where: { id: productId } // Changed from stripeId to id
    });

    if (!product) {
      console.log('Product not found with ID:', productId);
      return NextResponse.json(
        { error: 'Product not found in database' },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id
        }
      }
    });

    if (existingItem) {
      return NextResponse.json({
        success: true,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: product.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove product from wishlist - FIXED: Accept database ID directly
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId'); // This should be DATABASE ID
    
    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    console.log('Removing from wishlist:', { userId, productId });

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId }
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    // Find product in database - FIXED: Use database ID
    const product = await prisma.product.findUnique({
      where: { id: productId } // Changed from stripeId to id
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id
        }
      }
    });

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