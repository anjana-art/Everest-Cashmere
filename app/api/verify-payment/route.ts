// app/api/verify-payment/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie);

    // Check if order already exists
    let order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: true }
    });

    // If order doesn't exist, create it
    if (!order) {
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      
      order = await prisma.order.create({
        data: {
          userId: user.id,
          stripeSessionId: sessionId,
          amountTotal: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'eur',
          status: 'processing',
          paymentStatus: 'paid',
          customerEmail: session.customer_email || session.customer_details?.email,
          items: {
            create: lineItems.data.map((item: any) => ({
              productId: item.price?.product?.metadata?.productId || 'unknown',
              stripePriceId: item.price?.id || '',
              name: item.description || 'Unknown Product',
              price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
              quantity: item.quantity || 1,
            }))
          }
        },
        include: { items: true }
      });
      
      // Clear user's cart
      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            userId: user.id
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      sessionStatus: session.payment_status,
      orderStatus: order.status
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}