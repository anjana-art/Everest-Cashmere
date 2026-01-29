// hooks/useAdmin.ts
import { useState, useEffect } from 'react';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // First check if user is logged in
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (!sessionData.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      // You can either:
      // Option A: Include admin status in the user cookie
      // Option B: Make a separate API call to check admin status
      
      // For now, let's assume you'll add isAdmin to the user cookie
      // We'll check localStorage first as fallback
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(user.isAdmin || false);
      
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
}