// lib/cart-service.ts
import {prisma} from './prisma';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  imageUrl?: string | null;
}

export class CartService {
  // Get user's cart
  static async getCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true
      }
    })
    
    // Create cart if doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: true
        }
      })
    }
    
    return cart
  }
  
  // Add item to cart (updated to handle color/size)
  static async addToCart(
    userId: string, 
    productId: string, 
    name: string, 
    price: number, 
    quantity: number = 1,
    color: string = "default",
    size: string = "default",
    image?: string
  ) {
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    })
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      })
    }
    
    // Check if item already in cart with same color and size
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        color,
        size
      }
    })
    
    if (existingItem) {
      // Update quantity
      const item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        }
      })
      
      return item
    } else {
      // Add new item
      const item = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          name,
          price,
          image,
          quantity,
          color,
          size
        }
      })
      
      return item
    }
  }
  
  // Merge client cart with server cart
  static async mergeCarts(userId: string, clientItems: CartItem[]) {
    // Get server cart items
    const serverCart = await this.getCart(userId);
    const serverItems = serverCart.items.map(item => ({
      id: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      color: item.color || "default",
      size: item.size || "default",
      imageUrl: item.image || null
    }));

    // Merge logic
    const mergedMap = new Map();
    
    // Add server items to map
    serverItems.forEach(item => {
      const key = `${item.id}-${item.color}-${item.size}`;
      mergedMap.set(key, { ...item });
    });
    
    // Merge with client items
    clientItems.forEach(clientItem => {
      const key = `${clientItem.id}-${clientItem.color}-${clientItem.size}`;
      const existingItem = mergedMap.get(key);
      
      if (existingItem) {
        // Update quantity
        mergedMap.set(key, {
          ...existingItem,
          quantity: existingItem.quantity + clientItem.quantity
        });
      } else {
        // Add new item
        mergedMap.set(key, { ...clientItem });
      }
    });
    
    const mergedItems = Array.from(mergedMap.values());
    
    // Clear current cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: serverCart.id }
    });
    
    // Add merged items back
    if (mergedItems.length > 0) {
      await prisma.cartItem.createMany({
        data: mergedItems.map(item => ({
          cartId: serverCart.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          image: item.imageUrl || null
        }))
      });
    }
    
    return mergedItems;
  }
  
  // Get cart items for user
  static async getCartItems(userId: string): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    
    return cart.items.map(item => ({
      id: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
      color: item.color || "default",
      size: item.size || "default",
      imageUrl: item.image || null
    }));
  }
  
  // Update cart item quantity
  static async updateCartItem(itemId: string, quantity: number) {
    if (quantity < 1) {
      // Remove item if quantity is 0
      await prisma.cartItem.delete({
        where: { id: itemId }
      })
      return null
    }
    
    const item = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    })
    
    return item
  }
  
  // Remove item from cart
  static async removeFromCart(itemId: string) {
    await prisma.cartItem.delete({
      where: { id: itemId }
    })
    
    return { success: true }
  }
  
  // Clear cart
  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId }
    })
    
    if (!cart) return { success: false, message: 'Cart not found' }
    
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
    
    return { success: true }
  }
  
  // Get cart total
  static async getCartTotal(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: true
      }
    })
    
    if (!cart || cart.items.length === 0) {
      return 0
    }
    
    const total = cart.items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity)
    }, 0)
    
    return total
  }
}