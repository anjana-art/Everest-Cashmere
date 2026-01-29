// app/api/orders/route.ts - UPDATED VERSION
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  console.log('=== ORDERS API CALLED ===');
  
  try {
    // Get user ID from headers
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      console.log('No x-user-id header found');
      return NextResponse.json(
        { 
          success: false,
          error: 'User ID required' 
        },
        { status: 401 }
      );
    }
    
    console.log('Fetching orders for user:', userId);
    
    // Fetch orders with items and product images
    const orders = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      status: order.status,
      trackingStatus: order.trackingStatus,
      paymentStatus: 'paid',
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      preparingAt: order.preparingAt?.toISOString(),
      shippedAt: order.shippedAt?.toISOString(),
      deliveredAt: order.deliveredAt?.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image || item.product?.images?.[0] || '/placeholder-image.jpg',
        color: item.color,
        size: item.size,
        total: Number(item.price) * item.quantity,
        productId: item.productId
      }))
    }));
    
    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });
    
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}