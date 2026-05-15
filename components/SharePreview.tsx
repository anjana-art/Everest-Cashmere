// components/SharePreview.tsx
'use client';

import { useEffect } from 'react';

interface SharePreviewProps {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}

export function SharePreview({ title, description, imageUrl, url }: SharePreviewProps) {
  useEffect(() => {
    // Update OG tags dynamically for client-side sharing
    const updateMetaTags = () => {
      // Update og:title
      let meta = document.querySelector('meta[property="og:title"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:title');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', title);

      // Update og:description
      meta = document.querySelector('meta[property="og:description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);

      // Update og:image
      meta = document.querySelector('meta[property="og:image"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', imageUrl);

      // Update og:url
      meta = document.querySelector('meta[property="og:url"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', 'og:url');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', url);

      // Update twitter card
      meta = document.querySelector('meta[name="twitter:card"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'twitter:card');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', 'summary_large_image');

      meta = document.querySelector('meta[name="twitter:image"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'twitter:image');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', imageUrl);
    };

    updateMetaTags();
  }, [title, description, imageUrl, url]);

  return null; // This component doesn't render anything
}