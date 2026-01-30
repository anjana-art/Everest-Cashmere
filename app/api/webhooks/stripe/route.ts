// app/api/webhooks/stripe/route.ts (FIXED VERSION)
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

  // Handle successful checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('Processing checkout.session.completed:', {
      sessionId: session.id,
      customerEmail: session.customer_email,
      metadata: session.metadata,
      paymentStatus: session.payment_status,
      // Debug: check what properties exist
      hasShipping: !!(session as any).shipping_details || !!(session as any).shipping,
      hasCustomerDetails: !!(session as any).customer_details
    });
    
    try {
      // Get line items with product info
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ['data.price.product']
      });
      
      console.log('Line items retrieved:', lineItems.data.length);
      
      // Get user ID from metadata
      const userId = session.metadata?.userId;
      
      if (!userId) {
        console.error('No userId in session metadata');
        return NextResponse.json(
          { error: 'No user ID found in metadata' },
          { status: 400 }
        );
      }
      
      // Calculate totals
      const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
      const total = session.amount_total ? session.amount_total / 100 : 0;
      const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0;
      
      console.log('Creating order with totals:', { subtotal, total, tax });
      
      // Parse item names to extract color and size
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
          productId: item.price?.product?.metadata?.productId || 'unknown',
          name: name,
          price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
          quantity: item.quantity || 1,
          image: item.price?.product?.images?.[0] || null,
          color: color,
          size: size
        };
      });
      
      // Type assertion to access properties that might exist
      const sessionAny = session as any;
      
      // Prepare shipping address - check multiple possible property names
      let shippingData = null;
      if (sessionAny.shipping_details) {
        shippingData = sessionAny.shipping_details;
      } else if (sessionAny.shipping) {
        shippingData = sessionAny.shipping;
      }
      
      const shippingAddress = shippingData ? {
        name: shippingData.name || '',
        address: {
          line1: shippingData.address?.line1 || '',
          line2: shippingData.address?.line2 || '',
          city: shippingData.address?.city || '',
          state: shippingData.address?.state || '',
          postalCode: shippingData.address?.postal_code || '',
          country: shippingData.address?.country || ''
        }
      } : Prisma.DbNull;
      
      // Prepare billing address - check multiple possible property names
      let billingData = null;
      if (sessionAny.customer_details) {
        billingData = sessionAny.customer_details;
      } else if (session.customer_email) {
        billingData = {
          email: session.customer_email,
          name: ''
        };
      }
      
      const billingAddress = billingData ? {
        name: billingData.name || '',
        email: billingData.email || '',
        address: billingData.address ? {
          line1: billingData.address.line1 || '',
          line2: billingData.address.line2 || '',
          city: billingData.address.city || '',
          state: billingData.address.state || '',
          postalCode: billingData.address.postal_code || '',
          country: billingData.address.country || ''
        } : undefined
      } : Prisma.DbNull;
      
      // Create order in database
      const order = await prisma.order.create({
        data: {
          userId: userId,
          stripeSessionId: session.id,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          subtotal: subtotal,
          total: total,
          tax: tax,
          shipping: 0,
          status: 'PAID',
          trackingStatus: 'ORDER_RECEIVED',
          paymentMethod: 'card',
          items: {
            create: orderItems
          },
          shippingAddress: shippingAddress,
          billingAddress: billingAddress,
          paidAt: new Date(),
          preparingAt: new Date()
        },
        include: {
          items: true
        }
      });
      
      console.log(`Order created successfully: ${order.id}`);
      
      // Clear user's cart
      const userCart = await prisma.cart.findUnique({
        where: { userId: userId },
        include: { items: true }
      });
      
      if (userCart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
        console.log(`Cart cleared for user ${userId}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        orderId: order.id,
        message: 'Order created successfully'
      });
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { 
          error: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  }

  // Handle payment success
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('Payment succeeded:', paymentIntent.id);
  }

  return NextResponse.json({ received: true });
}