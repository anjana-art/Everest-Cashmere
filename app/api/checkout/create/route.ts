// app/api/checkout/create/route.ts - UPDATED with stock check
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
        color: items[0].color,
        size: items[0].size,
        hasImage: !!items[0].imageUrl,
      } : null
    });
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }
    
    // CHECK STOCK BEFORE CREATING CHECKOUT
    for (const item of items) {
      // Find the variant for this product/color/size
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: item.id,
          color: item.color,
          size: item.size,
          isActive: true,
        }
      });
      
      if (!variant) {
        return NextResponse.json(
          { error: `Product variant not found for ${item.name} (${item.color}, ${item.size})` },
          { status: 400 }
        );
      }
      
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name} - ${item.color} / ${item.size}. Only ${variant.stock} left.` },
          { status: 400 }
        );
      }
    }
    
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
    const checkoutItems = []; // Store item details for metadata
    
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
      
      // Get variant ID for stock tracking
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId: item.id,
          color: item.color,
          size: item.size,
        }
      });
      
      // 2. If product doesn't have stripeId, create it in Stripe
      let stripeProductId = dbProduct.stripeId;
      
      if (!stripeProductId) {
        console.log(`Creating Stripe product for: ${dbProduct.name}`);
        
        const validImages = dbProduct.images.filter(img => {
          if (img.startsWith('data:image')) {
            return false;
          }
          return img.length <= 2000 && (img.startsWith('http') || img.startsWith('/'));
        });
        
        const stripeProduct = await stripe.products.create({
          name: dbProduct.name,
          description: `Product ID: ${dbProduct.id}`,
          images: validImages.length > 0 ? validImages : undefined,
          metadata: {
            dbId: dbProduct.id,
            type: 'product',
          },
        });
        
        stripeProductId = stripeProduct.id;
        
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: { stripeId: stripeProductId },
        });
        
        console.log(`Created Stripe product: ${stripeProductId}`);
      }
      
      // 3. Create or get price in Stripe
      const priceInCents = Math.round(Number(dbProduct.price) * 100);
      
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceInCents,
        currency: 'eur',
        metadata: {
          dbProductId: dbProduct.id,
          color: item.color || 'default',
          size: item.size || 'default',
          variantId: variant?.id || '',
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
      
      // Store item details for metadata
      checkoutItems.push({
        productId: item.id,
        variantId: variant?.id,
        name: item.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      });
    }
    
    // 5. Create Stripe Checkout Session
    const origin = request.headers.get('origin') || 'http://localhost:3001';
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    let actualUserId = userId;
    
    if (!actualUserId && userCookie) {
      try {
        const user = JSON.parse(userCookie.value);
        actualUserId = user.id;
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        userId: actualUserId || 'guest',
        itemsCount: items.length.toString(),
        checkoutItems: JSON.stringify(checkoutItems), // Store items for webhook
      },
      shipping_address_collection: {
        allowed_countries: ['PT', 'ES', 'NO', 'FI', 'SE', 'DK', 'NL', 'DE', 'BE', 'LU', 'AT', 'CH', 'IT', 'FR', 'IE'],
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