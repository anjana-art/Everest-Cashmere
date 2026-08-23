// app/profile/my-reviews/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ReviewForm } from '@/components/ReviewForm';

interface EligibleProduct {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  orderDate: string;
  price: number;
}

interface ReviewedItem extends EligibleProduct {
  review: {
    rating: number;
    comment: string;
    date: string;
    status: string;
  };
}

export default function MyReviewsPage() {
  const [eligible, setEligible] = useState<EligibleProduct[]>([]);
  const [reviewed, setReviewed] = useState<ReviewedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<EligibleProduct | null>(null);

  useEffect(() => {
    fetchEligibleProducts();
  }, []);

  const fetchEligibleProducts = async () => {
    try {
      const res = await fetch('/api/reviews/eligible', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setEligible(data.eligible || []);
        setReviewed(data.reviewed || []);
      }
    } catch (error) {
      console.error('Error fetching eligible products:', error);
    } finally {
      setLoading(false);
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Show review form when a product is selected
  if (selectedProduct) {
    return (
      <div>
        <button
          onClick={() => setSelectedProduct(null)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-amber-600 transition mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to My Reviews
        </button>

        <div className="bg-white rounded-xl border border-amber-100 p-6">
          <h2 className="text-xl font-serif font-bold text-red-900 mb-4">
            Write a Review
          </h2>
          
          <ReviewForm
            productId={selectedProduct.productId}
            productName={selectedProduct.productName}
            productImage={selectedProduct.productImage}
            onSuccess={() => {
              setSelectedProduct(null);
              fetchEligibleProducts();
            }}
            onCancel={() => setSelectedProduct(null)}
          />
        </div>
      </div>
    );
  }

  // Main list view
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-red-900 mb-2">My Reviews</h1>
      <p className="text-gray-500 text-sm mb-6">
        Review products you've purchased to help other customers
      </p>

      {/* Products to Review */}
      {eligible.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">
            Products to Review ({eligible.length})
          </h2>
          <div className="space-y-3">
            {eligible.map((product) => (
              <div
                key={`${product.productId}-${product.orderId}`}
                className="bg-white border border-amber-100 rounded-xl p-4 hover:shadow-md transition group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                    {product.productImage ? (
                      <Image
                        src={product.productImage}
                        alt={product.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300">
                        <PhotoIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-red-900 group-hover:text-amber-600 transition">
                      {product.productName}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Ordered {formatDate(product.orderDate)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
                  >
                    Write Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already Reviewed */}
      {reviewed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3">
            Your Reviews ({reviewed.length})
          </h2>
          <div className="space-y-3">
            {reviewed.map((item) => (
              <div
                key={`${item.productId}-${item.orderId}`}
                className="bg-white border border-amber-100 rounded-xl p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50 flex-shrink-0">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-300">
                        <PhotoIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-red-900">{item.productName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{renderStars(item.review.rating)}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        item.review.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.review.status}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1 line-clamp-2">
                      {item.review.comment}
                    </p>
                  </div>
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-amber-600 hover:text-amber-700 text-sm font-medium whitespace-nowrap"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {eligible.length === 0 && reviewed.length === 0 && (
        <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="font-serif text-lg text-red-900">No Reviews Yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Purchase products and you'll be able to review them here.
          </p>
          <Link
            href="/products"
            className="inline-block mt-4 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}