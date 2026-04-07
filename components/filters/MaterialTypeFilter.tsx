'use client';

import Link from 'next/link';

interface MaterialTypeFilterProps {
  currentType?: string;
  category: string;
  gender?: string;
}

export default function MaterialTypeFilter({ currentType, category, gender }: MaterialTypeFilterProps) {
  const materialTypes = [
    { value: 'CASHMERE', label: 'Cashmere' },
    { value: 'CASHMERE_MARINO_WOOL', label: 'Cashmere + Marino Wool' },
    { value: 'MARINO_WOOL', label: 'Marino Wool' },
  ];

  const buildUrl = (typeValue?: string) => {
    const params = new URLSearchParams();
    params.set('category', category);
    if (gender && gender !== 'all') params.set('gender', gender);
    if (typeValue) params.set('type', typeValue);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="space-y-2">
      <Link
        href={buildUrl()}
        className={`block p-2 rounded text-sm transition-colors ${
          !currentType
            ? 'text-amber-600 font-medium bg-amber-50'
            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
        }`}
      >
        All Materials
      </Link>
      {materialTypes.map((type) => (
        <Link
          key={type.value}
          href={buildUrl(type.value)}
          className={`block p-2 rounded text-sm transition-colors ${
            currentType === type.value
              ? 'text-amber-600 font-medium bg-amber-50'
              : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
          }`}
        >
          {type.label}
        </Link>
      ))}
    </div>
  );
}