// app/api/verify-order/route.ts - CORRECTED VERSION (no 'description' field)

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { createInvoiceAfterOrder } from '@/lib/invoice';

export async function POST(request: Request) {
  console.log('=== VERIFY ORDER API CALLED ===');
  
  try {
    const body = await request.json();
    const { sessionId } = body;
    
    console.log('Session ID received:', sessionId);
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get user from cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      return NextResponse.json(
        { error: 'Not authenticated. Please login again.' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie);
    console.log('User ID:', user.id);
    
    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: true }
    });
    
    if (existingOrder) {
      console.log('Order already exists:', existingOrder.id);
      
      if (!existingOrder.invoiceId) {
        console.log('🔵 Order exists but no invoice found. Creating invoice...');
        await createInvoiceForOrder(existingOrder, user);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Order found',
        order: existingOrder
      });
    }
    
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product']
    });
    
    const sessionWithDetails = session as Stripe.Checkout.Session & {
      shipping?: {
        address?: Stripe.Address;
        name?: string;
      };
      customer_details?: Stripe.Checkout.Session.CustomerDetails;
    };
    
    console.log('Session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
    });
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
    
    // Get line items
    const lineItems = session.line_items?.data || [];
    console.log('Number of line items:', lineItems.length);
    
    // Get ALL products from database to find matching ones
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        stripeId: true,
        name: true
      }
    });
    
    // Create order items - NO 'description' field
    const orderItems = lineItems.map((item: any) => {
      const description = item.description || '';
      
      let name = description;
      let color = null;
      let size = null;
      
      const match = description.match(/^(.*?)\s*\((.*?),\s*(.*?)\)$/);
      if (match) {
        name = match[1].trim();
        color = match[2].trim();
        size = match[3].trim();
      }
      
      const stripeProductId = item.price?.product?.id;
      let productId = 'unknown';
      
      if (stripeProductId) {
        const matchingProduct = allProducts.find(p => p.stripeId === stripeProductId);
        if (matchingProduct) {
          productId = matchingProduct.id;
        }
      }
      
      return {
        productId: productId,
        name: name,
        price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        quantity: item.quantity || 1,
        image: item.price?.product?.images?.[0] || null,
        color: color,
        size: size,
        // NO description field here!
      };
    });
    
    // Check if any order items have invalid productId
    const invalidItems = orderItems.filter(item => item.productId === 'unknown');
    if (invalidItems.length > 0 && allProducts.length === 0) {
      console.error('No products in database to link order items to');
      return NextResponse.json(
        { 
          error: 'No products found in database. Please add products first.',
          details: 'Create products in your database before processing orders.'
        },
        { status: 400 }
      );
    }
    
    // Calculate totals
    const subtotal = session.amount_subtotal ? session.amount_subtotal / 100 : 0;
    const total = session.amount_total ? session.amount_total / 100 : 0;
    const tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0;
    
    console.log('Creating order with totals:', { subtotal, total, tax });
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Prepare shipping address
    const shippingDetails = sessionWithDetails.shipping;
    const shippingAddress = shippingDetails 
      ? JSON.stringify({
          name: shippingDetails.name || '',
          address: {
            line1: shippingDetails.address?.line1 || '',
            line2: shippingDetails.address?.line2 || '',
            city: shippingDetails.address?.city || '',
            state: shippingDetails.address?.state || '',
            postalCode: shippingDetails.address?.postal_code || '',
            country: shippingDetails.address?.country || ''
          }
        })
      : Prisma.DbNull;
    
    // Prepare billing address
    const customerDetails = sessionWithDetails.customer_details;
    const billingAddress = customerDetails
      ? JSON.stringify({
          name: customerDetails.name || '',
          email: customerDetails.email || '',
          address: customerDetails.address ? {
            line1: customerDetails.address.line1 || '',
            line2: customerDetails.address.line2 || '',
            city: customerDetails.address.city || '',
            state: customerDetails.address.state || '',
            postalCode: customerDetails.address.postal_code || '',
            country: customerDetails.address.country || ''
          } : {}
        })
      : Prisma.DbNull;
    
    // Create order in database
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        stripeSessionId: sessionId,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
        orderNumber: orderNumber,
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
    
    console.log('✅ Order created successfully:', newOrder.id);
    
    // 🔥 STOCK UPDATE SECTION 🔥
    console.log('\n📦 === STARTING STOCK UPDATE ===\n');
    
    for (const item of orderItems) {
      console.log(`🔍 Processing item: ${item.name}`);
      console.log(`   Product ID: ${item.productId}`);
      console.log(`   Color: ${item.color}`);
      console.log(`   Size: ${item.size}`);
      console.log(`   Quantity: ${item.quantity}`);
      
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
            console.log(`   📉 Current stock before update: ${variant.stock}`);
            
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
          }
        } catch (stockError: any) {
          console.error(`   ❌ Error updating stock:`, stockError.message);
        }
      }
    }
    
    console.log('\n✅ === STOCK UPDATE COMPLETED ===\n');
    
    // Create invoice
    console.log('🔵🔵🔵 STARTING INVOICE CREATION 🔵🔵🔵');
    await createInvoiceForOrder(newOrder, user);
    console.log('🔵🔵🔵 INVOICE CREATION COMPLETE 🔵🔵🔵');
    
    // Clear user's cart
    try {
      const userCart = await prisma.cart.findUnique({
        where: { userId: user.id }
      });
      
      if (userCart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
        console.log('Cart cleared for user:', user.id);
      }
    } catch (cartError) {
      console.log('Error clearing cart:', cartError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
    
  } catch (error: any) {
    console.error('Error in verify-order:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify order',
        code: error.code
      },
      { status: 500 }
    );
  }
}

async function createInvoiceForOrder(order: any, user: any) {
  console.log('🔵 createInvoiceForOrder called for order:', order.orderNumber);
  
  try {
    let shippingAddress = null;
    if (order.shippingAddress && typeof order.shippingAddress === 'string') {
      try {
        shippingAddress = JSON.parse(order.shippingAddress);
      } catch (e) {
        console.log('Could not parse shipping address');
      }
    }
    
    const invoiceResult = await createInvoiceAfterOrder({
      client: {
        name: user?.name || shippingAddress?.name || 'Customer',
        email: user?.email || '',
        nif: user?.nif || undefined,
        address: shippingAddress?.address?.line1,
        city: shippingAddress?.address?.city,
        postal_code: shippingAddress?.address?.postalCode,
      },
      items: order.items.map((item: any) => ({
        name: item.name,
        description: item.name,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      orderId: order.orderNumber,
    });
    
    console.log('🔵 Invoice result:', invoiceResult);
    
    if (invoiceResult.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          invoiceId: invoiceResult.invoiceId?.toString(),
          invoiceNumber: invoiceResult.invoiceNumber,
          invoiceUrl: invoiceResult.pdfUrl,
        }
      });
      console.log(`✅✅✅ INVOICE CREATED! Number: ${invoiceResult.invoiceNumber}`);
    } else {
      console.error(`❌❌❌ INVOICE FAILED: ${invoiceResult.error}`);
    }
  } catch (error) {
    console.error('❌❌❌ INVOICE ERROR:', error);
  }
}