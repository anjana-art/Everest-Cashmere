// lib/order-service.ts - FIXED VERSION
import { prisma } from './prisma'

// Define OrderStatus enum values from your schema
type OrderStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export class OrderService {
  // Create order from cart
  static async createOrder(
    userId: string, 
    shippingAddress: any, 
    billingAddress?: any
  ) {
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
          subtotal,          // Required field
          total,            // Required field
          tax,              // Required field (default 0)
          shipping,         // Required field (default 0)
          discount: 0,      // Required field (default 0)
          status: 'PROCESSING', // Must be uppercase enum value
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
  static async updateOrderStatus(orderId: string, status: OrderStatus) { // Use OrderStatus type
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })
    
    return order
  }
  
  // Mark order as paid (Stripe webhook)
  static async markAsPaid(orderId: string, stripeSessionId: string, stripePaymentIntentId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID', // Use uppercase enum value
        stripeSessionId,
        stripePaymentIntentId,
        paidAt: new Date()
      }
    })
    
    return order
  }
}