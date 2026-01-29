// lib/logout-utils.ts
'use client';

export function logout() {
  // Clear localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('auth-token');
  localStorage.removeItem('pendingCart');
  
  // Clear sessionStorage if used
  sessionStorage.clear();
  
  // Clear cookies (via API)
  fetch('/api/auth/logout', { method: 'POST' });
  
  // Redirect to home page
  window.location.href = '/';
}