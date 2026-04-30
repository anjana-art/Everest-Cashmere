// app/api/admin/products/[id]/route.ts - COMPLETE REPLACEMENT WITH FIXED PATCH

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

// Helper function to sync variants when product is updated
async function syncVariantsOnUpdate(
  productId: string, 
  colors: string[], 
  sizes: string[],
  stockPerVariant?: number
) {
  console.log(`🔄 Syncing variants for product ${productId}`);
  console.log(`   Colors: ${colors.join(', ')}`);
  console.log(`   Sizes: ${sizes.join(', ')}`);
  
  const existingVariants = await prisma.productVariant.findMany({
    where: { productId: productId }
  });
  
  const existingKeys = new Set(
    existingVariants.map(v => `${v.color}|${v.size}`)
  );
  
  let createdCount = 0;
  let deactivatedCount = 0;
  
  // Create missing variants (ALL combinations)
  for (const color of colors) {
    for (const size of sizes) {
      const sizeLower = size.toLowerCase();
      const key = `${color}|${sizeLower}`;
      
      if (!existingKeys.has(key)) {
        const sku = `${productId.substring(0, 8)}-${color}-${sizeLower}`.toUpperCase().replace(/\s/g, '-');
        
        await prisma.productVariant.create({
          data: {
            productId: productId,
            color: color,
            size: sizeLower,
            sku: sku,
            stock: stockPerVariant || 10,
            isActive: true,
          }
        });
        createdCount++;
        console.log(`   ✅ Created new variant: ${color}/${sizeLower}`);
      }
    }
  }
  
  // Deactivate variants for removed combinations
  const validKeys = new Set();
  for (const color of colors) {
    for (const size of sizes) {
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
    deactivatedCount = variantsToDeactivate.length;
    console.log(`   ⚠️ Deactivated ${deactivatedCount} variants for removed combinations`);
  }
  
  console.log(`✅ Sync complete: ${createdCount} created, ${deactivatedCount} deactivated`);
}

// GET - Get single product (includes variants)
export async function GET(
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
      include: {
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            color: true,
            size: true,
            stock: true,
            sku: true,
            isActive: true,
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('✅ Product found:', product.name);
    console.log('✅ Variants count:', product.variants?.length || 0);
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH - Update single product with variant stock updates (FIXED)
export async function PATCH(
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
    console.log('📥 Received update body:', JSON.stringify(body, null, 2));

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product basic info
    const updateFields: any = {};
    
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.price !== undefined) updateFields.price = parseFloat(body.price);
    if (body.images !== undefined) updateFields.images = body.images;
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.clothingType !== undefined) updateFields.clothingType = body.clothingType;
    if (body.gender !== undefined) updateFields.gender = body.gender;
    if (body.accessoriesType !== undefined) updateFields.accessoriesType = body.accessoriesType;
    if (body.availableColors !== undefined) updateFields.availableColors = body.availableColors;
    if (body.availableSizes !== undefined) updateFields.availableSizes = body.availableSizes;
    if (body.defaultColor !== undefined) updateFields.defaultColor = body.defaultColor;
    if (body.defaultSize !== undefined) updateFields.defaultSize = body.defaultSize;
    if (body.isActive !== undefined) updateFields.isActive = body.isActive;

    // Update the product
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateFields,
    });

    console.log('✅ Product basic info updated:', product.name);

    // IMPORTANT: Update variant stocks from variantStocks object
    if (body.variantStocks && typeof body.variantStocks === 'object') {
      console.log('📦 Updating variant stocks...');
      
      for (const [variantKey, stockValue] of Object.entries(body.variantStocks)) {
        const [color, size] = variantKey.split('|');
        if (color && size && typeof stockValue === 'number') {
          const sizeLower = size.toLowerCase();
          
          try {
            // Use upsert to either update or create the variant
            await prisma.productVariant.upsert({
              where: {
                productId_color_size: {
                  productId: productId,
                  color: color,
                  size: sizeLower,
                }
              },
              update: { 
                stock: stockValue,
                isActive: stockValue > 0
              },
              create: {
                productId: productId,
                color: color,
                size: sizeLower,
                sku: `${productId.substring(0, 8)}-${color}-${sizeLower}`.toUpperCase().replace(/\s/g, '-'),
                stock: stockValue,
                isActive: stockValue > 0,
              }
            });
            console.log(`   ✅ Updated ${color}/${sizeLower} stock to ${stockValue}`);
          } catch (err) {
            console.error(`   ❌ Failed to update ${color}/${sizeLower}:`, err);
          }
        }
      }
    }

    // Also handle legacy stockPerVariant if provided
    if (body.stockPerVariant !== undefined && body.availableColors && body.availableSizes) {
      console.log('📦 Using stockPerVariant to update all variants');
      for (const color of body.availableColors) {
        for (const size of body.availableSizes) {
          const sizeLower = size.toLowerCase();
          await prisma.productVariant.upsert({
            where: {
              productId_color_size: {
                productId: productId,
                color: color,
                size: sizeLower,
              }
            },
            update: { stock: body.stockPerVariant },
            create: {
              productId: productId,
              color: color,
              size: sizeLower,
              sku: `${productId.substring(0, 8)}-${color}-${sizeLower}`.toUpperCase().replace(/\s/g, '-'),
              stock: body.stockPerVariant,
              isActive: true,
            }
          });
        }
      }
      console.log(`   ✅ Set all variants stock to ${body.stockPerVariant}`);
    }

    // Calculate total stock from all active variants
    const allVariants = await prisma.productVariant.findMany({
      where: { productId: productId, isActive: true }
    });
    const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
    
    // Update product total stock
    await prisma.product.update({
      where: { id: productId },
      data: { stock: totalStock }
    });

    console.log(`✅ Total stock updated to ${totalStock}`);

    // Fetch updated product with variants to return
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            color: true,
            size: true,
            stock: true,
            sku: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
      totalStock,
    });
    
  } catch (error: any) {
    console.error('❌ Error updating product:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update product. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete single product
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is already deactivated' },
        { status: 400 }
      );
    }

    // Deactivate all variants
    await prisma.productVariant.updateMany({
      where: { productId: productId },
      data: { isActive: false }
    });

    // Soft delete the product
    const deactivatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    console.log('✅ Product and all variants deactivated:', productId);

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