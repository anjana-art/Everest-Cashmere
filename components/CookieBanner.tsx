// components/CookieBanner.tsx
'use client';
import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consented = localStorage.getItem('cookie-consent');
    if (!consented) setShowBanner(true);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    setShowBanner(false);
    // Enable analytics, marketing cookies here
  };

  const rejectAll = () => {
    localStorage.setItem('cookie-consent', 'necessary');
    setShowBanner(false);
    // Disable non-essential cookies
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-900 text-white p-4 z-50">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm">
          We use cookies to improve your experience. By using our site, you accept our 
          <a href="/cookies" className="underline ml-1">Cookie Policy</a>.
        </p>
        <div className="flex gap-3">
          <button onClick={rejectAll} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
            Reject All
          </button>
          <button onClick={acceptAll} className="px-4 py-2 bg-amber-600 rounded hover:bg-amber-700">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}