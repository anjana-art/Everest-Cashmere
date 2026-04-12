// lib/order-service.ts - WITH INVOICE INTEGRATION (FIXED SHIPPING JSON)
import { prisma } from './prisma'
import { createInvoiceAfterOrder } from './invoice'

// Define OrderStatus enum values from your schema
type OrderStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

// Define address type for JSON parsing
interface AddressData {
  street?: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  postal_code?: string;
  country?: string;
  name?: string;
  fullName?: string;
  phone?: string;
  email?: string;
}

// Helper function to safely get address fields from JSON
function getAddressField(address: any, field: keyof AddressData): string {
  if (!address || typeof address !== 'object') return '';
  const addr = address as AddressData;
  return addr[field] || '';
}

// Helper function to get full address line
function getFullAddress(address: any): string {
  if (!address || typeof address !== 'object') return '';
  const addr = address as AddressData;
  return addr.addressLine1 || addr.street || addr.address || '';
}

export class OrderService {
  // Create order from cart
  static async createOrder(
    userId: string, 
    shippingAddress: any, 
    billingAddress?: any
  ) {
    console.log('🔵 createOrder called for user:', userId);
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true
      }
    })
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty')
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity)
    }, 0)
    
    // Add shipping and tax (you can customize these)
    const shipping = 0 // Free shipping for now
    const tax = subtotal * 0.1 // 10% tax rate
    const total = subtotal + shipping + tax
    
    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order with all required fields from your schema
      const order = await tx.order.create({
        data: {
          userId,
          subtotal,
          total,
          tax,
          shipping,
          discount: 0,
          status: 'PROCESSING',
          orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          shippingAddress: shippingAddress || null,
          billingAddress: billingAddress || shippingAddress || null,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image || null
            }))
          }
        },
        include: {
          items: true
        }
      })
      
      // 2. Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
      
      return order
    })
    
    console.log('🔵 Order created:', order.orderNumber);
    
    // 3. Create invoice after order is created
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, nif: true }
      })
      
      const invoiceResult = await createInvoiceAfterOrder({
        client: {
          name: user?.name || getAddressField(shippingAddress, 'name') || getAddressField(shippingAddress, 'fullName') || 'Customer',
          email: user?.email || getAddressField(shippingAddress, 'email') || '',
          nif: user?.nif || undefined,
          address: getFullAddress(shippingAddress),
          city: getAddressField(shippingAddress, 'city'),
          postal_code: getAddressField(shippingAddress, 'postalCode') || getAddressField(shippingAddress, 'postal_code'),
        },
        items: cart.items.map(item => ({
          name: item.name,
          description: item.name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        orderId: order.orderNumber,
      })
      
      if (invoiceResult.success) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            invoiceId: invoiceResult.invoiceId,
            invoiceNumber: invoiceResult.invoiceNumber,
          }
        })
        console.log(`✅ Invoice created for order ${order.orderNumber}: ${invoiceResult.invoiceNumber}`)
      } else {
        console.error(`❌ Invoice failed for order ${order.orderNumber}:`, invoiceResult.error)
      }
    } catch (invoiceError) {
      console.error('❌ Invoice creation error in createOrder:', invoiceError)
    }
    
    return order
  }
  
  // Get user's orders
  static async getUserOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return orders
  }
  
  // Get order details
  static async getOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId
      },
      include: {
        items: true
      }
    })
    
    return order
  }
  
  // Update order status (for admin/webhook)
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
    
    return order
  }
  
  // Mark order as paid (Stripe webhook) - FULLY UPDATED WITH FIXED JSON HANDLING
  static async markAsPaid(orderId: string, stripeSessionId: string, stripePaymentIntentId: string) {
    console.log('🔵 [markAsPaid] Called for order ID:', orderId);
    
    // Update order AND include items and user in the returned data
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        stripeSessionId,
        stripePaymentIntentId,
        paidAt: new Date()
      },
      include: {
        items: true,  // ✅ CRITICAL: Include order items
        user: true    // ✅ CRITICAL: Include user details
      }
    });
    
    console.log('🔵 [markAsPaid] Order updated to PAID');
    console.log('🔵 [markAsPaid] Order number:', order.orderNumber);
    console.log('🔵 [markAsPaid] User email:', order.user?.email);
    console.log('🔵 [markAsPaid] Items count:', order.items?.length);
    
    // Check if invoice already exists
    if (order.invoiceId) {
      console.log(`⚠️ Invoice already exists for order ${order.orderNumber}: ${order.invoiceNumber}`);
      return order;
    }
    
    // Create invoice after payment is confirmed
    try {
      console.log('🔵 [markAsPaid] Creating invoice...');
      
      // Safely parse shipping address from JSON
      const shippingAddress = order.shippingAddress as AddressData | null;
      const billingAddress = order.billingAddress as AddressData | null;
      
      const invoiceResult = await createInvoiceAfterOrder({
        client: {
          name: order.user?.name || getAddressField(shippingAddress, 'name') || getAddressField(shippingAddress, 'fullName') || 'Customer',
          email: order.user?.email || getAddressField(shippingAddress, 'email') || '',
          nif: order.user?.nif || undefined,
          address: getFullAddress(shippingAddress),
          city: getAddressField(shippingAddress, 'city'),
          postal_code: getAddressField(shippingAddress, 'postalCode') || getAddressField(shippingAddress, 'postal_code'),
        },
        items: order.items.map(item => ({
          name: item.name,
          description: item.name,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        orderId: order.orderNumber,
      });
      
      console.log('🔵 [markAsPaid] Invoice result:', JSON.stringify(invoiceResult, null, 2));
      
      if (invoiceResult.success) {
        // Save invoice ID and number to order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            invoiceId: invoiceResult.invoiceId,
            invoiceNumber: invoiceResult.invoiceNumber,
            invoiceUrl: invoiceResult.pdfUrl,
          }
        });
        console.log(`✅ [markAsPaid] Invoice created for order ${order.orderNumber}: ${invoiceResult.invoiceNumber}`);
        console.log(`✅ [markAsPaid] Invoice ID: ${invoiceResult.invoiceId}`);
        console.log(`✅ [markAsPaid] PDF URL: ${invoiceResult.pdfUrl}`);
      } else {
        console.error(`❌ [markAsPaid] Invoice failed for order ${order.orderNumber}:`, invoiceResult.error);
      }
    } catch (error) {
      console.error('❌ [markAsPaid] Invoice creation error:', error);
    }
    
    return order;
  }
}