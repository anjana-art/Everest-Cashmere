// app/api/reviews/product/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'newest';
    
    const skip = (page - 1) * limit;
    
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpfulVotes: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    const [reviews, total, avgRating] = await Promise.all([
      prisma.rating.findMany({
        where: {
          productId: productId,
          status: 'APPROVED',
        },
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.rating.count({
        where: { productId, status: 'APPROVED' },
      }),
      prisma.rating.aggregate({
        where: { productId, status: 'APPROVED' },
        _avg: { rating: true },
      }),
    ]);
    
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      userName: review.user?.name || 'Anonymous',
      rating: review.rating,
      review: review.review,
      images: review.images || [],
      verifiedPurchase: review.verifiedPurchase,
      helpfulVotes: review.helpfulVotes,
      createdAt: review.createdAt,
    }));
    
    return NextResponse.json({
      reviews: formattedReviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      averageRating: avgRating._avg.rating || 0,
      totalReviews: total,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}