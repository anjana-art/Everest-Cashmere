// components/ReviewForm.tsx
"use client";

import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ReviewFormProps {
  productId: string;
  productName?: string;
  productImage?: string;  // ✅ ADD THIS - for product image display
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  compact?: boolean;
  prefillRating?: number;
  prefillReview?: string;
}

export const ReviewForm = ({
  productId,
  productName,
  productImage,  // ✅ ADD THIS
  orderId,
  onSuccess,
  onCancel,
  className = '',
  compact = false,
  prefillRating = 0,
  prefillReview = '',
}: ReviewFormProps) => {
  const [rating, setRating] = useState(prefillRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState(prefillReview);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Upload images to Cloudinary
  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    setUploadingImages(true);

    for (const image of images) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('folder', 'reviews');
      formData.append('productId', productId);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url);
        } else {
          const errorData = await res.json();
          setError(errorData.error || 'Failed to upload image');
        }
      } catch (err) {
        console.error('Upload failed:', err);
        setError('Failed to upload image. Please try again.');
      }
    }

    setUploadingImages(false);
    return uploadedUrls;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError(`${file.name} is not a valid image format`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setError('');
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (reviewText.length < 10) {
      setError('Please write at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
        if (imageUrls.length === 0 && images.length > 0) {
          setError('Failed to upload images. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          rating,
          review: reviewText,
          images: imageUrls,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        onSuccess?.();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-serif text-xl text-green-800">Thank You!</h3>
        <p className="text-gray-600 text-sm mt-2">
          Your review has been submitted and will be published after moderation.
        </p>
        <button
          onClick={onCancel}
          className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          Close
        </button>
      </div>
    );
  }

  // Compact version for inline use
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        {productName && (
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <p className="text-sm text-red-700">
              Reviewing: <span className="font-serif font-semibold">{productName}</span>
            </p>
          </div>
        )}

        {/* Rating - Compact */}
        <div>
          <label className="block font-serif font-medium text-red-900 mb-1 text-sm">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                {star <= (hoverRating || rating) ? (
                  <StarIcon className="w-8 h-8 text-amber-400" />
                ) : (
                  <StarOutlineIcon className="w-8 h-8 text-gray-300" />
                )}
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {rating === 5 && '⭐ Excellent!'}
              {rating === 4 && '👍 Great!'}
              {rating === 3 && '😊 Good'}
              {rating === 2 && '😕 Could be better'}
              {rating === 1 && '😞 Needs improvement'}
            </p>
          )}
        </div>

        {/* Review Text - Compact */}
        <div>
          <label className="block font-serif font-medium text-red-900 mb-1 text-sm">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
            maxLength={5000}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition text-sm"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{reviewText.length}/5000</span>
            {reviewText.length < 10 && reviewText.length > 0 && (
              <span className="text-amber-600">Min 10 characters</span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || uploadingImages}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm disabled:opacity-50"
          >
            {isSubmitting || uploadingImages ? 'Processing...' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-amber-200 text-red-900 hover:bg-amber-50 rounded-lg transition text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  }

  // Full version
  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Product Info */}
      {productName && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
          {productImage && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
          )}
          <div>
            <h3 className="font-serif font-semibold text-red-900">{productName}</h3>
            {orderId && (
              <p className="text-xs text-gray-400">Order #{orderId}</p>
            )}
          </div>
        </div>
      )}

      {/* Rating */}
      <div>
        <label className="block font-serif font-medium text-red-900 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              {star <= (hoverRating || rating) ? (
                <StarIcon className="w-10 h-10 text-amber-400" />
              ) : (
                <StarOutlineIcon className="w-10 h-10 text-gray-300" />
              )}
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-amber-600 mt-1">
            {rating === 5 && '⭐ Excellent! You loved this product'}
            {rating === 4 && '👍 Great! You really liked it'}
            {rating === 3 && '😊 Good! It met your expectations'}
            {rating === 2 && '😕 Could be better'}
            {rating === 1 && '😞 Needs improvement'}
          </p>
        )}
      </div>

      {/* Review Text */}
      <div>
        <label className="block font-serif font-medium text-red-900 mb-1">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={5}
          maxLength={5000}
          className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition resize-y"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{reviewText.length}/5000 characters</span>
          {reviewText.length < 10 && reviewText.length > 0 && (
            <span className="text-amber-600">Minimum 10 characters</span>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-serif font-medium text-red-900 mb-2">
          Add Photos <span className="text-gray-400 text-sm font-light">(Optional, max 5)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-amber-200 group">
              <Image src={preview} alt={`Review ${index + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}

          {imagePreviews.length < 5 && (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-amber-200 flex items-center justify-center cursor-pointer hover:border-amber-400 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <PhotoIcon className="w-6 h-6 text-amber-400" />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Upload up to 5 images (JPG, PNG, WebP) • Max 5MB each
        </p>
        {uploadingImages && (
          <p className="text-xs text-amber-600 mt-1">Uploading images...</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting || uploadingImages ? 'Processing...' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-amber-200 text-red-900 hover:bg-amber-50 rounded-xl transition"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Your review helps other customers make informed decisions. Thank you for sharing!
      </p>
    </form>
  );
};