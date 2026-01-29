// app/api/user-profile/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: Promise<{ params: { userId: string } }>
) {
  try {
    // IMPORTANT: Await the params!
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        userProfile: true, // Add this to get userProfile data
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in GET /api/user-profile/[userId]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT METHOD - Separate function, not inside GET
export async function PUT(
  request: NextRequest,
  { params }: Promise<{ params: { userId: string } }>
) {
  try {
    const { userId } = await params;
    const requestUserId = request.headers.get('x-user-id');
    const body = await request.json();
    
    // Verify user is updating their own profile
    if (requestUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // First, get the existing userProfile
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    let userProfile;
    
    if (existingProfile) {
      // Update existing profile
      userProfile = await prisma.userProfile.update({
        where: { userId },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          displayName: body.displayName,
          phoneNumber: body.phoneNumber,
          country: body.country,
          countryCode: body.countryCode,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2,
          city: body.city,
          state: body.state,
          postalCode: body.postalCode,
          company: body.company,
          website: body.website,
        }
      });
    } else {
      // Create new profile
      userProfile = await prisma.userProfile.create({
        data: {
          userId,
          firstName: body.firstName,
          lastName: body.lastName,
          displayName: body.displayName,
          phoneNumber: body.phoneNumber,
          country: body.country,
          countryCode: body.countryCode,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2,
          city: body.city,
          state: body.state,
          postalCode: body.postalCode,
          company: body.company,
          website: body.website,
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      userProfile,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('Error in PUT /api/user-profile/[userId]:', error);
    
    // Check if it's a Prisma validation error
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}