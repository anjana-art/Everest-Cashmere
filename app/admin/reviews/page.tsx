// app/admin/reviews/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { CheckIcon, XMarkIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  rating: number;
  review: string | null;
  images: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  product: {
    name: string;
    images: string[];
  };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const url = filter === 'PENDING' 
        ? '/api/admin/reviews/pending'
        : `/api/admin/reviews?status=${filter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        // Refresh list
        fetchReviews();
        if (selectedReview?.id === reviewId) {
          setSelectedReview(null);
          setShowDetail(false);
        }
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchReviews();
        if (selectedReview?.id === reviewId) {
          setSelectedReview(null);
          setShowDetail(false);
        }
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
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
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-red-900">Product Reviews</h1>
          <p className="text-gray-500 text-sm">Manage customer reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-amber-200 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          >
            <option value="PENDING">Pending ({reviews.filter(r => r.status === 'PENDING').length})</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="REPORTED">Reported</option>
            <option value="ALL">All</option>
          </select>
          <span className="text-sm text-gray-400">{reviews.length} reviews</span>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="font-serif text-lg text-red-900">No reviews found</h3>
          <p className="text-gray-500 text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                  {review.product?.images?.[0] ? (
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-300 text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-red-900">
                        {review.product?.name || 'Unknown Product'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        review.status === 'REPORTED' ? 'bg-orange-100 text-orange-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                    {review.review || 'No review text'}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      By {review.user?.name || 'Anonymous'}
                    </span>
                    {review.verifiedPurchase && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      ❤️ {review.helpfulVotes} helpful
                    </span>
                  </div>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {review.images.slice(0, 3).map((img, i) => (
                        <div key={i} className="relative w-10 h-10 rounded overflow-hidden border border-amber-100">
                          <Image src={img} alt={`Review ${i}`} fill className="object-cover" />
                        </div>
                      ))}
                      {review.images.length > 3 && (
                        <div className="w-10 h-10 bg-amber-50 rounded flex items-center justify-center text-xs text-amber-600 border border-amber-100">
                          +{review.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    {review.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition"
                        >
                          <CheckIcon className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                          className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setShowDetail(true);
                      }}
                      className="flex items-center gap-1 border border-amber-200 text-amber-700 hover:bg-amber-50 px-3 py-1 rounded-lg text-sm transition"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1 rounded-lg text-sm transition hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      {showDetail && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-serif font-bold text-red-900">
                  Review Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedReview(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Product</label>
                  <p className="font-medium text-red-900">{selectedReview.product?.name}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</label>
                  <p className="font-medium">{selectedReview.user?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">{selectedReview.user?.email}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</label>
                  <div className="flex mt-1">{renderStars(selectedReview.rating)}</div>
                </div>

                {selectedReview.review && (
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Review</label>
                    <p className="text-stone-700 mt-1 whitespace-pre-wrap">{selectedReview.review}</p>
                  </div>
                )}

                {selectedReview.images && selectedReview.images.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Images</label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {selectedReview.images.map((img, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-amber-200">
                          <Image src={img} alt={`Review ${i}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</label>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${
                    selectedReview.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    selectedReview.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedReview.status}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</label>
                  <p className="text-sm">{formatDate(selectedReview.createdAt)}</p>
                </div>

                {selectedReview.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t border-amber-100">
                    <button
                      onClick={() => {
                        updateReviewStatus(selectedReview.id, 'APPROVED');
                        setShowDetail(false);
                        setSelectedReview(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      <CheckIcon className="w-4 h-4 inline mr-1" />
                      Approve Review
                    </button>
                    <button
                      onClick={() => {
                        updateReviewStatus(selectedReview.id, 'REJECTED');
                        setShowDetail(false);
                        setSelectedReview(null);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      <XMarkIcon className="w-4 h-4 inline mr-1" />
                      Reject Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}