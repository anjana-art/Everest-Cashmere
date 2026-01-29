// components/admin/MinimalImageUpload.tsx
'use client';

import { useState, useRef } from 'react';

export default function MinimalImageUpload({ 
  images, 
  setImages 
}: { 
  images: string[], 
  setImages: (images: string[]) => void 
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList) => {
    Array.from(files).slice(0, 4 - images.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImages([...images, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        accept="image/*"
        multiple
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative">
            <img src={img} alt="" className="h-20 w-full object-cover rounded" />
            <button
              type="button"
              onClick={() => setImages(images.filter((_, i) => i !== idx))}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}