// components/simple-image-grid.tsx
'use client';
import { useState, useEffect } from "react";
import Image from "next/image";

// Update these paths to match your actual image locations
const imagesList = [
  { src: "/5_cashmere_bg_sweater.webp", alt: "Product 1" },
  { src: "/cashmere_stacked.webp", alt: "Product 2" },
  { src: "/cashmere_stacked.webp", alt: "Product 3" },
  { src: "/indigo_cashmere_sweater.webp", alt: "Product 4" },
];

export const SimpleImageGrid = () => {
  const [currentPair, setCurrentPair] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPair((prev) => (prev + 2) % imagesList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get two images for current display
  const image1 = imagesList[currentPair];
  const image2 = imagesList[(currentPair + 1) % imagesList.length];

  return (
    <div className="w-full h-screen flex justify-center items-center bg-white">
      {/* Responsive Container - Wider on larger screens */}
      <div className="w-full h-full 
                      sm:w-[95%] sm:h-[95%]
                      md:w-[90%] md:h-[90%]
                      lg:w-[85%] lg:h-[85%]
                      xl:w-[1400px] xl:h-[90%]
                      2xl:w-[1600px]">
        
        {/* Grid with responsive gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 lg:gap-6 w-full h-full">
          
          {/* Left Image */}
          <div className="relative w-full h-[50vh] md:h-full rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={image1.src}
              alt={image1.alt}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
            />
            {/* Optional: Image overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Right Image */}
          <div className="relative w-full h-[50vh] md:h-full rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={image2.src}
              alt={image2.alt}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 45vw"
            />
            {/* Optional: Image overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
          
        </div>
      </div>
    </div>
  );
};