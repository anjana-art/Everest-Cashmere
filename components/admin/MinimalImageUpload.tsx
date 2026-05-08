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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // 👈 This ensures cookies are sent

      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.url; // Return the stored image URL
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const remainingSlots = 4 - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        const url = await uploadImageToServer(file);
        uploadedUrls.push(url);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        alert(`Failed to upload ${file.name}. Please try again.`);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
    
    if (uploadedUrls.length > 0) {
      setImages([...images, ...uploadedUrls]);
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={uploading || images.length >= 4}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-2">
          Max 4 images. Supported: JPG, PNG, WEBP
        </p>
      </div>
      
      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-700">Uploading images...</span>
          </div>
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              Uploading: {Object.keys(uploadProgress).join(', ')}
            </div>
          )}
        </div>
      )}
      
      {images.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Uploaded Images ({images.length}/4)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={img} 
                  alt={`Product image ${idx + 1}`} 
                  className="h-24 w-full object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    // Handle broken images
                    (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  ×
                </button>
                {idx === 0 && (
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {images.length === 0 && !uploading && (
        <div className="mt-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Click above to select images</p>
        </div>
      )}
    </div>
  );
}