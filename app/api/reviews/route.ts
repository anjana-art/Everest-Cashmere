// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { sendAdminReviewNotification } from '@/lib/review-email';

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(10).max(5000),
  images: z.array(z.string().url()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // ✅ Using YOUR EXISTING auth pattern
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie);
    
    const body = await req.json();
    const validated = reviewSchema.parse(body);
    
    // Verify user actually purchased this product (delivered order)
    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'DELIVERED',
        items: {
          some: {
            productId: validated.productId,
          },
        },
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'You must purchase and receive this product to review it' },
        { status: 403 }
      );
    }
    
    // Check for duplicate review
    const existingReview = await prisma.rating.findFirst({
      where: {
        userId: user.id,
        productId: validated.productId,
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 409 }
      );
    }
    
    // Get product name for email
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      select: { name: true },
    });
    
    // Create review
    const review = await prisma.rating.create({
      data: {
        productId: validated.productId,
        userId: user.id,
        rating: validated.rating,
        review: validated.review,
        images: validated.images || [],
        verifiedPurchase: true,
        status: 'PENDING',
      },
    });
    
    // Send admin notification
    await sendAdminReviewNotification({
      reviewId: review.id,
      productName: product?.name || 'Product',
      userName: user.name || 'Customer',
      userEmail: user.email,
      rating: validated.rating,
      review: validated.review,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review will be published after moderation.',
      review,
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

