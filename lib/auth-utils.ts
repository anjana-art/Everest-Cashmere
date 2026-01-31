// lib/auth-utils.ts
import { hash, compare } from 'bcryptjs';
import crypto from 'crypto';

export class AuthUtils {
  // Email validation with detailed error messages
  static validateEmailFormat(email: string): { valid: boolean; message?: string } {
    if (!email || email.trim() === '') {
      return { valid: false, message: 'Email is required' };
    }
    
    // Trim and normalize email
    const normalizedEmail = email.trim().toLowerCase();
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(normalizedEmail)) {
      return { valid: false, message: 'Please enter a valid email address (example: user@domain.com)' };
    }
    
    // Check for common email issues
    if (normalizedEmail.includes(' ')) {
      return { valid: false, message: 'Email cannot contain spaces' };
    }
    
    if (normalizedEmail.length > 254) {
      return { valid: false, message: 'Email is too long (maximum 254 characters)' };
    }
    
    return { valid: true };
  }

  // Password validation with configurable requirements
  static validatePasswordFormat(
    password: string,
    options: {
      minLength?: number;
      requireUppercase?: boolean;
      requireLowercase?: boolean;
      requireNumbers?: boolean;
      requireSpecialChars?: boolean;
    } = {}
  ): { valid: boolean; message?: string; requirements?: any } {
    const {
      minLength = 6,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = false
    } = options;

    if (!password || password.trim() === '') {
      return { 
        valid: false, 
        message: 'Password is required',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check minimum length
    if (password.length < minLength) {
      return { 
        valid: false, 
        message: `Password must be at least ${minLength} characters long`,
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for uppercase letters
    if (requireUppercase && !/[A-Z]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must contain at least one uppercase letter (A-Z)',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for lowercase letters
    if (requireLowercase && !/[a-z]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must contain at least one lowercase letter (a-z)',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for numbers
    if (requireNumbers && !/[0-9]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must contain at least one number (0-9)',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for special characters
    if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { 
        valid: false, 
        message: 'Password must contain at least one special character (!@#$%^&* etc.)',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', 'qwerty', 'letmein', 'welcome',
      'admin', 'password123', '12345678', '123456789', '123123'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      return { 
        valid: false, 
        message: 'This password is too common. Please choose a stronger password.',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for repeating characters
    if (/(.)\1{2,}/.test(password)) {
      return { 
        valid: false, 
        message: 'Password contains too many repeating characters',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    // Check for sequential characters
    const sequences = ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'];
    const lowerPassword = password.toLowerCase();
    if (sequences.some(seq => lowerPassword.includes(seq))) {
      return { 
        valid: false, 
        message: 'Password contains sequential characters that are easy to guess',
        requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
      };
    }

    return { 
      valid: true,
      requirements: { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars }
    };
  }

  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    try {
      if (!password || password.trim() === '') {
        throw new Error('Password cannot be empty');
      }
      
      const saltRounds = 10;
      return await hash(password, saltRounds);
    } catch (error) {
      console.error('Password hashing error:', error);
      throw new Error('Failed to process password. Please try again.');
    }
  }

  // Verify password against hash
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      if (!password || !hashedPassword) {
        return false;
      }
      
      return await compare(password, hashedPassword);
    } catch (error) {
      console.error('Password verification error:', error);
      throw new Error('Failed to verify password. Please try again.');
    }
  }

  // Generate secure random token
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate password reset token (expires in 1 hour)
  static generateResetToken(): { token: string; expiresAt: Date } {
    const token = this.generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    return { token, expiresAt };
  }

  // Validate password reset token expiration
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  // Calculate password strength score (0-100)
  static calculatePasswordStrength(password: string): number {
    let score = 0;
    
    // Length score (max 40 points)
    score += Math.min(password.length * 4, 40);
    
    // Character variety scores
    if (/[A-Z]/.test(password)) score += 15; // Uppercase letters
    if (/[a-z]/.test(password)) score += 15; // Lowercase letters
    if (/[0-9]/.test(password)) score += 15; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 15; // Special characters
    
    // Penalties
    if (password.length < 8) score -= 20;
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeating chars
    if (/(123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      score -= 15; // Sequential chars
    }
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  // Get password strength label
  static getPasswordStrengthLabel(score: number): { label: string; color: string; description: string } {
    if (score >= 80) {
      return {
        label: 'Very Strong',
        color: 'text-green-600',
        description: 'Excellent password!'
      };
    } else if (score >= 60) {
      return {
        label: 'Strong',
        color: 'text-green-500',
        description: 'Good password'
      };
    } else if (score >= 40) {
      return {
        label: 'Fair',
        color: 'text-yellow-500',
        description: 'Could be stronger'
      };
    } else if (score >= 20) {
      return {
        label: 'Weak',
        color: 'text-orange-500',
        description: 'Needs improvement'
      };
    } else {
      return {
        label: 'Very Weak',
        color: 'text-red-600',
        description: 'Too easy to guess'
      };
    }
  }

  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
      .substring(0, 1000); // Limit length
  }

  // Validate name format
  static validateName(name: string): { valid: boolean; message?: string } {
    if (!name || name.trim() === '') {
      return { valid: true }; // Name is optional
    }
    
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters long' };
    }
    
    if (trimmedName.length > 100) {
      return { valid: false, message: 'Name is too long (maximum 100 characters)' };
    }
    
    // Allow letters, spaces, hyphens, and apostrophes
    if (!/^[A-Za-z\s\-'.]+$/.test(trimmedName)) {
      return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    return { valid: true };
  }

  // Generate a secure random password
  static generateSecurePassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 23)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check if email looks like a disposable/temporary email
  static isDisposableEmail(email: string): boolean {
    const disposableDomains = [
      'tempmail.com', 'throwawaymail.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', '10minutemail.com',
      'fakeinbox.com', 'trashmail.com', 'getairmail.com',
      'tempmailaddress.com', 'dispostable.com', 'maildrop.cc'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableDomains.some(d => domain?.includes(d));
  }

  // Format phone number (basic validation)
  static validatePhoneNumber(phone: string): { valid: boolean; message?: string; formatted?: string } {
    if (!phone || phone.trim() === '') {
      return { valid: true }; // Phone is optional
    }
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length < 10) {
      return { valid: false, message: 'Phone number must be at least 10 digits' };
    }
    
    if (cleaned.length > 15) {
      return { valid: false, message: 'Phone number is too long' };
    }
    
    // Basic formatting (US format example)
    let formatted = cleaned;
    if (cleaned.length === 10) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    return { 
      valid: true, 
      formatted 
    };
  }

  // Generate user-friendly error message from validation result
  static getValidationErrorMessage(validationResult: { valid: boolean; message?: string }): string {
    if (validationResult.valid) {
      return '';
    }
    
    return validationResult.message || 'Invalid input';
  }
}

// Export helper functions
export const validateEmail = (email: string) => AuthUtils.validateEmailFormat(email);
export const validatePassword = (password: string, options?: any) => AuthUtils.validatePasswordFormat(password, options);
export const hashPassword = (password: string) => AuthUtils.hashPassword(password);
export const verifyPassword = (password: string, hash: string) => AuthUtils.verifyPassword(password, hash);