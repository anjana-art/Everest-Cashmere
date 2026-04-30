// app/api/admin/products/route.ts - UPDATED with auto-variant creation
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    console.log('🔐 === STARTING ADMIN CHECK ===');
    
    const adminToken = request.headers.get('x-admin-token');
    console.log('🔑 Admin token from headers:', adminToken ? 'Present' : 'Missing');
    
    if (adminToken && adminToken === process.env.ADMIN_TOKEN) {
      console.log('✅ Admin access granted via token');
      return true;
    }

    const cookieHeader = request.headers.get('cookie');
    console.log('🍪 Raw cookie header:', cookieHeader);
    
    if (!cookieHeader) {
      console.log('❌ No cookies found in request');
      return false;
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      const value = rest.join('=');
      if (name) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    console.log('📋 Parsed cookies:', Object.keys(cookies));
    
    if (cookies['admin-check'] === 'true') {
      console.log('✅ Admin access via admin-check cookie');
      return true;
    }
    
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

// Helper function to auto-create variants
async function autoCreateVariants(productId: string, colors: string[], sizes: string[], defaultStock: number = 10) {
  console.log(`🔄 Auto-creating variants for product ${productId}`);
  console.log(`   Colors: ${colors.join(', ')}`);
  console.log(`   Sizes: ${sizes.join(', ')}`);
  
  const variants = [];
  
  for (const color of colors) {
    for (const size of sizes) {
      const sku = `${productId.substring(0, 8)}-${color}-${size}`.toUpperCase().replace(/\s/g, '-');
      
      variants.push(
        prisma.productVariant.upsert({
          where: {
            productId_color_size: {
              productId: productId,
              color: color,
              size: size.toLowerCase(),
            }
          },
          update: {
            stock: defaultStock,
            isActive: true,
          },
          create: {
            productId: productId,
            color: color,
            size: size.toLowerCase(),
            sku: sku,
            stock: defaultStock,
            isActive: true,
          }
        })
      );
    }
  }
  
  const results = await Promise.all(variants);
  console.log(`✅ Created/Updated ${results.length} variants`);
  return results;
}

// Helper function to sync variants when product is updated
async function syncVariantsOnUpdate(productId: string, newColors: string[], newSizes: string[]) {
  // Get existing variants
  const existingVariants = await prisma.productVariant.findMany({
    where: { productId: productId }
  });
  
  const existingKeys = new Set(
    existingVariants.map(v => `${v.color}|${v.size}`)
  );
  
  const newCombinations = [];
  
  // Find missing combinations
  for (const color of newColors) {
    for (const size of newSizes) {
      const key = `${color}|${size.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        newCombinations.push({ color, size: size.toLowerCase() });
      }
    }
  }
  
  // Create missing variants
  if (newCombinations.length > 0) {
    console.log(`🆕 Creating ${newCombinations.length} new variant combinations`);
    
    for (const combo of newCombinations) {
      const sku = `${productId.substring(0, 8)}-${combo.color}-${combo.size}`.toUpperCase().replace(/\s/g, '-');
      
      await prisma.productVariant.upsert({
        where: {
          productId_color_size: {
            productId: productId,
            color: combo.color,
            size: combo.size,
          }
        },
        update: {
          isActive: true,
        },
        create: {
          productId: productId,
          color: combo.color,
          size: combo.size,
          sku: sku,
          stock: 10,
          isActive: true,
        }
      });
    }
    
    console.log(`✅ Created ${newCombinations.length} new variants`);
  }
  
  // Optionally deactivate variants for removed combinations
  const validKeys = new Set();
  for (const color of newColors) {
    for (const size of newSizes) {
      validKeys.add(`${color}|${size.toLowerCase()}`);
    }
  }
  
  const variantsToDeactivate = existingVariants.filter(v => !validKeys.has(`${v.color}|${v.size}`));
  if (variantsToDeactivate.length > 0) {
    await prisma.productVariant.updateMany({
      where: {
        productId: productId,
        id: { in: variantsToDeactivate.map(v => v.id) }
      },
      data: { isActive: false }
    });
    console.log(`⚠️ Deactivated ${variantsToDeactivate.length} variants for removed combinations`);
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
        include: {
          variants: {
            select: {
              id: true,
              color: true,
              size: true,
              stock: true,
            }
          }
        }
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

// POST - Create new product with auto-variants
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

    // Validate category if provided
    if (body.category) {
      const validCategories = ['CLOTHING', 'HOME_DECORE', 'ACCESSORIES'];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }

      if (body.category === 'CLOTHING' && body.clothingType) {
        const validClothingTypes = ['CASHMERE', 'CASHMERE_MARINO_WOOL', 'MARINO_WOOL'];
        if (!validClothingTypes.includes(body.clothingType)) {
          return NextResponse.json(
            { error: `Invalid clothing type. Must be one of: ${validClothingTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }

      if (body.category === 'CLOTHING' && body.gender) {
        const validGenders = ['MEN', 'WOMEN', 'UNISEX'];
        if (!validGenders.includes(body.gender)) {
          return NextResponse.json(
            { error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` },
            { status: 400 }
          );
        }
      }

      if (body.category === 'ACCESSORIES' && body.accessoriesType) {
        const validAccessoriesTypes = ['MEN', 'WOMEN', 'UNISEX'];
        if (!validAccessoriesTypes.includes(body.accessoriesType)) {
          return NextResponse.json(
            { error: `Invalid accessories type. Must be one of: ${validAccessoriesTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }

      if (body.category !== 'CLOTHING') {
        body.clothingType = null;
        body.gender = null;
      }
      if (body.category !== 'ACCESSORIES') {
        body.accessoriesType = null;
      }
    }

    // Process colors and sizes
    const availableColors = Array.isArray(body.availableColors) 
      ? body.availableColors 
      : (body.availableColors ? [body.availableColors] : []);
    
    const availableSizes = Array.isArray(body.availableSizes)
      ? body.availableSizes
      : (body.availableSizes ? [body.availableSizes] : []);

    // Validate colors and sizes
    const validColors = ['baby-pink', 'amber-200', 'black-300', 'gray', 'sky-blue', 'cream', 'black', 'green', 'yellow-200', 'red-900', 'beige', 'charcoal', 'indigo', 'taupe'];
    const validSizes = ['XS', 'S', 'M', 'L', 'XL'];

    const invalidColors = availableColors.filter((color: string) => !validColors.includes(color));
    const invalidSizes = availableSizes.filter((size: string) => !validSizes.includes(size));

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

    // Get stock per variant (default 10 if not specified)
    const stockPerVariant = body.stockPerVariant || 10;

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
        category: body.category || null,
        clothingType: body.clothingType || null,
        gender: body.gender || null,
        accessoriesType: body.accessoriesType || null,
        availableColors: availableColors,
        availableSizes: availableSizes,
        defaultColor: body.defaultColor || availableColors[0] || null,
        defaultSize: body.defaultSize || availableSizes[0] || null,
        stock: availableColors.length * availableSizes.length * stockPerVariant, // Total stock
        isActive: body.isActive !== false,
        metadata: body.metadata || {},
      },
    });

    console.log('✅ Product created:', {
      id: product.id,
      name: product.name,
      category: product.category,
    });

    // AUTO-CREATE VARIANTS for each color and size combination
    if (availableColors.length > 0 && availableSizes.length > 0) {
      await autoCreateVariants(product.id, availableColors, availableSizes, stockPerVariant);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully with variants',
      product,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    
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

// PATCH - Update product and sync variants
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
      include: { variants: true }
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

      if (updateData.category === 'CLOTHING' && updateData.clothingType) {
        const validClothingTypes = ['CASHMERE', 'CASHMERE_MARINO_WOOL', 'MARINO_WOOL'];
        if (!validClothingTypes.includes(updateData.clothingType)) {
          return NextResponse.json(
            { error: `Invalid clothing type. Must be one of: ${validClothingTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }

      if (updateData.category === 'CLOTHING' && updateData.gender) {
        const validGenders = ['MEN', 'WOMEN', 'UNISEX'];
        if (!validGenders.includes(updateData.gender)) {
          return NextResponse.json(
            { error: `Invalid gender. Must be one of: ${validGenders.join(', ')}` },
            { status: 400 }
          );
        }
      }

      if (updateData.category === 'ACCESSORIES' && updateData.accessoriesType) {
        const validAccessoriesTypes = ['MEN', 'WOMEN', 'UNISEX'];
        if (!validAccessoriesTypes.includes(updateData.accessoriesType)) {
          return NextResponse.json(
            { error: `Invalid accessories type. Must be one of: ${validAccessoriesTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }

      if (updateData.category !== 'CLOTHING') {
        updateData.clothingType = null;
        updateData.gender = null;
      }
      if (updateData.category !== 'ACCESSORIES') {
        updateData.accessoriesType = null;
      }
    }

    // Track color/size changes for variant sync
    let newColors = existingProduct.availableColors;
    let newSizes = existingProduct.availableSizes;
    
    if (updateData.availableColors !== undefined) {
      const validColors = ['baby-pink', 'amber-200', 'black-300', 'gray', 'sky-blue', 'cream', 'black', 'green', 'yellow-200', 'red-900', 'beige', 'charcoal', 'indigo', 'taupe'];
      newColors = Array.isArray(updateData.availableColors) 
        ? updateData.availableColors 
        : (updateData.availableColors ? [updateData.availableColors] : []);
      
      const invalidColors = newColors.filter((color: string) => !validColors.includes(color));
      if (invalidColors.length > 0) {
        return NextResponse.json(
          { error: `Invalid colors: ${invalidColors.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.availableColors = newColors;
    }

    if (updateData.availableSizes !== undefined) {
      const validSizes = ['XS', 'S', 'M', 'L', 'XL'];
      newSizes = Array.isArray(updateData.availableSizes)
        ? updateData.availableSizes
        : (updateData.availableSizes ? [updateData.availableSizes] : []);
      
      const invalidSizes = newSizes.filter((size: string) => !validSizes.includes(size));
      if (invalidSizes.length > 0) {
        return NextResponse.json(
          { error: `Invalid sizes: ${invalidSizes.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.availableSizes = newSizes;
    }

    // Prepare update data
    const dataToUpdate: any = {
      ...updateData,
      ...(updateData.price && { price: parseFloat(updateData.price) }),
      ...(updateData.stock !== undefined && { stock: parseInt(updateData.stock) }),
    };

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    console.log('✅ Product updated:', {
      id: product.id,
      name: product.name,
    });

    // SYNC VARIANTS if colors or sizes changed
    if (updateData.availableColors || updateData.availableSizes) {
      await syncVariantsOnUpdate(id, newColors, newSizes);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully with variants synced',
      product,
    });
    
  } catch (error: any) {
    console.error('Error updating product:', error);
    
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

// DELETE method (unchanged)
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

    // Delete variants first (cascade should handle this, but explicit for safety)
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });

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