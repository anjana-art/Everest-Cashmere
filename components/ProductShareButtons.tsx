// components/ShareButtons.tsx
'use client';

import { Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  price: number;
  className?: string;
}

export function ProductShareButtons({ title, description, imageUrl, url, price, className = '' }: ShareButtonsProps) {
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${title} - ${price.toFixed(2)}€ - ${description}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        setShowShareOptions(!showShareOptions);
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`${url}\n\n${title} - ${price.toFixed(2)}€\n${description}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div>
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 ${className}`}
      >
        <Share2 size={18} />
        <span>Share Product</span>
      </button>

      {showShareOptions && (
        <div className="mt-2 p-3 bg-white rounded-lg shadow-lg border">
          <button
            onClick={copyToClipboard}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}