// lib/user-service.ts - FIXED VERSION
import { Prisma } from '@prisma/client'
import { AuthUtils } from './auth-utils'
import { prisma } from './prisma'

export class UserService {
  // Signup new user
  static async signup(email: string, password: string, name?: string) {
    // Validate email
    const emailValidation = AuthUtils.validateEmailFormat(email)
    if (!emailValidation.valid) {
      throw new Error(emailValidation.message)
    }
    
    // Validate password
    const passwordValidation = AuthUtils.validatePasswordFormat(password)
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message)
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    
    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(password)
    
    // Create user with cart (default isAdmin: false)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin: false, // Explicitly set to false
        cart: {
          create: {} // Create empty cart
        },
        wishlist: { // Also create empty wishlist
          create: {}
        }
      },
      include: {
        cart: true,
        wishlist: true
      }
    })
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  
  // Login user
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        cart: true,
        wishlist: true
      }
    })
    
    if (!user) {
      throw new Error('Invalid email or password')
    }
    
    // Verify password
    const isValidPassword = await AuthUtils.verifyPassword(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  
  // Get user profile
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        cart: {
          include: {
            items: true
          }
        },
        wishlist: {
          include: {
            items: true
          }
        }
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Remove password
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  
  // Update user profile
  static async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const emailValidation = AuthUtils.validateEmailFormat(data.email)
      if (!emailValidation.valid) {
        throw new Error(emailValidation.message)
      }
      
      // Check if email already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId }
        }
      })
      
      if (existingUser) {
        throw new Error('Email already taken by another user')
      }
    }
    
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        cart: true,
        wishlist: true
      }
    })
    
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  
  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Verify current password
    const isValid = await AuthUtils.verifyPassword(currentPassword, user.password)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }
    
    // Validate new password
    const passwordValidation = AuthUtils.validatePasswordFormat(newPassword)
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message)
    }
    
    // Hash new password
    const hashedPassword = await AuthUtils.hashPassword(newPassword)
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    
    return { success: true }
  }
  
  // ADMIN FUNCTIONS
  
  // Make user admin
  static async makeAdmin(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true
      }
    })
    
    return user
  }
  
  // Remove admin privileges
  static async removeAdmin(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: false },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true
      }
    })
    
    return user
  }
  
  // Get all users (admin only)
  static async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return users
  }
  
  // Get user by ID (admin only)
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        orders: {
          include: {
            items: true
          },
          orderBy: { createdAt: 'desc' }
        },
        cart: {
          include: {
            items: true
          }
        },
        wishlist: {
          include: {
            items: true
          }
        }
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return user
  }
  
  // Delete user (admin only - with cleanup)
  static async deleteUser(userId: string) {
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          where: {
            status: {
              not: 'DELIVERED'
            }
          }
        }
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Check if user has pending orders
    if (user.orders.length > 0) {
      throw new Error('Cannot delete user with pending orders')
    }
    
    // Delete user and associated data
    await prisma.$transaction([
      // Delete user's cart items
      prisma.cartItem.deleteMany({
        where: { cart: { userId } }
      }),
      // Delete user's cart
      prisma.cart.deleteMany({
        where: { userId }
      }),
      // Delete user's wishlist items
      prisma.wishlistItem.deleteMany({
        where: { wishlist: { userId } }
      }),
      // Delete user's wishlist
      prisma.wishlist.deleteMany({
        where: { userId }
      }),
      // Delete user's addresses
      prisma.address.deleteMany({
        where: { userId }
      }),
      // Delete user's profile
      prisma.userProfile.deleteMany({
        where: { userId }
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ])
    
    return { success: true, message: 'User deleted successfully' }
  }
  
  // Check if user is admin
  static async checkIsAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })
    
    return user?.isAdmin || false
  }
  
  // Search users (admin only) - FIXED VERSION
  static async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    
    // FIXED: Use Prisma.QueryMode type for mode property
    const where = {
      OR: [
        { email: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
        { name: { contains: query, mode: 'insensitive' as Prisma.QueryMode } }
      ]
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          createdAt: true,
          _count: {
            select: {
              orders: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}