// app/api/reviews/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // ✅ Using YOUR EXISTING auth pattern from verify-order
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to check review eligibility' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie);
    
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if user has purchased this product (delivered order)
    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'DELIVERED',
        items: {
          some: {
            productId: productId,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!order) {
      return NextResponse.json({
        canReview: false,
        message: 'You need to purchase and receive this product to review it',
      });
    }

    // Check if already reviewed
    const existingReview = await prisma.rating.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      },
      select: {
        rating: true,
        review: true,
        createdAt: true,
        status: true,
      },
    });

    if (existingReview) {
      return NextResponse.json({
        canReview: false,
        alreadyReviewed: true,
        message: 'You have already reviewed this product',
        review: {
          rating: existingReview.rating,
          review: existingReview.review,
          createdAt: existingReview.createdAt,
          status: existingReview.status,
        },
      });
    }

    return NextResponse.json({
      canReview: true,
      orderId: order.id,
      orderDate: order.createdAt,
      message: 'You can review this product',
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}
