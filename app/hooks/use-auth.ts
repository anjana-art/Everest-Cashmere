// hooks/use-auth.ts
'use client'

import { useState } from 'react'
import { AuthUtils } from '@/lib/auth-utils'

export function useAuth() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateSignup = (email: string, password: string, confirmPassword: string) => {
    const newErrors: Record<string, string> = {}
    
    // Validate email
    const emailValidation = AuthUtils.validateEmailFormat(email)
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message!
    }
    
    // Validate password
    const passwordValidation = AuthUtils.validatePasswordFormat(password)
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message!
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const validateLogin = (email: string, password: string) => {
    const newErrors: Record<string, string> = {}
    
    // Validate email
    if (!email) {
      newErrors.email = 'Email is required'
    } else {
      const emailValidation = AuthUtils.validateEmailFormat(email)
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.message!
      }
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  return {
    errors,
    validateSignup,
    validateLogin,
    clearErrors: () => setErrors({})
  }
}