// components/BrandExperience.tsx
"use client";

import { useState } from 'react';

export const BrandExperience = () => {
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (review.length < 10) {
      setError('Please write at least 10 characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const res = await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: review }),
      });
      
      if (res.ok) {
        setSuccess(true);
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
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🙏</div>
        <h3 className="font-serif text-xl text-green-800">Thank You!</h3>
        <p className="text-gray-600 text-sm mt-2">
          Your experience has been shared. It will be published after moderation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif font-bold text-red-900">
          Share Your Experience With Us ✨
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Tell us about your overall experience with Himkash. Your story inspires others!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Review Text */}
        <div>
          <label className="block font-serif font-medium text-red-900 mb-1">
            Your Story <span className="text-red-500">*</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with our brand, products, or service..."
            rows={5}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition resize-y"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{review.length}/2000 characters</span>
            {review.length < 10 && review.length > 0 && (
              <span className="text-amber-600">Minimum 10 characters</span>
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
};