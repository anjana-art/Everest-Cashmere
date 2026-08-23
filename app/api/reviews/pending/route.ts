// app/api/reviews/pending/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userCookie);

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.rating.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rating.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  }
}