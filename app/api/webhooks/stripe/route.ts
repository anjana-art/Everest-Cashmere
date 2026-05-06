// app/api/webhooks/stripe/route.ts - COMPLETE WITH RETRY LOGIC

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// ──────────────────────────────────────────────────────────────
// 🔄 RETRY HELPER FUNCTION - FIXES THE 500 ERROR
// ──────────────────────────────────────────────────────────────
async function fetchSessionWithRetry(
  sessionId: string, 
  maxRetries: number = 5, 
  delayMs: number = 500
): Promise<Stripe.Checkout.Session> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔍 Fetching session ${sessionId} (attempt ${i + 1}/${maxRetries})...`);
      return await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items.data.price.product']
      });
    } catch (error: any) {
      if (error.message?.includes('No such checkout session') && i < maxRetries - 1) {
        console.log(`⏳ Session not ready, retry ${i + 1}/${maxRetries} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      console.error(`❌ Failed to fetch session after ${i + 1} attempts:`, error.message);
      throw error;
    }
  }
  throw new Error(`Failed to retrieve session ${sessionId} after ${maxRetries} retries`);
}
// ──────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📨 WEBHOOK RECEIVED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook signature verified');
  } catch (error: any) {
    console.error('❌ Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  console.log(`📌 Event type: ${event.type}`);

  // ──────────────────────────────────────────────────────────────
  // HANDLE: checkout.session.completed
  // ──────────────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const sessionReceived = event.data.object as Stripe.Checkout.Session;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 CHECKOUT.SESSION.COMPLETED RECEIVED');
    console.log(`📋 Session ID: ${sessionReceived.id}`);
    console.log(`💳 Payment status: ${sessionReceived.payment_status}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // 🔄 USE RETRY TO FETCH FULL SESSION DATA
    let session: Stripe.Checkout.Session;
    try {
      session = await fetchSessionWithRetry(sessionReceived.id);
      console.log('✅ Session retrieved successfully with line items');
    } catch (error: any) {
      console.error('❌ Failed to retrieve session after retries:', error.message);
      return NextResponse.json(
        { error: 'Failed to retrieve session' },
        { status: 500 }
      );
    }

    const sessionAny = session as any;

    // ── Portugal-only enforcement ──────────────────────────────────────────
    const shippingCountry =
      sessionAny.shipping_details?.address?.country ||
      sessionAny.shipping?.address?.country;
    const userId = session.metadata?.userId ?? 'unknown';
    const userEmail = session.metadata?.userEmail ?? session.customer_email ?? 'unknown';

    console.log(`🌍 Shipping country: ${shippingCountry}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📧 User email: ${userEmail}`);

    if (shippingCountry && shippingCountry !== 'PT') {
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn('🚫 [BLOCKED] Non-PT purchase attempt');
      console.warn(`   Session: ${session.id}`);
      console.warn(`   User: ${userId}`);
      console.warn(`   Country: ${shippingCountry}`);
      console.warn(`   Amount: ${session.amount_total}`);
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (session.payment_intent) {
        await stripe.refunds.create({
          payment_intent: session.payment_intent as string,
          reason: 'fraudulent',
        });
        console.info('💰 [REFUND] Issued refund for non-PT order');
      }

      return NextResponse.json({ received: true, action: 'refunded_non_pt' });
    }

    console.info('✅ [CHECKOUT] Portugal order confirmed - proceeding with order creation');

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      });

      console.log(`📦 Line items retrieved: ${lineItems.data.length}`);

      if (!userId || userId === 'unknown') {
        console.error('❌ No userId in session metadata - cannot create order');
        return NextResponse.json(
          { error: 'No user ID found in metadata' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, nif: true }
      });

      console.log(`👤 User found: ${user?.email || 'No email'}`);

      const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
      const total = session.amount_total ? session.amount_total / 100 : 0;
      const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0;

      console.log(`💰 Totals: subtotal=$${subtotal}, total=$${total}, tax=$${tax}`);

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

      console.log(`📋 Order items: ${orderItems.length}`);
      orderItems.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.name} x${item.quantity} - $${item.price}`);
      });

      // ── Stock update ──────────────────────────────────────────────────────
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 STARTING STOCK UPDATE (WEBHOOK)');
      
      for (const item of orderItems) {
        if (item.productId && item.productId !== 'unknown') {
          try {
            const variant = await prisma.productVariant.findFirst({
              where: {
                productId: item.productId,
                color: item.color || undefined,
                size: item.size?.toLowerCase() || undefined,
              }
            });
            
            if (variant) {
              console.log(`   📉 ${item.name}: stock ${variant.stock} → ${variant.stock - item.quantity}`);
              await prisma.productVariant.update({
                where: { id: variant.id },
                data: { stock: { decrement: item.quantity } }
              });
              
              const allVariants = await prisma.productVariant.findMany({
                where: { productId: item.productId, isActive: true }
              });
              const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
              
              await prisma.product.update({
                where: { id: item.productId },
                data: { stock: totalStock }
              });
            } else {
              console.warn(`   ⚠️ Variant not found for ${item.name} (color:${item.color}, size:${item.size})`);
            }
          } catch (stockError: any) {
            console.error(`   ❌ Stock error for ${item.name}:`, stockError.message);
          }
        }
      }
      console.log('✅ STOCK UPDATE COMPLETED (WEBHOOK)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ── Shipping address ──────────────────────────────────────────────────
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

      // ── Billing address ───────────────────────────────────────────────────
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

      // ✅ Check if order already exists (idempotency - prevents duplicates)
      const existingOrder = await prisma.order.findUnique({
        where: { stripeSessionId: session.id }
      });

      if (existingOrder) {
        console.log(`⚠️ Order already exists (idempotency check), skipping creation`);
        console.log(`   Existing order ID: ${existingOrder.id}`);
        console.log(`   Order number: ${existingOrder.orderNumber}`);
        return NextResponse.json({
          success: true,
          message: 'Order already exists',
          orderId: existingOrder.id,
          source: 'webhook_idempotent'
        });
      }

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
        include: { items: true }
      });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅✅✅ ORDER CREATED VIA WEBHOOK ✅✅✅`);
      console.log(`   Order ID: ${order.id}`);
      console.log(`   Order Number: ${orderNumber}`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Total: $${total}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ── Invoice creation (non-fatal - webhook primary) ───────────────────
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📄 CREATING INVOICE (WEBHOOK PRIMARY)');
      
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
        console.log(`   Calling invoice API at ${apiUrl}/api/create-invoice`);
        
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
          console.log(`✅✅✅ INVOICE CREATED VIA WEBHOOK ✅✅✅`);
          console.log(`   Invoice Number: ${invoiceData.invoice.number}`);
          console.log(`   Invoice URL: ${invoiceData.invoice.pdf_url}`);
        } else {
          console.error(`❌ Invoice creation failed (webhook): ${invoiceData.error}`);
        }
      } catch (invoiceError) {
        console.error('❌ Invoice error (non-fatal - webhook):', invoiceError);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // ── Clear cart ────────────────────────────────────────────────────────
      const userCart = await prisma.cart.findUnique({ where: { userId } });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
        console.log(`🗑️ Cart cleared for user ${userId}`);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 WEBHOOK PROCESSING COMPLETE - SUCCESS 🎉');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        message: 'Order created successfully via webhook',
        source: 'webhook'
      });

    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERROR IN WEBHOOK HANDLER ❌');
      console.error(`   Error: ${error.message}`);
      console.error(`   Session ID: ${session.id}`);
      console.error(`   User ID: ${userId}`);
      if (error.stack) console.error(`   Stack: ${error.stack}`);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }

  // ──────────────────────────────────────────────────────────────
  // HANDLE: payment_intent.succeeded
  // ──────────────────────────────────────────────────────────────
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`💰 Payment succeeded: ${paymentIntent.id} for amount ${paymentIntent.amount / 100} ${paymentIntent.currency}`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ WEBHOOK HANDLED (non-checkout event)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return NextResponse.json({ received: true });
}