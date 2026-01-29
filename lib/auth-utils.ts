// lib/auth-utils.ts
import bcrypt from 'bcryptjs'

export class AuthUtils {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
  }
  
  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }
  
  // Validate password format (client-side validation)
  static validatePasswordFormat(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' }
    }
    
    if (password.length > 20) {
      return { valid: false, message: 'Password must be at most 20 characters' }
    }
    
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*]/.test(password)
    
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least 1 number' }
    }
    
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least 1 special character (!@#$%^&*)' }
    }
    
    return { valid: true }
  }
  
  // Validate email format
  static validateEmailFormat(email: string): { valid: boolean; message?: string } {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' }
    }
    return { valid: true }
  }
}