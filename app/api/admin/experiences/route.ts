// app/api/admin/experiences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendExperienceApprovedEmail } from '@/lib/review-email';

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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [experiences, total] = await Promise.all([
      prisma.customerExperience.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customerExperience.count({ where }),
    ]);

    return NextResponse.json({
      experiences,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    const existingExperience = await prisma.customerExperience.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!existingExperience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    const experience = await prisma.customerExperience.update({
      where: { id },
      data: { status },
    });

    if (status === 'APPROVED') {
      await sendExperienceApprovedEmail({
        email: existingExperience.user.email,
        name: existingExperience.user.name || 'Customer',
        content: existingExperience.content,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Experience ${status.toLowerCase()} successfully`,
      experience,
    });
  } catch (error) {
    console.error('Error updating experience:', error);
    return NextResponse.json(
      { error: 'Failed to update experience' },
      { status: 500 }
    );
  }
}