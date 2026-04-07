'use client';

import Link from 'next/link';

interface CategoryFilterProps {
  productCount: number;
  currentCategory?: string;
}

export default function CategoryFilter({ productCount, currentCategory }: CategoryFilterProps) {
  return (
    <div className="space-y-2">
      <Link
        href="/products"
        className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
          !currentCategory || currentCategory === 'all'
            ? 'bg-amber-50 text-amber-600 font-medium'
            : 'text-red-900 hover:text-amber-600 hover:bg-amber-50'
        }`}
      >
        <span>All Clothings</span>
        <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
          {productCount}
        </span>
      </Link>
      
      <Link
        href="/products?category=CLOTHING"
        className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
          currentCategory === 'CLOTHING'
            ? 'bg-amber-50 text-amber-600 font-medium'
            : 'text-red-900 hover:text-amber-600 hover:bg-amber-50'
        }`}
      >
        <span>Clothing</span>
        <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
          {productCount}
        </span>
      </Link>
    </div>
  );
}