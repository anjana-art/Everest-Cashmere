// components/ProductShare.tsx - FIXED VERSION
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FacebookShareButton, 
  TwitterShareButton, 
  WhatsappShareButton,
  FacebookIcon, 
  TwitterIcon, 
  WhatsappIcon,
} from 'react-share';
import { Share2, X, Link2, Check } from 'lucide-react';

interface ProductShareProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    images: string[];
  };
}

export function ProductShare({ product }: ProductShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_PROD_URL || 
                (typeof window !== 'undefined' ? window.location.origin : 'https://himkash.com');
    setBaseUrl(url);
  }, []);

  if (!baseUrl) return null;

  const productUrl = `${baseUrl}/products/${product.id}`;
  
  const productImage = product.images?.[0] 
    ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`)
    : `${baseUrl}/himkash_logo_register.webp`;
    
  const shareText = `${product.name} - ${product.price.toFixed(2)}€\n${product.description || 'Luxury cashmere from Nepal'}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(`${productUrl}\n\n${shareText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-md"
      >
        <Share2 size={18} />
        <span className="font-medium">Share Product</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            
            <div className="flex items-center justify-between p-4 border-b border-amber-100">
              <h3 className="text-lg font-serif font-semibold text-red-900">Share this product</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-rose-50">
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={productImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-serif font-bold text-red-900 text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-amber-700 font-semibold text-lg">{product.price.toFixed(2)}€</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {product.description || 'Handcrafted luxury cashmere from Nepal'}
                  </p>
                  <div className="mt-2 text-xs text-amber-600 truncate">
                    🔗 {baseUrl.replace('https://', '').replace('http://', '')}
                  </div>
                </div>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                This is what others will see when you share
              </p>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600 font-medium">Share via:</p>
              
              <div className="flex justify-around">
                {/* Fixed: FacebookShareButton uses 'quote' as a prop correctly - actually it does support 'quote' */}
                {/* But to be safe, let's use 'title' which is more universal */}
                <FacebookShareButton url={productUrl} title={shareText}>
                  <div className="flex flex-col items-center gap-1 hover:scale-110 transition-transform cursor-pointer">
                    <FacebookIcon size={48} round />
                    <span className="text-xs">Facebook</span>
                  </div>
                </FacebookShareButton>

                <TwitterShareButton url={productUrl} title={shareText}>
                  <div className="flex flex-col items-center gap-1 hover:scale-110 transition-transform cursor-pointer">
                    <TwitterIcon size={48} round />
                    <span className="text-xs">Twitter</span>
                  </div>
                </TwitterShareButton>

                <WhatsappShareButton url={productUrl} title={shareText}>
                  <div className="flex flex-col items-center gap-1 hover:scale-110 transition-transform cursor-pointer">
                    <WhatsappIcon size={48} round />
                    <span className="text-xs">WhatsApp</span>
                  </div>
                </WhatsappShareButton>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {copied ? <Check size={18} className="text-green-600" /> : <Link2 size={18} />}
                <span>{copied ? 'Link copied!' : 'Copy product link'}</span>
              </button>
              
              <p className="text-xs text-gray-400 text-center truncate">
                {productUrl}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}