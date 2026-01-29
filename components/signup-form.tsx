// components/SignupForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/app/hooks/use-auth'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { errors, validateSignup, clearErrors } = useAuth()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()
    
    if (!validateSignup(email, password, confirmPassword)) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        // Redirect or show success message
        console.log('User created:', data.user)
      } else {
        alert(data.error || 'Signup failed')
      }
    } catch (error) {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      
      {success ? (
        <div className="p-4 bg-green-100 text-green-700 rounded">
          Account created successfully! You can now login.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Your name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
              placeholder="your@email.com"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Min 6 chars with number & special char"
              required
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-gray-600 text-sm mt-1">
              Password must be 6-20 characters with at least 1 number and 1 special character (!@#$%^&*)
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block mb-2">Confirm Password *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      )}
    </div>
  )
}