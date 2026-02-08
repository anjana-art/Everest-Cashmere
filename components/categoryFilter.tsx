// components/CategoryFilter.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  categoryCounts: {
    all: number;
    CLOTHING: number;
    HOME_DECORE: number;
    ACCESSORIES: number;
  };
  currentCategory?: string;
  currentType?: string;
}

export default function CategoryFilter({ 
  categoryCounts, 
  currentCategory,
  currentType 
}: CategoryFilterProps) {
  const searchParams = useSearchParams();
  
  const categories = [
    { value: 'all', label: 'All Products', count: categoryCounts.all },
    { value: 'CLOTHING', label: 'Clothing', count: categoryCounts.CLOTHING },
    { value: 'HOME_DECORE', label: 'Home Decore', count: categoryCounts.HOME_DECORE },
    { value: 'ACCESSORIES', label: 'Accessories', count: categoryCounts.ACCESSORIES },
  ];

  const clothingTypes = [
    { value: 'CASHMERE', label: 'Cashmere' },
    { value: 'CASHMERE_MARINO_WOOL', label: 'Cashmere + Marino Wool' },
    { value: 'MARINO_WOOL', label: 'Marino Wool' },
  ];

  const accessoriesTypes = [
    { value: 'MEN', label: 'Men' },
    { value: 'WOMEN', label: 'Women' },
    { value: 'UNISEX', label: 'Unisex' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      
      <div className="space-y-2">
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value === 'all' ? '/products' : `/products?category=${cat.value}`}
            className={`flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 ${
              (!currentCategory && cat.value === 'all') || currentCategory === cat.value
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-700'
            }`}
          >
            <span>{cat.label}</span>
            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Clothing Subcategories */}
      {currentCategory === 'CLOTHING' && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-600 mb-3">Clothing Types</h4>
          <div className="space-y-2">
            {clothingTypes.map((type) => (
              <Link
                key={type.value}
                href={`/products?category=CLOTHING&type=${type.value}`}
                className={`block p-2 rounded-lg hover:bg-gray-50 ${
                  currentType === type.value
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {type.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Accessories Subcategories */}
      {currentCategory === 'ACCESSORIES' && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-600 mb-3">Accessories Types</h4>
          <div className="space-y-2">
            {accessoriesTypes.map((type) => (
              <Link
                key={type.value}
                href={`/products?category=ACCESSORIES&type=${type.value}`}
                className={`block p-2 rounded-lg hover:bg-gray-50 ${
                  currentType === type.value
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                {type.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}