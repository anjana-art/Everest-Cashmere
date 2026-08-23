// app/api/reviews/eligible/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

interface EligibleProduct {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  orderDate: Date;
  price: number;
}

interface ReviewedItem extends EligibleProduct {
  review: {
    rating: number;
    comment: string | null;
    date: Date;
    status: string;
  };
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json({ 
        eligible: [], 
        reviewed: [],
        total: 0,
        message: 'Please login to view eligible products' 
      });
    }
    
    const user = JSON.parse(userCookie);
    
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'DELIVERED',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const reviewedProducts = await prisma.rating.findMany({
      where: {
        userId: user.id,
      },
      select: {
        productId: true,
        rating: true,
        review: true,
        createdAt: true,
        status: true,
      },
    });
    
    const reviewedProductIds = new Set(reviewedProducts.map(r => r.productId));
    
    const eligibleMap = new Map<string, EligibleProduct>();
    const reviewedItems: ReviewedItem[] = [];
    
    for (const order of orders) {
      for (const item of order.items) {
        if (!reviewedProductIds.has(item.productId)) {
          if (!eligibleMap.has(item.productId)) {
            eligibleMap.set(item.productId, {
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.images?.[0] || '',
              orderId: order.id,
              orderDate: order.createdAt,
              price: Number(item.product.price),
            });
          }
        } else {
          const review = reviewedProducts.find(r => r.productId === item.productId);
          if (review) {
            const existingReviewed = reviewedItems.find(r => r.productId === item.productId);
            if (!existingReviewed) {
              reviewedItems.push({
                productId: item.productId,
                productName: item.product.name,
                productImage: item.product.images?.[0] || '',
                orderId: order.id,
                orderDate: order.createdAt,
                price: Number(item.product.price),
                review: {
                  rating: review.rating,
                  comment: review.review,
                  date: review.createdAt,
                  status: review.status,
                },
              });
            }
          }
        }
      }
    }
    
    return NextResponse.json({
      eligible: Array.from(eligibleMap.values()),
      reviewed: reviewedItems,
      total: eligibleMap.size,
    });
    
  } catch (error) {
    console.error('Error fetching eligible products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligible products' },
      { status: 500 }
    );
  }
}