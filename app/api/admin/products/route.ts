// app/api/admin/products/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    console.log('🔐 === STARTING ADMIN CHECK ===');
    
    // Option 1: Check admin token from headers (for testing/API access)
    const adminToken = request.headers.get('x-admin-token');
    console.log('🔑 Admin token from headers:', adminToken ? 'Present' : 'Missing');
    
    if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
      console.log('✅ Admin access granted via token');
      return true;
    }

    // Option 2: Check cookies from request headers directly
    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Raw cookie header:', cookieHeader);
    
    if (!cookieHeader) {
      console.log('❌ No cookies found in request');
      return false;
    }

    // Parse cookies manually
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    console.log('📋 Parsed cookies:', Object.keys(cookies));
    
    // Check admin-check cookie first (simpler)
    if (cookies['admin-check'] === 'true') {
      console.log('✅ Admin access via admin-check cookie');
      return true;
    }
    
    // Check user cookie
    const userCookie = cookies['user'];
    console.log('👤 User cookie found:', !!userCookie);
    
    if (!userCookie) {
      console.log('❌ No user cookie found');
      return false;
    }

    console.log('📄 User cookie value:', userCookie.substring(0, 100) + '...');
    
    let user;
    try {
      user = JSON.parse(userCookie);
      console.log('✅ Parsed user:', {
        id: user?.id,
        email: user?.email,
        isAdmin: user?.isAdmin
      });
    } catch (parseError) {
      console.error('❌ Failed to parse user cookie:', parseError);
      return false;
    }
    
    if (!user?.id) {
      console.log('❌ User cookie missing id');
      return false;
    }

    console.log('🔍 Looking up user in database with ID:', user.id);
    
    // Get user from database to check admin status
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true, email: true }
    });

    console.log('📊 Database user found:', dbUser);
    
    if (!dbUser) {
      console.log('❌ User not found in database');
      return false;
    }

    const isAdminUser = dbUser.isAdmin || false;
    console.log(`🎯 Final: User ${dbUser.email} is admin: ${isAdminUser}`);
    console.log('=== ADMIN CHECK COMPLETE ===');
    return isAdminUser;
    
  } catch (error) {
    console.error('💥 ERROR in admin check:', error);
    return false;
  }
}

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    console.log('📦 GET /api/admin/products called');
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Access granted - processing request');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count(),
    ]);

    console.log(`📊 Returning ${products.length} products`);
    
    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product (keep your existing POST method, just update admin check)
export async function POST(request: NextRequest) {
  try {
    console.log('➕ POST /api/admin/products called');
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Access granted - processing request');
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.images) {
      return NextResponse.json(
        { error: 'Name, price, and images are required' },
        { status: 400 }
      );
    }

    // Process colors and sizes
    const availableColors = Array.isArray(body.availableColors) 
      ? body.availableColors 
      : (body.availableColors ? [body.availableColors] : []);
    
    const availableSizes = Array.isArray(body.availableSizes)
      ? body.availableSizes
      : (body.availableSizes ? [body.availableSizes] : []);

    // Validate colors and sizes
    const validColors = ['baby-pink', 'amber-200', 'black-300', 'gray', 'sky-blue', 'cream', 'black', 'green', 'yellow-200', 'red-900'];
    const validSizes = ['S', 'M', 'L'];

    const invalidColors = availableColors.filter(color => !validColors.includes(color));
    const invalidSizes = availableSizes.filter(size => !validSizes.includes(size));

    if (invalidColors.length > 0) {
      return NextResponse.json(
        { error: `Invalid colors: ${invalidColors.join(', ')}` },
        { status: 400 }
      );
    }

    if (invalidSizes.length > 0) {
      return NextResponse.json(
        { error: `Invalid sizes: ${invalidSizes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate price
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate stock
    const stock = parseInt(body.stock || '0');
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate images
    const images = Array.isArray(body.images) ? body.images : [body.images];
    if (images.length === 0 || !images.every((img: string) => typeof img === 'string' && img.trim())) {
      return NextResponse.json(
        { error: 'At least one valid image URL is required' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        description: (body.description || '').trim(),
        price: price,
        images: images.map((img: string) => img.trim()),
        category: body.category ? body.category.trim() : null,
        availableColors: availableColors,
        availableSizes: availableSizes,
        defaultColor: body.defaultColor || availableColors[0] || null,
        defaultSize: body.defaultSize || availableSizes[0] || null,
        stock: stock,
        isActive: body.isActive !== false,
        metadata: body.metadata || {},
      },
    });

    console.log('✅ Product created:', product.id);
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with similar details already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product. Please try again.' },
      { status: 500 }
    );
  }
}

// Add DELETE method
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/admin/products called');
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Access granted - processing request');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has orders
    if (product.orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      );
    }

    // Delete the product
    await prisma.product.delete({
      where: { id }
    });

    console.log('✅ Product deleted:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// Add this PATCH method to your existing route.ts file
export async function PATCH(request: NextRequest) {
  try {
    console.log('✏️ PATCH /api/admin/products called');
    const admin = await isAdmin(request);
    
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('✅ Access granted - processing update');
    
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate colors if provided
    if (updateData.availableColors !== undefined) {
      const validColors = ['baby-pink', 'amber-200', 'black-300', 'gray', 'sky-blue', 'cream', 'black', 'green', 'yellow-200', 'red-900'];
      const availableColors = Array.isArray(updateData.availableColors) 
        ? updateData.availableColors 
        : (updateData.availableColors ? [updateData.availableColors] : []);
      
      const invalidColors = availableColors.filter(color => !validColors.includes(color));
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
      const validSizes = ['S', 'M', 'L'];
      const availableSizes = Array.isArray(updateData.availableSizes)
        ? updateData.availableSizes
        : (updateData.availableSizes ? [updateData.availableSizes] : []);
      
      const invalidSizes = availableSizes.filter(size => !validSizes.includes(size));
      if (invalidSizes.length > 0) {
        return NextResponse.json(
          { error: `Invalid sizes: ${invalidSizes.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.availableSizes = availableSizes;
    }

    // If price changes and product is synced to Stripe, mark as unsynced
    if (updateData.price && existingProduct.stripeSynced) {
      const newPrice = parseFloat(updateData.price);
      if (newPrice !== parseFloat(existingProduct.price.toString())) {
        updateData.stripeSynced = false;
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        // Handle numeric conversions
        ...(updateData.price && { price: parseFloat(updateData.price) }),
        ...(updateData.stock !== undefined && { stock: parseInt(updateData.stock) }),
      },
    });

    console.log('✅ Product updated:', product.id);
    
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

