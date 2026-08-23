// components/ProductReviews.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ReviewForm } from './ReviewForm';

interface Review {
  id: string;
  userName: string;
  rating: number;
  review: string | null;
  images: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  productName?: string;
  productImage?: string;
}

export const ProductReviews = ({ 
  productId, 
  productName, 
  productImage 
}: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId, sortBy, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/reviews/product/${productId}?sortBy=${sortBy}&page=${page}&limit=10`
      );
      
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setTotalReviews(data.totalReviews);
        setAverageRating(data.averageRating);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'PATCH',
      });
      
      if (res.ok) {
        const data = await res.json();
        setReviews(prev => 
          prev.map(r => 
            r.id === reviewId ? { ...r, helpfulVotes: data.helpfulVotes } : r
          )
        );
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-full max-w-md h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
     
        
         

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-200">
          <h3 className="text-lg font-serif font-semibold text-red-900 mb-4">
            Share Your Experience
          </h3>
          <ReviewForm
            productId={productId}
            productName={productName}
            productImage={productImage}
            compact={true}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Sort */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <span className="text-sm text-gray-500">{totalReviews} reviews</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-amber-200 rounded-lg px-3 py-1 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="font-serif text-lg text-red-900">No reviews yet</h3>
          <p className="text-gray-500 text-sm mt-1">Be the first to review this product!</p>
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-amber-100 pb-6 last:border-0">
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-red-900">{review.userName}</span>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              {review.review && (
                <p className="text-stone-700 text-sm leading-relaxed mt-2">
                  {review.review}
                </p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {review.images.slice(0, 5).map((image, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-200">
                      <Image src={image} alt={`Review ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                  {review.images.length > 5 && (
                    <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center text-xs text-amber-600 border border-amber-200">
                      +{review.images.length - 5}
                    </div>
                  )}
                </div>
              )}

              {/* Helpful Button */}
              <button
                onClick={() => markHelpful(review.id)}
                className="flex items-center gap-1 mt-3 text-xs text-gray-400 hover:text-amber-600 transition"
              >
                <HeartIcon className="w-4 h-4" />
                <span>Helpful ({review.helpfulVotes})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-amber-200 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};