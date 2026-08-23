// components/VerifiedCustomerTestimonialsCarousel.tsx
"use client";

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Experience {
  id: string;
  content: string;
  user: {
    name: string;
  };
  createdAt: string;
}

export const VerifiedCustomerTestimonialsCarousel = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    // Auto-slide every 5 seconds
    if (experiences.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % experiences.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [experiences.length]);

  const fetchExperiences = async () => {
    try {
      const res = await fetch('/api/experiences?limit=20');
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="w-64 h-4 bg-gray-200 rounded"></div>
          <div className="w-full max-w-md h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  const current = experiences[currentIndex];

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-amber-50/50 to-rose-50/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-amber-700 font-medium">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-red-900 mt-2">
            What Our Customers Say
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="relative bg-white rounded-2xl p-8 md:p-12 border border-amber-100/50 shadow-lg">
          {/* Quote Icon */}
          <div className="text-6xl text-amber-200 font-serif absolute top-4 left-6 opacity-30">
            "
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} className="w-5 h-5 text-amber-400" />
            ))}
          </div>

          {/* Verified Badge */}
          <div className="flex justify-center mb-4">
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
              ✓ Verified Purchase
            </span>
          </div>

          {/* Testimonial Text */}
          <p className="text-stone-700 text-center text-base md:text-lg leading-relaxed italic">
            "{current.content}"
          </p>

          {/* Customer Name */}
          <div className="text-center mt-6">
            <p className="font-medium text-red-900">
              {current.user?.name || 'Anonymous Customer'}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(current.createdAt).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
              })}
            </p>
          </div>

          {/* Navigation Buttons */}
          {experiences.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full border border-amber-200 hover:bg-amber-50 transition"
              >
                <ChevronLeftIcon className="w-5 h-5 text-amber-600" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full border border-amber-200 hover:bg-amber-50 transition"
              >
                <ChevronRightIcon className="w-5 h-5 text-amber-600" />
              </button>
            </div>
          )}

          {/* Dot Indicators */}
          {experiences.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {experiences.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentIndex ? 'bg-amber-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};