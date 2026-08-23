// app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sendReviewApprovedEmail } from '@/lib/review-email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ Note: params is a Promise
) {
  try {
    // ✅ Await params to get the id
    const { id } = await params;
    
    // ✅ Auth check
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
    const { status } = body;

    if (!['APPROVED', 'REJECTED', 'REPORTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED, REJECTED, or REPORTED' },
        { status: 400 }
      );
    }

    // ✅ Use the id from params
    const existingReview = await prisma.rating.findUnique({
      where: { id: id },  // ✅ Now id is defined
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const review = await prisma.rating.update({
      where: { id: id },
      data: { status },
    });

    if (status === 'APPROVED') {
      await sendReviewApprovedEmail({
        email: existingReview.user.email,
        name: existingReview.user.name || 'Customer',
        productName: existingReview.product.name,
        review: existingReview.review || '',
        rating: existingReview.rating,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Review ${status.toLowerCase()} successfully`,
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise
) {
  try {
    // ✅ Await params to get the id
    const { id } = await params;
    
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = JSON.parse(userCookie);
    
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ✅ Use the id from params
    const existingReview = await prisma.rating.findUnique({
      where: { id: id },
    });

    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    await prisma.rating.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}