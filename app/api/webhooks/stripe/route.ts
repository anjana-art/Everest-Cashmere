// app/api/webhooks/stripe/route.ts - COMPLETE UPDATED VERSION
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  console.log('Stripe webhook event type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const sessionAny = session as any;

    console.log('Processing checkout.session.completed:', {
      sessionId: session.id,
      customerEmail: session.customer_email,
      metadata: session.metadata,
      paymentStatus: session.payment_status,
    });

    // ── Portugal-only enforcement ──────────────────────────────────────────
    const shippingCountry =
      sessionAny.shipping_details?.address?.country ||
      sessionAny.shipping?.address?.country;
    const billingCountry =
      sessionAny.customer_details?.address?.country;
    const userId = session.metadata?.userId ?? 'unknown';
    const userEmail = session.metadata?.userEmail ?? session.customer_email ?? 'unknown';

    if (shippingCountry && shippingCountry !== 'PT') {
      console.warn('[BLOCKED] Non-PT purchase attempt', {
        sessionId: session.id,
        userId,
        userEmail,
        shippingCountry,
        billingCountry,
        amount: session.amount_total,
        currency: session.currency,
        timestamp: new Date().toISOString(),
      });

      if (session.payment_intent) {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'fraudulent',
        });
        console.info('[REFUND] Issued refund for non-PT order', {
          sessionId: session.id,
          userId,
          userEmail,
        });
      }

      return NextResponse.json({ received: true, action: 'refunded_non_pt' });
    }

    console.info('[CHECKOUT] Portugal order confirmed', {
      sessionId: session.id,
      userId,
      userEmail,
      shippingCountry: shippingCountry ?? 'PT',
      amount: session.amount_total,
      timestamp: new Date().toISOString(),
    });
    // ── End Portugal enforcement ───────────────────────────────────────────

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      });

      console.log('Line items retrieved:', lineItems.data.length);

      if (!userId || userId === 'unknown') {
        console.error('No userId in session metadata');
        return NextResponse.json(
          { error: 'No user ID found in metadata' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, nif: true }
      });

      const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
      const total = session.amount_total ? session.amount_total / 100 : 0;
      const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0;

      console.log('Creating order with totals:', { subtotal, total, tax });

      const orderItems = lineItems.data.map((item: any) => {
        const description = item.description || '';
        const nameMatch = description.match(/^(.*?) \((.*?), (.*?)\)$/);

        let name = description;
        let color = null;
        let size = null;

        if (nameMatch) {
          name = nameMatch[1];
          color = nameMatch[2];
          size = nameMatch[3];
        }

        return {
          productId: item.price?.product?.metadata?.productId || 
                     item.price?.product?.metadata?.dbProductId || 
                     'unknown',
          name,
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
          quantity: item.quantity || 1,
          image: item.price?.product?.images?.[0] || null,
          color,
          size,
        };
      });

      // 🔥 STOCK UPDATE - Added with safe error handling 🔥
      console.log('📦 === STARTING STOCK UPDATE ===');
      console.log('📦 Order items to process:', JSON.stringify(orderItems, null, 2));
      
      for (const item of orderItems) {
        console.log(`\n🔍 Processing item: ${item.name}`);
        console.log(`   Product ID: ${item.productId}`);
        console.log(`   Color: ${item.color}`);
        console.log(`   Size: ${item.size}`);
        console.log(`   Quantity: ${item.quantity}`);
        
        if (item.productId && item.productId !== 'unknown') {
          try {
            // Find the variant for this product/color/size
            const variant = await prisma.productVariant.findFirst({
              where: {
                productId: item.productId,
                color: item.color || undefined,
                size: item.size?.toLowerCase() || undefined,
              }
            });
            
            console.log(`   🔍 Variant found:`, variant ? {
              id: variant.id,
              color: variant.color,
              size: variant.size,
              stock: variant.stock
            } : 'NO VARIANT FOUND');
            
            if (variant) {
              console.log(`   📉 Current stock before update: ${variant.stock}`);
              
              // Decrement stock
              const updatedVariant = await prisma.productVariant.update({
                where: { id: variant.id },
                data: {
                  stock: {
                    decrement: item.quantity
                  }
                }
              });
              console.log(`   ✅ Stock after update: ${updatedVariant.stock}`);
              
              // Update product's total stock
              const allVariants = await prisma.productVariant.findMany({
                where: { productId: item.productId, isActive: true }
              });
              const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
              
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: totalStock }
              });
              console.log(`   ✅ Product total stock updated to: ${totalStock}`);
            } else {
              console.warn(`   ⚠️ VARIANT NOT FOUND for ${item.name}`);
              console.warn(`      Looked for: color=${item.color}, size=${item.size?.toLowerCase()}`);
              
              // Log all variants for this product to debug
              const allVariantsForProduct = await prisma.productVariant.findMany({
                where: { productId: item.productId }
              });
              console.log(`   📦 Available variants for product:`, 
                allVariantsForProduct.map(v => ({ color: v.color, size: v.size, stock: v.stock }))
              );
            }
          } catch (stockError: any) {
            console.error(`   ❌ Error updating stock for ${item.name}:`, stockError.message);
          }
        } else {
          console.warn(`   ⚠️ Skipping: productId is 'unknown'`);
        }
      }
      
      console.log('✅ === STOCK UPDATE COMPLETED ===');

      // Shipping address
      let shippingData = sessionAny.shipping_details || sessionAny.shipping || null;

      const shippingAddress = shippingData ? {
        name: shippingData.name || '',
        address: {
          line1: shippingData.address?.line1 || '',
          line2: shippingData.address?.line2 || '',
          city: shippingData.address?.city || '',
          state: shippingData.address?.state || '',
          postalCode: shippingData.address?.postal_code || '',
          country: shippingData.address?.country || '',
        }
      } : Prisma.DbNull;

      // Billing address
      const billingData = sessionAny.customer_details || null;

      const billingAddress = billingData ? {
        name: billingData.name || '',
        email: billingData.email || '',
        address: billingData.address ? {
          line1: billingData.address.line1 || '',
          line2: billingData.address.line2 || '',
          city: billingData.address.city || '',
          state: billingData.address.state || '',
          postalCode: billingData.address.postal_code || '',
          country: billingData.address.country || '',
        } : undefined
      } : Prisma.DbNull;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const order = await prisma.order.create({
        data: {
          userId,
          stripeSessionId: session.id,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          orderNumber,
          subtotal,
          total,
          tax,
          shipping: 0,
          status: 'PAID',
          trackingStatus: 'ORDER_RECEIVED',
          paymentMethod: 'card',
          items: { create: orderItems },
          shippingAddress,
          billingAddress,
          paidAt: new Date(),
          preparingAt: new Date(),
        },
        include: { items: true, user: true }
      });

      console.log(`Order created: ${order.id} (${orderNumber})`);

      // ── Invoice creation (non-fatal) ───────────────────────────────────
      try {
        const invoicePayload = {
          client: {
            name: user?.name || '',
            email: user?.email || '',
            vat_number: user?.nif || undefined,
          },
          items: orderItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            vat_rate: 23,
          })),
          orderId: orderNumber,
        };

        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const invoiceResponse = await fetch(`${apiUrl}/api/create-invoice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoicePayload),
        });

        const invoiceData = await invoiceResponse.json();

        if (invoiceData.success) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              invoiceId: invoiceData.invoice.id,
              invoiceNumber: invoiceData.invoice.number,
              invoiceUrl: invoiceData.invoice.pdf_url,
            }
          });
          console.log(`Invoice created: ${invoiceData.invoice.number} for order ${orderNumber}`);
        } else {
          console.error('Invoice creation failed:', { orderNumber, error: invoiceData.error });
        }
      } catch (invoiceError) {
        console.error('Invoice error (non-fatal):', { orderNumber, error: invoiceError });
      }
      // ── End invoice creation ───────────────────────────────────────────

      // Clear cart
      const userCart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: true }
      });

      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log(`Cart cleared for user ${userId}`);
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        message: 'Order created successfully',
      });

    } catch (error: any) {
      console.error('Error creating order:', {
        sessionId: session.id,
        userId,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });

      return NextResponse.json(
        {
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        { status: 500 }
      );
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('Payment succeeded:', paymentIntent.id);
  }

  return NextResponse.json({ received: true });
}