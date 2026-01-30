// app/api/addresses/[id]/default/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Set address as default
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const { id: addressId } = await context.params;
    
    // Get userId from headers
    const userId = request.headers.get('x-user-id');
    
    // Parse the request body
    const { type } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if address exists and belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { 
        id: addressId,
        userId
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // Determine which type to update (use provided type or existing address type)
    const addressType = type || existingAddress.type;

    // Unset all other defaults of the same type for this user
    await prisma.address.updateMany({
      where: { 
        userId,
        type: addressType,
        id: { not: addressId }
      },
      data: { isDefault: false }
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id: addressId },
      data: { 
        isDefault: true,
        // Also ensure type matches if it was provided
        ...(type && { type })
      },
    });

    return NextResponse.json({
      success: true,
      address,
      message: "Address set as default successfully"
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    return NextResponse.json(
      { error: "Failed to set default address" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check if address is default
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressId } = await context.params;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const address = await prisma.address.findUnique({
      where: { 
        id: addressId,
        userId
      },
      select: {
        id: true,
        isDefault: true,
        type: true
      }
    });

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isDefault: address.isDefault,
      type: address.type
    });
  } catch (error) {
    console.error("Error checking default address:", error);
    return NextResponse.json(
      { error: "Failed to check address" },
      { status: 500 }
    );
  }
}