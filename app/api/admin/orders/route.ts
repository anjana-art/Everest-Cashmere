// app/api/admin/orders/route.ts - ADD NIF ONLY
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log('=== ADMIN ORDERS API CALLED ===');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    let where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber || `ORD-${order.id.substring(0, 8).toUpperCase()}`,
      customer: {
        id: order.user.id,
        name: order.user.name || order.user.email,
        email: order.user.email,
      },
      nif: order.nif || null,  // ✅ ONLY ADDED THIS LINE
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shipping: Number(order.shipping),
      status: order.status,
      trackingStatus: order.trackingStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      itemsCount: order.items.length,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.image || item.product?.images?.[0] || '/placeholder-image.jpg',
        color: item.color,
        size: item.size,
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, trackingStatus, trackingNumber, carrier } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (trackingStatus) updateData.trackingStatus = trackingStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    
    if (status === 'PAID' && !updateData.paidAt) updateData.paidAt = new Date();
    if (status === 'PROCESSING' && !updateData.preparingAt) updateData.preparingAt = new Date();
    if (status === 'SHIPPED' && !updateData.shippedAt) updateData.shippedAt = new Date();
    if (status === 'DELIVERED' && !updateData.deliveredAt) updateData.deliveredAt = new Date();
    if (status === 'CANCELLED' && !updateData.cancelledAt) updateData.cancelledAt = new Date();

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}