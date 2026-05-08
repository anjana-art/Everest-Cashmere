// app/api/admin/products/[id]/route.ts - COMPLETE REPLACEMENT WITH FIXED PATCH & ERROR HANDLING

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

// Helper to validate if string is a valid URL (not base64)
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  // Check if it's a base64 image (too large, reject)
  if (url.startsWith('data:image/')) return false;
  // Check if it's a valid URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Helper to validate and filter images
function validateImages(images: any): string[] | null {
  if (!images || !Array.isArray(images)) return null;
  
  const validImages = images.filter(img => {
    if (typeof img !== 'string') return false;
    // Reject base64 images
    if (img.startsWith('data:image/')) {
      console.warn('⚠️ Rejected base64 image - too large for API');
      return false;
    }
    return true;
  });
  
  return validImages;
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

// PATCH - Update single product with variant stock updates (FIXED with better error handling)
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
    
    // Check admin
    const admin = await isAdmin(request);
    if (!admin) {
      console.log('🚫 Access denied - not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Failed to parse JSON body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body. Please check the data being sent.' },
        { status: 400 }
      );
    }
    
    console.log('📥 Received update body keys:', Object.keys(body));
    
    // Check for base64 images in request - FIXED: Added :string type to img parameter
    if (body.images && Array.isArray(body.images)) {
      const hasBase64 = body.images.some((img: string) => typeof img === 'string' && img.startsWith('data:image/'));
      if (hasBase64) {
        console.warn('⚠️ WARNING: Base64 images detected in request. These should be uploaded as files first.');
        return NextResponse.json(
          { 
            error: 'Please upload images as files first, not base64 data. Use image upload endpoint before updating product.',
            hint: 'Images should be stored as URLs, not embedded in the API request.'
          },
          { status: 413 }
        );
      }
    }

    // Check request size (rough estimate - 1MB limit)
    const bodyString = JSON.stringify(body);
    const bodySizeInMB = bodyString.length / (1024 * 1024);
    console.log(`📦 Request body size: ${bodySizeInMB.toFixed(2)} MB`);
    
    if (bodySizeInMB > 1) {
      console.warn('⚠️ Request body is large:', bodySizeInMB.toFixed(2), 'MB');
      return NextResponse.json(
        { 
          error: `Request body too large (${bodySizeInMB.toFixed(2)} MB). Limit is 1 MB.`,
          hint: 'Upload images as files first, then send only the URLs.'
        },
        { status: 413 }
      );
    }

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
    
    // Handle images - validate and filter
    if (body.images !== undefined) {
      const validImages = validateImages(body.images);
      if (validImages !== null) {
        updateFields.images = validImages;
        if (validImages.length !== body.images.length) {
          console.log(`📸 Filtered images: ${body.images.length} -> ${validImages.length} (removed base64)`);
        }
      }
    }
    
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
      
      let updatedCount = 0;
      let errorCount = 0;
      
      for (const [variantKey, stockValue] of Object.entries(body.variantStocks)) {
        const [color, size] = variantKey.split('|');
        if (color && size && typeof stockValue === 'number') {
          const sizeLower = size.toLowerCase();
          
          try {
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
            updatedCount++;
          } catch (err) {
            errorCount++;
            console.error(`   ❌ Failed to update ${color}/${sizeLower}:`, err);
          }
        }
      }
      console.log(`   ✅ Updated ${updatedCount} variants (${errorCount} errors)`);
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
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this data already exists.' },
        { status: 409 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found or already deleted.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update product. Please try again.',
        type: error.name || 'UnknownError'
      },
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