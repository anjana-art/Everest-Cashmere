// app/api/test-stripe/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Create a test session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Test Product' },
          unit_amount: 1000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:3001/success',
      cancel_url: 'http://localhost:3001/cancel',
    });
    
    return NextResponse.json({ 
      success: true, 
      url: session.url,
      message: 'Stripe is working!'
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}