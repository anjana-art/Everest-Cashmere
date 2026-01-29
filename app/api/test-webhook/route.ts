// app/api/test-webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ? 'Configured' : 'Not configured';
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get latest orders count
    const ordersCount = await prisma.order.count();
    
    return NextResponse.json({
      stripe: {
        secretKey: stripeKey,
        webhookSecret: webhookSecret,
        status: 'OK'
      },
      database: {
        connection: 'OK',
        ordersCount: ordersCount
      },
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/stripe`
    });
    
  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: 'Check your Stripe and database configuration'
      },
      { status: 500 }
    );
  }
}