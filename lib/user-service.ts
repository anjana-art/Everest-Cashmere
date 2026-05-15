// lib/user-service.ts - ADD BLOCKED USER CHECK
import { Prisma } from '@prisma/client'
import { AuthUtils } from './auth-utils'
import { prisma } from './prisma'
import crypto from 'crypto';

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
    
    // Create user with cart (default isAdmin: false, isBlocked: false)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin: false,
        isBlocked: false, // ✅ Add this
        cart: {
          create: {}
        },
        wishlist: {
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
  
  // Login user - ✅ ADDED BLOCKED USER CHECK
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
    
    // ✅ CHECK IF USER IS BLOCKED
    if (user.isBlocked) {
      // Check if block is expired (24 hours)
      if (user.blockedAt && Date.now() - new Date(user.blockedAt).getTime() > 24 * 60 * 60 * 1000) {
        // Auto unblock after 24 hours
        await prisma.user.update({
          where: { id: user.id },
          data: { isBlocked: false, blockedAt: null }
        });
      } else {
        throw new Error('Account is temporarily blocked. Please contact support.');
      }
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
  
  // ✅ NEW METHOD: Block a user (admin only)
  static async blockUser(userId: string, reason?: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedAt: new Date(),
        blockReason: reason || 'Suspicious activity detected'
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBlocked: true,
        blockedAt: true,
        blockReason: true
      }
    })
    
    // Log the block action
    console.log(`🔒 User blocked: ${user.email} - Reason: ${user.blockReason}`);
    
    return user
  }
  
  // ✅ NEW METHOD: Unblock a user (admin only)
  static async unblockUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockedAt: null,
        blockReason: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBlocked: true
      }
    })
    
    console.log(`🔓 User unblocked: ${user.email}`);
    return user
  }
  
  // Get user profile (with block status)
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
  
  // ============ PASSWORD RESET METHODS ============
  
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: true };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 3600000);

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExp,
      },
    });

    try {
      const { EmailService } = await import('./email-service');
      await EmailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      console.error('Failed to send email:', error);
      if (process.env.NODE_ENV === 'development') {
        console.log('RESET TOKEN (dev only):', resetToken);
      }
    }

    return { success: true };
  }

  static async validateResetToken(token: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    });

    return user;
  }

  static async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const passwordValidation = AuthUtils.validatePasswordFormat(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    const hashedPassword = await AuthUtils.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return { success: true };
  }
  
  // ============ ADMIN FUNCTIONS ============
  
  static async makeAdmin(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true
      }
    })
    
    return user
  }
  
  static async removeAdmin(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: false },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isBlocked: true,
        createdAt: true
      }
    })
    
    return user
  }
  
  static async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isBlocked: true,
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
  
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isBlocked: true,
        blockedAt: true,
        blockReason: true,
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
  
  static async deleteUser(userId: string) {
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
    
    if (user.orders.length > 0) {
      throw new Error('Cannot delete user with pending orders')
    }
    
    await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { cart: { userId } }
      }),
      prisma.cart.deleteMany({
        where: { userId }
      }),
      prisma.wishlistItem.deleteMany({
        where: { wishlist: { userId } }
      }),
      prisma.wishlist.deleteMany({
        where: { userId }
      }),
      prisma.address.deleteMany({
        where: { userId }
      }),
      prisma.userProfile.deleteMany({
        where: { userId }
      }),
      prisma.user.delete({
        where: { id: userId }
      })
    ])
    
    return { success: true, message: 'User deleted successfully' }
  }
  
  static async checkIsAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    })
    
    return user?.isAdmin || false
  }
  
  static async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit
    
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
          isBlocked: true,
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