// app/api/test-admin-email/route.ts
import { NextResponse } from 'next/server';
import { sendAdminOrderNotification } from '@/lib/admin-email';

export async function GET() {
  console.log('🧪 TESTING ADMIN EMAIL');
  
  try {
    await sendAdminOrderNotification({
      orderId: 'test-123',
      orderNumber: 'TEST-ORDER-001',
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      total: 99.99,
      itemsCount: 2,
      items: [
        { 
          name: 'Cashmere Sweater', 
          quantity: 1, 
          price: 79.99, 
          color: 'black', 
          size: 'm' 
        },
        { 
          name: 'Wool Scarf', 
          quantity: 1, 
          price: 20.00, 
          color: 'cream' 
        },
      ],
      status: 'PAID',
      createdAt: new Date(),
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent! Check your inbox.' 
    });
    
  } catch (error: any) {
    console.error('Test email failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}