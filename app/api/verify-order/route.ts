// app/api/verify-order/route.ts - COMPLETE WITH BACKUP LOGS

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { createInvoiceAfterOrder } from '@/lib/invoice';

export async function POST(request: Request) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔵 VERIFY-ORDER API CALLED (Backup/Safety Net)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    const body = await request.json();
    const { sessionId } = body;
    
    console.log(`📋 Session ID received: ${sessionId}`);
    
    if (!sessionId) {
      console.error('❌ No session ID provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Get user from cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      console.error('❌ User not authenticated');
      return NextResponse.json(
        { error: 'Not authenticated. Please login again.' },
        { status: 401 }
      );
    }
    
    const user = JSON.parse(userCookie);
    console.log(`👤 User ID: ${user.id}`);
    console.log(`👤 User Email: ${user.email}`);
    
    // ──────────────────────────────────────────────────────────────
    // CHECK IF ORDER ALREADY EXISTS (Webhook may have already created it)
    // ──────────────────────────────────────────────────────────────
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: true }
    });
    
    if (existingOrder) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅✅✅ ORDER ALREADY EXISTS (Created by Webhook) ✅✅✅`);
      console.log(`   Order ID: ${existingOrder.id}`);
      console.log(`   Order Number: ${existingOrder.orderNumber}`);
      console.log(`   Has Invoice: ${existingOrder.invoiceId ? 'YES' : 'NO'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // 🔵 Backup: If webhook succeeded but invoice creation failed
      if (!existingOrder.invoiceId) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔵 BACKUP TRIGGERED: Order exists but NO invoice found');
        console.log('🔵 Creating invoice as backup...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        await createInvoiceForOrder(existingOrder, user);
      } else {
        console.log('✅ Invoice already exists - backup not needed');
      }
      
      return NextResponse.json({
        success: true,
        message: 'Order found (webhook already processed)',
        order: existingOrder,
        source: 'webhook_already_processed'
      });
    }
    
    // ──────────────────────────────────────────────────────────────
    // NO ORDER EXISTS - Webhook must have failed.
    // Verify-order acts as backup to create order and invoice.
    // ──────────────────────────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️ NO ORDER FOUND - Webhook likely failed');
    console.log('🔵 VERIFY-ORDER ACTING AS PRIMARY BACKUP');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Retrieve session from Stripe
    console.log(`🔍 Retrieving session from Stripe: ${sessionId}`);
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
    
    console.log(`📋 Session retrieved:`);
    console.log(`   ID: ${session.id}`);
    console.log(`   Payment status: ${session.payment_status}`);
    console.log(`   Amount total: ${session.amount_total}`);
    
    if (session.payment_status !== 'paid') {
      console.error(`❌ Payment not completed - status: ${session.payment_status}`);
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }
    
    // Get line items
    const lineItems = session.line_items?.data || [];
    console.log(`📦 Line items: ${lineItems.length}`);
    
    // Get ALL products from database to find matching ones
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        stripeId: true,
        name: true
      }
    });
    
    console.log(`📦 Products in database: ${allProducts.length}`);
    
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
      };
    });
    
    // Log order items
    orderItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} x${item.quantity} - $${item.price} (Product ID: ${item.productId})`);
    });
    
    // Check if any order items have invalid productId
    const invalidItems = orderItems.filter(item => item.productId === 'unknown');
    if (invalidItems.length > 0 && allProducts.length === 0) {
      console.error('❌ No products in database to link order items to');
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
    
    console.log(`💰 Totals: subtotal=$${subtotal}, total=$${total}, tax=$${tax}`);
    
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
    
    // Create order in database (BACKUP CREATION)
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
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅✅✅ ORDER CREATED VIA VERIFY-ORDER (BACKUP) ✅✅✅`);
    console.log(`   Order ID: ${newOrder.id}`);
    console.log(`   Order Number: ${orderNumber}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Total: $${total}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 🔥 STOCK UPDATE SECTION (BACKUP) 🔥
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 STARTING STOCK UPDATE (VERIFY-ORDER BACKUP)');
    
    for (const item of orderItems) {
      console.log(`   Processing: ${item.name} x${item.quantity}`);
      
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
            console.log(`      📉 Stock: ${variant.stock} → ${variant.stock - item.quantity}`);
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: { stock: { decrement: item.quantity } }
            });
            
            // Update product's total stock
            const allVariants = await prisma.productVariant.findMany({
              where: { productId: item.productId, isActive: true }
            });
            const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);
            
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: totalStock }
            });
            console.log(`      ✅ Stock updated`);
          } else {
            console.warn(`      ⚠️ Variant not found`);
          }
        } catch (stockError: any) {
          console.error(`      ❌ Error updating stock:`, stockError.message);
        }
      }
    }
    
    console.log('✅ STOCK UPDATE COMPLETED (VERIFY-ORDER BACKUP)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Create invoice (BACKUP)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 CREATING INVOICE (VERIFY-ORDER BACKUP)');
    await createInvoiceForOrder(newOrder, user);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Clear user's cart
    try {
      const userCart = await prisma.cart.findUnique({
        where: { userId: user.id }
      });
      
      if (userCart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
        console.log(`🗑️ Cart cleared for user: ${user.id}`);
      }
    } catch (cartError) {
      console.log('⚠️ Error clearing cart (non-fatal):', cartError);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 VERIFY-ORDER (BACKUP) PROCESSING COMPLETE 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return NextResponse.json({
      success: true,
      message: 'Order created successfully (webhook backup)',
      order: newOrder,
      source: 'verify_order_backup'
    });
    
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR IN VERIFY-ORDER ❌');
    console.error(`   Error: ${error.message}`);
    if (error.stack) console.error(`   Stack: ${error.stack}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify order',
        code: error.code
      },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────
// BACKUP INVOICE CREATION FUNCTION (Same as before)
// ──────────────────────────────────────────────────────────────
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
      console.log(`   URL: ${invoiceResult.pdfUrl}`);
    } else {
      console.error(`❌❌❌ INVOICE FAILED: ${invoiceResult.error}`);
    }
  } catch (error) {
    console.error('❌❌❌ INVOICE ERROR:', error);
  }
}