// lib/order-service.ts
import { prisma } from './prisma'
import { CartService } from './cart-service'

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
    
    // Calculate total
    const total = cart.items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity)
    }, 0)
    
    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: {
          userId,
          total,
          shippingAddress: shippingAddress,
          billingAddress: billingAddress || shippingAddress,
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
  static async updateOrderStatus(orderId: string, status: string) {
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
        status: 'PAID',
        stripeSessionId,
        stripePaymentIntentId,
        paidAt: new Date()
      }
    })
    
    return order
  }
}