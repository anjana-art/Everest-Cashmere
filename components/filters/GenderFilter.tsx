'use client';

import Link from 'next/link';

interface GenderFilterProps {
  currentGender?: string;
  category: string;
  type?: string;
}

export default function GenderFilter({ currentGender, category, type }: GenderFilterProps) {
  const genders = [
    { value: 'all', label: 'All Genders' },
    { value: 'MEN', label: 'Men' },
    { value: 'WOMEN', label: 'Women' },
    { value: 'UNISEX', label: 'Unisex' },
  ];

  const buildUrl = (genderValue?: string) => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (type) params.set('type', type);
    if (genderValue && genderValue !== 'all') params.set('gender', genderValue);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="space-y-2">
      {genders.map((gender) => (
        <Link
          key={gender.value}
          href={buildUrl(gender.value === 'all' ? undefined : gender.value)}
          className={`block p-2 rounded text-sm transition-colors ${
            (!currentGender && gender.value === 'all') || currentGender === gender.value
              ? 'text-amber-600 font-medium bg-amber-50'
              : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
          }`}
        >
          {gender.label}
        </Link>
      ))}
    </div>
  );
}