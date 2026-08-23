// app/api/admin/experiences/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

    const existingExperience = await prisma.customerExperience.findUnique({
      where: { id: id },
    });

    if (!existingExperience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    await prisma.customerExperience.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Experience deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { error: 'Failed to delete experience' },
      { status: 500 }
    );
  }
}