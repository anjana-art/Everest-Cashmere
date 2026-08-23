// app/profile/my-experience/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function MyExperiencePage() {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.length < 20) {
      setError('Please write at least 20 characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setContent('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Profile
        </Link>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🙏</div>
          <h2 className="text-2xl font-serif font-bold text-green-700">Thank You!</h2>
          <p className="text-gray-600 mt-2">
            Your experience has been shared. It will be published after moderation.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            Share Another Experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Profile
      </Link>

      <h1 className="text-2xl font-serif font-bold text-red-900 mb-2">
        Share Your Experience
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Tell us about your overall experience with our brand. Your story might inspire others!
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-red-900 mb-2">
            Your Story <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience with our brand, products, or service..."
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition resize-y"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{content.length}/2000 characters</span>
            {content.length < 20 && content.length > 0 && (
              <span className="text-amber-600">Minimum 20 characters</span>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Share My Experience'}
        </button>
      </form>
    </div>
  );
}