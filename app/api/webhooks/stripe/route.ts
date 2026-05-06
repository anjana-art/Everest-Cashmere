// app/api/webhooks/stripe/route.ts - MINIMAL VERSION (just acknowledges)

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('=== WEBHOOK RECEIVED ===');
  
  // Get raw body as text (required for signature verification)
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log(`✅ Event verified: ${event.type}`);
  } catch (err: any) {
    console.error(`❌ Webhook signature failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // For checkout.session.completed, just log and let verify-order handle it
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    console.log(`🛒 Checkout completed: ${session.id}`);
    console.log(`   Will be processed by verify-order`);
    // No order creation here - verify-order will handle it
    return NextResponse.json({ received: true, handler: 'verify-order' });
  }

  // All other events - just acknowledge
  console.log(`📌 ${event.type} - acknowledged`);
  return NextResponse.json({ received: true });
}