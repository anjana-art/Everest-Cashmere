"use client";

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface Rating {
  id: string;
  rating: number;
  review: string | null;
  helpfulVotes: number;
  verifiedPurchase: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    userProfile: {
      displayName: string | null;
      profileImage: string | null;
    } | null;
  };
}

interface RatingSummary {
  average: number;
  total: number;
  helpfulVotes: number;
  distribution: Array<{ rating: number; count: number }>;
}

interface ProductRatingProps {
  productId: string;
  readOnly?: boolean;
  showSummary?: boolean;
}

export const ProductRating = ({ 
  productId, 
  readOnly = false,
  showSummary = true 
}: ProductRatingProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [productId, page]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${productId}/ratings?page=${page}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setRatings(data.ratings);
        setSummary(data.summary);
        setTotalPages(data.pagination.pages);
        
        // Check if user has already rated this product
        const userResponse = await fetch(`/api/products/${productId}/ratings/check`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.hasRated) {
            setUserRating(userData.rating.rating);
            setReviewText(userData.rating.review || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!userRating) {
      alert('Please select a star rating');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/products/${productId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          review: reviewText.trim(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setUserRating(null);
        setReviewText('');
        fetchRatings(); // Refresh ratings
      } else {
        alert(data.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (ratingId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/ratings/${ratingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful: true }),
      });

      const data = await response.json();
      if (data.success) {
        fetchRatings(); // Refresh to show updated votes
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {showSummary && summary && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold text-gray-900">
                {summary.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center md:justify-start mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(summary.average)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Based on {summary.total} {summary.total === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Star Distribution */}
            <div className="flex-1 max-w-md">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingCount = summary.distribution.find(d => d.rating === rating)?.count || 0;
                const percentage = summary.total > 0 ? (ratingCount / summary.total) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium w-4">{rating}</span>
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 w-8 text-right">
                      {ratingCount}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Write Review Button */}
            {!readOnly && (
              <div>
                <button
                  onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Form */}
      {!readOnly && !userRating && (
        <div id="review-form" className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
          
          {/* Star Rating Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <StarIcon
                    className={`h-8 w-8 ${
                      userRating && star <= userRating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your experience with this product..."
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {reviewText.length}/1000 characters
            </div>
          </div>

          <button
            onClick={handleSubmitRating}
            disabled={!userRating || submitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}

      {/* Existing Reviews */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {rating.user.userProfile?.profileImage ? (
                      <img
                        src={rating.user.userProfile.profileImage}
                        alt={rating.user.name || 'User'}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {(rating.user.name?.[0] || rating.user.email[0]).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <div className="font-medium">
                      {rating.user.userProfile?.displayName || rating.user.name || 'Anonymous'}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rating.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      {rating.verifiedPurchase && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <CheckBadgeIcon className="h-4 w-4" />
                          <span>Verified Purchase</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {format(new Date(rating.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>
              
              {rating.review && (
                <p className="text-gray-700 mb-4">{rating.review}</p>
              )}
              
              {/* Helpful Votes */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleHelpfulVote(rating.id)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <span>Helpful</span>
                  <span className="text-gray-400">•</span>
                  <span>{rating.helpfulVotes}</span>
                </button>
                
                {rating.status === 'PENDING' && (
                  <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    Awaiting Moderation
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && ratings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. Be the first to review this product!
        </div>
      )}
    </div>
  );
};