// app/api/sync-products/route.ts - FIXED (divide by 100)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

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
      const priceInEuros = price?.unit_amount ? price.unit_amount : 0;
      
      const product = await prisma.product.upsert({
        where: { stripeId: stripeProduct.id },
        update: {
          name: stripeProduct.name,
          description: stripeProduct.description || '',
          price: priceInEuros, // Store in euros
          images: stripeProduct.images || [],
          category: stripeProduct.metadata?.category || null,
          metadata: stripeProduct.metadata,
        },
        create: {
          stripeId: stripeProduct.id,
          name: stripeProduct.name,
          description: stripeProduct.description || '',
          price: priceInEuros, // Store in euros
          images: stripeProduct.images || [],
          category: stripeProduct.metadata?.category || null,
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