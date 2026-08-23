// app/api/experiences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';  // ✅ Use cookies directly
import { z } from 'zod';
import { sendAdminExperienceNotification } from '@/lib/review-email';

const experienceSchema = z.object({
  content: z.string().min(20).max(2000),
  orderId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // ✅ Using your existing cookie-based auth (no @/lib/auth needed)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to share your experience' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie);
    
    const body = await req.json();
    const validated = experienceSchema.parse(body);
    
    // Create experience
    const experience = await prisma.customerExperience.create({
      data: {
        userId: user.id,
        content: validated.content,
        orderId: validated.orderId,
        status: 'PENDING',
      },
    });
    
    // Send admin notification (won't break if it fails)
    await sendAdminExperienceNotification({
      experienceId: experience.id,
      userName: user.name || 'Customer',
      userEmail: user.email,
      content: validated.content,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Thank you for sharing your experience! It will be published after moderation.',
      experience,
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error submitting experience:', error);
    return NextResponse.json(
      { error: 'Failed to submit experience' },
      { status: 500 }
    );
  }
}

// GET - Get approved experiences (public)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const experiences = await prisma.customerExperience.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    return NextResponse.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experiences' },
      { status: 500 }
    );
  }
}