// app/api/verify-order/route.ts (FIXED VERSION)
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';

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
      return NextResponse.json({
        success: true,
        message: 'Order found',
        order: existingOrder
      });
    }
    
    // Retrieve session from Stripe WITH ONLY LINE ITEMS EXPANDED
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items.data.price.product'] // Only expand line items
    });
    
    // Type assertion to access shipping and customer_details
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
      shipping: sessionWithDetails.shipping,
      customer_details: sessionWithDetails.customer_details,
      hasShipping: !!sessionWithDetails.shipping,
      hasCustomerDetails: !!sessionWithDetails.customer_details
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
    
    console.log('Available products in database:', allProducts.map(p => ({
      id: p.id,
      stripeId: p.stripeId,
      name: p.name
    })));
    
    // Create order items with VALID product IDs
    const orderItems = lineItems.map((item: any, index: number) => {
      const description = item.description || '';
      console.log(`Processing item ${index + 1}:`, description);
      
      // Try to parse color and size from description
      let name = description;
      let color = null;
      let size = null;
      
      // Format: "Product Name (Color, Size)"
      const match = description.match(/^(.*?)\s*\((.*?),\s*(.*?)\)$/);
      if (match) {
        name = match[1].trim();
        color = match[2].trim();
        size = match[3].trim();
      }
      
      // Get Stripe product ID
      const stripeProductId = item.price?.product?.id;
      console.log('Stripe product ID:', stripeProductId);
      
      // Find matching product in database by stripeId
      let productId = 'unknown';
      
      if (stripeProductId) {
        const matchingProduct = allProducts.find(p => p.stripeId === stripeProductId);
        if (matchingProduct) {
          productId = matchingProduct.id;
          console.log(`Found matching product: ${matchingProduct.name} (${matchingProduct.id})`);
        } else {
          console.warn(`No matching product found for stripeId: ${stripeProductId}`);
          // Use the first product as fallback
          if (allProducts.length > 0) {
            productId = allProducts[0].id;
            console.log(`Using fallback product: ${allProducts[0].name} (${productId})`);
          }
        }
      } else {
        console.warn('No stripeProductId found in item');
        // Use the first product as fallback
        if (allProducts.length > 0) {
          productId = allProducts[0].id;
        }
      }
      
      return {
        productId: productId,
        name: name,
        price: item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        quantity: item.quantity || 1,
        image: item.price?.product?.images?.[0] || null,
        color: color,
        size: size
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
    
    // Prepare shipping address (available directly on session object)
    const shippingDetails = sessionWithDetails.shipping;
    console.log('Shipping details:', shippingDetails);
    
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
    
    // Prepare billing address (available directly on session object)
    const customerDetails = sessionWithDetails.customer_details;
    console.log('Customer details:', customerDetails);
    
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
    
    console.log('Order created successfully:', newOrder.id);
    
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
    
    // More specific error handling
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Database constraint error. Product not found.',
          details: 'Make sure products exist in your database and match Stripe product IDs.',
          code: error.code,
          suggestion: 'Check that your products table has records with stripeId matching Stripe product IDs.'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to verify order',
        code: error.code
      },
      { status: 500 }
    );
  }
}