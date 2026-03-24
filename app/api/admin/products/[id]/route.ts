import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const adminToken = request.headers.get('x-admin-token');
    if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
      return true;
    }

    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return false;

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) cookies[name] = decodeURIComponent(value);
    });

    if (cookies['admin-check'] === 'true') return true;
    
    const userCookie = cookies['user'];
    if (!userCookie) return false;

    let user;
    try {
      user = JSON.parse(userCookie);
    } catch {
      return false;
    }
    
    if (!user?.id) return false;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true }
    });

    return dbUser?.isAdmin || false;
    
  } catch (error) {
    console.error('Error in admin check:', error);
    return false;
  }
}

// Helper to extract params from URL
function extractProductIdFromUrl(url: string): string | null {
  const match = url.match(/\/api\/admin\/products\/([^\/?]+)/);
  return match ? match[1] : null;
}

// GET - Get single product
export async function GET(
  request: NextRequest
) {
  try {
    // Extract productId from URL
    const productId = extractProductIdFromUrl(request.url);
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('📦 GET /api/admin/products/[id] called for ID:', productId);
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        clothingType: true,
        gender: true,
        accessoriesType: true,
        availableColors: true,
        availableSizes: true,
        defaultColor: true,
        defaultSize: true,
        stock: true,
        isActive: true,
        stripeId: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('✅ Product found:', product.name);
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH - Update single product
export async function PATCH(
  request: NextRequest
) {
  try {
    // Extract productId from URL
    const productId = extractProductIdFromUrl(request.url);
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('✏️ PATCH /api/admin/products/[id] called for ID:', productId);
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (updateData.category !== undefined) {
      const validCategories = ['CLOTHING', 'HOME_DECORE', 'ACCESSORIES'];
      if (updateData.category && !validCategories.includes(updateData.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }

      // Validate clothing type if category is CLOTHING
      if (updateData.category === 'CLOTHING' && updateData.clothingType) {
        const validClothingTypes = ['CASHMERE', 'CASHMERE_MARINO_WOOL', 'MARINO_WOOL'];
        if (!validClothingTypes.includes(updateData.clothingType)) {
          return NextResponse.json(
            { error: `Invalid clothing type. Must be one of: ${validClothingTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }

      // Validate gender if category is CLOTHING
      if (updateData.category === 'CLOTHING' && updateData.gender) {
        const validGenders = ['MEN', 'WOMEN', 'UNISEX'];
        if (!validGenders.includes(updateData.gender)) {
          return NextResponse.json(
            { error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` },
            { status: 400 }
          );
        }
      }

      // Validate accessories type if category is ACCESSORIES
      if (updateData.category === 'ACCESSORIES' && updateData.accessoriesType) {
        const validAccessoriesTypes = ['MEN', 'WOMEN', 'UNISEX'];
        if (!validAccessoriesTypes.includes(updateData.accessoriesType)) {
          return NextResponse.json(
            { error: `Invalid accessories type. Must be one of: ${validAccessoriesTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }

      // Clear type fields if category doesn't match
      if (updateData.category !== 'CLOTHING') {
        updateData.clothingType = null;
        updateData.gender = null;
      }
      if (updateData.category !== 'ACCESSORIES') {
        updateData.accessoriesType = null;
      }
    }

    // Validate colors if provided
    if (updateData.availableColors !== undefined) {
      const validColors = ['baby-pink', 'amber-200', 'black-300', 'gray', 'sky-blue', 'cream', 'black', 'green', 'yellow-200', 'red-900','beige', 'charcoal'];
      const availableColors = Array.isArray(updateData.availableColors) 
        ? updateData.availableColors 
        : (updateData.availableColors ? [updateData.availableColors] : []);
      
      const invalidColors = availableColors.filter((color: string) => !validColors.includes(color));
      if (invalidColors.length > 0) {
        return NextResponse.json(
          { error: `Invalid colors: ${invalidColors.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.availableColors = availableColors;
    }

    // Validate sizes if provided
    if (updateData.availableSizes !== undefined) {
      const validSizes = ['XS','S', 'M', 'L','XL'];
      const availableSizes = Array.isArray(updateData.availableSizes)
        ? updateData.availableSizes
        : (updateData.availableSizes ? [updateData.availableSizes] : []);
      
      const invalidSizes = availableSizes.filter((size: string) => !validSizes.includes(size));
      if (invalidSizes.length > 0) {
        return NextResponse.json(
          { error: `Invalid sizes: ${invalidSizes.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.availableSizes = availableSizes;
    }

    // Prepare update data
    const dataToUpdate: any = {
      ...updateData,
      // Handle numeric conversions
      ...(updateData.price && { price: parseFloat(updateData.price) }),
      ...(updateData.stock !== undefined && { stock: parseInt(updateData.stock) }),
    };

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
    });

    console.log('✅ Product updated:', {
      id: product.id,
      name: product.name,
      category: product.category,
      clothingType: product.clothingType,
      gender: product.gender,
      accessoriesType: product.accessoriesType
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
    
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with similar details already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete single product (deactivates instead of removing)
export async function DELETE(
  request: NextRequest
) {
  try {
    const productId = extractProductIdFromUrl(request.url);
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ DELETE /api/admin/products/[id] called for ID:', productId);
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already deactivated
    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is already deactivated' },
        { status: 400 }
      );
    }

    // Soft delete — deactivate instead of removing
    const deactivatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    console.log('✅ Product deactivated:', productId);

    return NextResponse.json({
      success: true,
      message: 'Product deactivated successfully',
      product: {
        id: deactivatedProduct.id,
        name: deactivatedProduct.name,
        isActive: deactivatedProduct.isActive,
      }
    });

  } catch (error) {
    console.error('Error deactivating product:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
}