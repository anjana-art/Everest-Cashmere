// app/api/checkout/create/route.ts - FIXED VERSION
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, userId } = body;
    
    console.log('Checkout API received:', { 
      itemCount: items?.length,
      userId,
      firstItem: items?.[0] ? {
        id: items[0].id,
        name: items[0].name,
        price: items[0].price,
        quantity: items[0].quantity,
        // Don't log the entire base64 image
        hasImage: !!items[0].imageUrl,
        imageLength: items[0].imageUrl?.length
      } : null
    });
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated (optional but recommended)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    // Validate each item has required fields
    for (const item of items) {
      if (!item.id || !item.name || !item.price || !item.quantity) {
        console.error('Invalid item:', item);
        return NextResponse.json(
          { error: `Missing required fields for item: ${item.name || 'unknown'}` },
          { status: 400 }
        );
      }
    }
    
    // First, ensure all products exist in Stripe
    const lineItems = [];
    
    for (const item of items) {
      // 1. Get product from your database
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          stripeId: true,
          name: true,
          price: true,
          images: true,
        },
      });
      
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 404 }
        );
      }
      
      // 2. If product doesn't have stripeId, create it in Stripe
      let stripeProductId = dbProduct.stripeId;
      
      if (!stripeProductId) {
        console.log(`Creating Stripe product for: ${dbProduct.name}`);
        
        // Filter out base64 images (too long for Stripe)
        const validImages = dbProduct.images.filter(img => {
          // Check if it's a base64 string (starts with data:image)
          if (img.startsWith('data:image')) {
            console.warn(`Skipping base64 image for Stripe (${img.length} chars)`);
            return false;
          }
          // Check if it's a valid URL and not too long
          return img.length <= 2000 && (img.startsWith('http') || img.startsWith('/'));
        });
        
        const stripeProduct = await stripe.products.create({
          name: dbProduct.name,
          description: `Product ID: ${dbProduct.id}`,
          // Only send valid images (not base64)
          images: validImages.length > 0 ? validImages : undefined,
          metadata: {
            dbId: dbProduct.id,
            type: 'product',
          },
        });
        
        stripeProductId = stripeProduct.id;
        
        // Update database with Stripe ID
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: { stripeId: stripeProductId },
        });
        
        console.log(`Created Stripe product: ${stripeProductId}`);
      }
      
      // 3. Create or get price in Stripe
      // Convert price to cents for Stripe
      const priceInCents = Math.round(Number(dbProduct.price) * 100);
      
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceInCents,
        currency: 'eur', // or 'usd' depending on your region
        metadata: {
          dbProductId: dbProduct.id,
          color: item.color || 'default',
          size: item.size || 'default',
        },
      });
      
      // 4. Add to line items
      lineItems.push({
        price: price.id,
        quantity: item.quantity,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 10,
        },
      });
    }
    
    // 5. Create Stripe Checkout Session
    const origin = request.headers.get('origin') || 'http://localhost:3001';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        userId: userId || 'guest',
        itemsCount: items.length.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ['PT','ES', 'NO', 'FI', 'SE', 'DK', 'NL', 'DE', 'BE', 'LU', 'AT', 'CH', 'IT', 'FR', 'IE', ], // Add your countries
      },
      allow_promotion_codes: true,
    });
    
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
    
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Checkout failed. Please try again.',
        details: error.message,
        stripeError: error.code,
      },
      { status: 500 }
    );
  }
}