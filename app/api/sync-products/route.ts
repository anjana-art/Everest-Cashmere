import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { ProductCategory } from '@prisma/client';

export async function GET() {
  try {
    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price']
    });

    const syncedProducts = [];
    
    for (const stripeProduct of products.data) {
      const price = stripeProduct.default_price as any;
      
      // Convert cents to euros by dividing by 100
      const priceInEuros = price?.unit_amount ? price.unit_amount / 100 : 0; // Fixed: added division by 100
      
      // Parse and validate the category
      let category: ProductCategory | null = null;
      const stripeCategory = stripeProduct.metadata?.category;
      
      if (stripeCategory) {
        // Convert Stripe category to match your enum values
        const formattedCategory = stripeCategory.toUpperCase().replace(/\s+/g, '_');
        
        // Check if it's a valid enum value
        if (Object.values(ProductCategory).includes(formattedCategory as ProductCategory)) {
          category = formattedCategory as ProductCategory;
        } else {
          // Optional: handle different category naming conventions
          const categoryMap: Record<string, ProductCategory> = {
            'CLOTHING': ProductCategory.CLOTHING,
            'CLOTHES': ProductCategory.CLOTHING,
            'APPAREL': ProductCategory.CLOTHING,
            'HOME_DECOR': ProductCategory.HOME_DECORE,
            'HOME': ProductCategory.HOME_DECORE,
            'DECOR': ProductCategory.HOME_DECORE,
            'HOME-DECORE': ProductCategory.HOME_DECORE, // Handle hyphen
            'ACCESSORIES': ProductCategory.ACCESSORIES,
            'ACCESSORY': ProductCategory.ACCESSORIES,
          };
          
          if (categoryMap[stripeCategory.toUpperCase()]) {
            category = categoryMap[stripeCategory.toUpperCase()];
          }
        }
      }
      
      const product = await prisma.product.upsert({
        where: { stripeId: stripeProduct.id },
        update: {
          name: stripeProduct.name,
          description: stripeProduct.description || '',
          price: priceInEuros, // Store in euros
          images: stripeProduct.images || [],
          category: category, // Use validated category
          metadata: stripeProduct.metadata,
        },
        create: {
          stripeId: stripeProduct.id,
          name: stripeProduct.name,
          description: stripeProduct.description || '',
          price: priceInEuros, // Store in euros
          images: stripeProduct.images || [],
          category: category, // Use validated category
          metadata: stripeProduct.metadata,
        },
      });
      
      syncedProducts.push(product);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedProducts.length} products`,
      products: syncedProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        priceInEuros: `€${Number(p.price).toFixed(2)}`
      }))
    });
  } catch (error) {
    console.error('Error syncing products:', error);
    return NextResponse.json(
      { error: 'Failed to sync products' },
      { status: 500 }
    );
  }
}