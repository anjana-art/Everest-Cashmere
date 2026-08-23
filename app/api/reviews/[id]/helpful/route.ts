// app/api/reviews/[id]/helpful/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise in Next.js 15+
) {
  try {
    // ✅ Using your existing auth pattern (no @/lib/auth needed)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie);
    
    // ✅ Await params
    const { id } = await params;
    
    // Check if the review exists
    const existingReview = await prisma.rating.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    
    // Check if user already voted (simple approach)
    // In production, you'd want to track votes per user to prevent abuse
    // For now, we'll just increment
    
    const updated = await prisma.rating.update({
      where: { id },
      data: {
        helpfulVotes: { increment: 1 },
      },
    });
    
    return NextResponse.json({ helpfulVotes: updated.helpfulVotes });
    
  } catch (error) {
    console.error('Error marking helpful:', error);
    return NextResponse.json(
      { error: 'Failed to mark helpful' },
      { status: 500 }
    );
  }
}