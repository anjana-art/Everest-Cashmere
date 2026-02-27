'use client';

import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  PinterestShareButton,
  PinterestIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  XIcon,
} from 'react-share';
import { useState, useEffect } from 'react';
import { Instagram, Music2, Copy, Check, Link2 } from 'lucide-react';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  media?: string;
  hashtag?: string;
  className?: string;
  iconSize?: number;
  round?: boolean;
  showLabels?: boolean;
}

export default function ShareButtons({
  url,
  title = 'Check this out!',
  description = '',
  media = '',
  hashtag = '',
  className = '',
  iconSize = 40,
  round = true,
  showLabels = false,
}: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState<null | 'instagram' | 'tiktok' | 'link'>(null);

  useEffect(() => {
    setShareUrl(url || window.location.href);
  }, [url]);

  const handleCopy = (type: 'instagram' | 'tiktok' | 'link') => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInstagramShare = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open Instagram app with the link
      if (isIOS) {
        // iOS Instagram URL scheme
        window.location.href = `instagram://library?AssetPath=${encodeURIComponent(shareUrl)}`;
      } else {
        // Android Instagram intent
        window.location.href = `intent://instagram.com#Intent;package=com.instagram.android;schemal=https;end`;
      }
      
      // Fallback to copy after 800ms if app doesn't open
      setTimeout(() => {
        if (!document.hidden) {
          handleCopy('instagram');
        }
      }, 800);
    } else {
      handleCopy('instagram');
    }
  };

  const handleTikTokShare = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open TikTok app
      window.location.href = `tiktok://share?url=${encodeURIComponent(shareUrl)}`;
      
      // Fallback to copy
      setTimeout(() => {
        if (!document.hidden) {
          handleCopy('tiktok');
        }
      }, 800);
    } else {
      handleCopy('tiktok');
    }
  };

  const ShareButtonWrapper = ({ 
    ButtonComponent, 
    IconComponent, 
    label, 
    bgColor,
    ...props 
  }: any) => (
    <div className="relative group">
      <ButtonComponent {...props}>
        <IconComponent size={iconSize} round={round} bgStyle={{ fill: bgColor }} />
      </ButtonComponent>
      {showLabels ? (
        <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
          {label}
        </span>
      ) : (
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Share on {label}
        </span>
      )}
    </div>
  );

  return (
    <div className={`flex flex-wrap gap-3 items-center ${className}`}>
      {/* Facebook */}
      <ShareButtonWrapper
        ButtonComponent={FacebookShareButton}
        IconComponent={FacebookIcon}
        label="Facebook"
        bgColor="#1877F2"
        url={shareUrl}
        hashtag={hashtag}
        title={title}
      />

      {/* X (Twitter) */}
      <ShareButtonWrapper
        ButtonComponent={TwitterShareButton}
        IconComponent={XIcon}
        label="X"
        bgColor="#000000"
        url={shareUrl}
        title={title}
      />

      {/* WhatsApp */}
      <ShareButtonWrapper
        ButtonComponent={WhatsappShareButton}
        IconComponent={WhatsappIcon}
        label="WhatsApp"
        bgColor="#25D366"
        url={shareUrl}
        title={title}
        separator=" - "
      />

      {/* Pinterest */}
      <div className="relative group">
        <PinterestShareButton
          url={shareUrl}
          media={media || shareUrl}
          description={title}
        >
          <PinterestIcon size={iconSize} round={round} bgStyle={{ fill: '#BD081C' }} />
        </PinterestShareButton>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          Pin it
        </span>
      </div>

      {/* Telegram */}
      <ShareButtonWrapper
        ButtonComponent={TelegramShareButton}
        IconComponent={TelegramIcon}
        label="Telegram"
        bgColor="#26A5E4"
        url={shareUrl}
        title={title}
      />

      {/* LinkedIn */}
      <ShareButtonWrapper
        ButtonComponent={LinkedinShareButton}
        IconComponent={LinkedinIcon}
        label="LinkedIn"
        bgColor="#0A66C2"
        url={shareUrl}
        title={title}
        summary={description}
      />

      {/* Email */}
      <ShareButtonWrapper
        ButtonComponent={EmailShareButton}
        IconComponent={EmailIcon}
        label="Email"
        bgColor="#7F7F7F"
        url={shareUrl}
        subject={title}
        body={`${description}\n\n${shareUrl}`}
      />

      {/* Instagram - Tries to open app first */}
      <div className="relative group">
        <button
          onClick={handleInstagramShare}
          className="focus:outline-none"
          aria-label="Share on Instagram"
        >
          <div
            className="rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center text-white hover:scale-110 transition-transform"
            style={{ width: iconSize, height: iconSize }}
          >
            {copied === 'instagram' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Instagram className="w-5 h-5" />
            )}
          </div>
        </button>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {copied === 'instagram' ? 'Copied!' : 'Instagram'}
        </span>
      </div>

      {/* TikTok - Tries to open app first */}
      <div className="relative group">
        <button
          onClick={handleTikTokShare}
          className="focus:outline-none"
          aria-label="Share on TikTok"
        >
          <div
            className="rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform"
            style={{ width: iconSize, height: iconSize }}
          >
            {copied === 'tiktok' ? (
              <Check className="w-5 h-5" />
            ) : (
              <Music2 className="w-5 h-5" />
            )}
          </div>
        </button>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {copied === 'tiktok' ? 'Copied!' : 'TikTok'}
        </span>
      </div>

      {/* Copy Link Button */}
      <div className="relative group">
        <button
          onClick={() => handleCopy('link')}
          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all hover:scale-110 focus:outline-none"
          style={{ width: iconSize, height: iconSize }}
          aria-label="Copy link"
        >
          {copied === 'link' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Link2 className="w-5 h-5 text-gray-600" />
          )}
        </button>
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {copied === 'link' ? 'Copied!' : 'Copy link'}
        </span>
      </div>
    </div>
  );
}