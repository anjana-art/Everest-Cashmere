// components/StartupWelcomeBanner.tsx
"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const StartupWelcomeBanner = () => {
  const [isDismissed, setIsDismissed] = useState(() => {
    // ✅ Initialize state directly from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('startup_banner_dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('startup_banner_dismissed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="relative bg-white/80 backdrop-blur-sm border border-amber-100/50 rounded-2xl shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-rose-50/20 to-transparent"></div>
      
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center text-2xl shadow-sm">
              🌱
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
              As a startup in our initial phase, we warmly welcome your feedback, suggestions, 
              and any questions you may have about our products or service — all just one click away.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              <a
                href="https://wa.me/351920817350"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Chat with us on WhatsApp
              </a>
              <span className="text-xs text-gray-400">
                ✦ We'll reach out as soon as possible
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors mt-1"
            aria-label="Dismiss banner"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};