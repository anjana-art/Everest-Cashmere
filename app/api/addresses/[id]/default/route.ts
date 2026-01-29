// app/api/addresses/[id]/default/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Set address as default
export async function PUT(
  req: NextRequest,
  { params }: Promise<{ params: { id: string } }> // Type as Promise
) {
  try {
    // Await params here too!
    const { id: addressId } = await params;
    const userId = req.headers.get('x-user-id');
    const { type } = await req.json();

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

    // Unset all other defaults of the same type
    await prisma.address.updateMany({
      where: { 
        userId,
        type: type || existingAddress.type,
        id: { not: addressId }
      },
      data: { isDefault: false }
    });

    // Set this address as default
    const address = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
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