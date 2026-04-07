// components/navigation/ClothingNav.tsx - FULLY UPDATED WITH CORRECT URLS
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Package, 
  Layers, 
  Users, 
  TrendingUp, 
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';

interface ClothingNavProps {
  materialCounts?: {
    CASHMERE: number;
    CASHMERE_MARINO_WOOL: number;
    MARINO_WOOL: number;
  };
  genderCounts?: {
    MEN: number;
    WOMEN: number;
    UNISEX: number;
  };
}

export default function ClothingNav({ materialCounts, genderCounts }: ClothingNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Detect current context (what page are we on?)
  const currentContext = useMemo(() => {
    // Check if we're on a gender+material page: /clothing/women/cashmere
    const genderMatch = pathname.match(/^\/clothing\/(women|men|unisex)\/([^/]+)/);
    if (genderMatch) {
      return {
        type: 'gender-material',
        gender: genderMatch[1],
        material: genderMatch[2]
      };
    }
    
    // Check if we're on a material page with gender query param: /clothing/cashmere?gender=women
    const materialMatch = pathname.match(/^\/clothing\/(cashmere|cashmere-marino-wool|marino-wool)/);
    if (materialMatch) {
      const genderParam = searchParams.get('gender');
      return {
        type: 'material',
        material: materialMatch[1],
        gender: genderParam || null
      };
    }
    
    // Check if we're on a gender page: /clothing/women
    const clothingGenderMatch = pathname.match(/^\/clothing\/(women|men|unisex)/);
    if (clothingGenderMatch) {
      return {
        type: 'gender',
        gender: clothingGenderMatch[1]
      };
    }
    
    // Check if we're on main clothing page: /clothing
    if (pathname === '/clothing') {
      const genderParam = searchParams.get('gender');
      const materialParam = searchParams.get('material');
      return {
        type: 'clothing',
        gender: genderParam || null,
        material: materialParam || null
      };
    }
    
    return { type: 'default' };
  }, [pathname, searchParams]);

  // FIXED: Smart material URL generator - ALWAYS uses /clothing/ prefix
  const getMaterialUrl = (materialSlug: string) => {
    // If we're on a gender page (like /clothing/women), go to /clothing/women/cashmere
    if (currentContext.type === 'gender' && currentContext.gender) {
      return `/clothing/${currentContext.gender}/${materialSlug}`;
    }
    
    // If we're on a gender+material page, just change the material
    if (currentContext.type === 'gender-material' && currentContext.gender) {
      return `/clothing/${currentContext.gender}/${materialSlug}`;
    }
    
    // If we're on clothing page with gender filter, preserve it
    if (currentContext.type === 'clothing' && currentContext.gender) {
      return `/clothing/${materialSlug}?gender=${currentContext.gender}`;
    }
    
    // If we're on a material page, just change the material
    if (currentContext.type === 'material') {
      // Preserve gender filter if exists
      if (currentContext.gender) {
        return `/clothing/${materialSlug}?gender=${currentContext.gender}`;
      }
      return `/clothing/${materialSlug}`;
    }
    
    // Default: just material page
    return `/clothing/${materialSlug}`;
  };

  // FIXED: Smart gender URL generator - ALWAYS uses /clothing/ prefix
  const getGenderUrl = (genderSlug: string) => {
    // If we're on a material page (e.g., /clothing/cashmere)
    // Stay on clothing path and add gender as query param (filter by gender)
    if (currentContext.type === 'material' && currentContext.material) {
      return `/clothing/${currentContext.material}?gender=${genderSlug}`;
    }
    
    // If we're on a gender+material page (e.g., /clothing/women/cashmere)
    // Change the gender but keep the material (clean URL structure)
    if (currentContext.type === 'gender-material' && currentContext.material) {
      return `/clothing/${genderSlug}/${currentContext.material}`;
    }
    
    // If we're on clothing page with material filter, preserve the material
    if (currentContext.type === 'clothing' && currentContext.material) {
      return `/clothing/${currentContext.material}?gender=${genderSlug}`;
    }
    
    // If we're on a gender page (e.g., /clothing/women)
    // Just change the gender
    if (currentContext.type === 'gender') {
      return `/clothing/${genderSlug}`;
    }
    
    // Default: clothing gender page
    return `/clothing/${genderSlug}`;
  };

  // FIXED: All URL - ALWAYS uses /clothing/ prefix
  const getAllUrl = () => {
    // Clear all filters and go to appropriate base
    if (currentContext.type === 'gender-material' && currentContext.gender) {
      return `/clothing/${currentContext.gender}`;
    }
    if (currentContext.type === 'material') {
      return '/clothing';
    }
    if (currentContext.type === 'gender') {
      return '/clothing';
    }
    return '/clothing';
  };

  // FIXED: Clear filters URL - ALWAYS uses /clothing/ prefix
  const getClearFiltersUrl = () => {
    // Go to same page but without filters
    if (currentContext.type === 'gender-material') {
      return `/clothing/${currentContext.gender}`;
    }
    if (currentContext.type === 'material') {
      return `/clothing/${currentContext.material}`;
    }
    if (currentContext.type === 'clothing') {
      return '/clothing';
    }
    return '/clothing';
  };

  const materials = [
    { value: 'CASHMERE', label: 'Cashmere', slug: 'cashmere', path: '/clothing/cashmere' },
    { value: 'CASHMERE_MARINO_WOOL', label: 'Cashmere + Marino Wool', slug: 'cashmere-marino-wool', path: '/clothing/cashmere-marino-wool' },
    { value: 'MARINO_WOOL', label: 'Marino Wool', slug: 'marino-wool', path: '/clothing/marino-wool' },
  ];

  const genders = [
    { value: 'MEN', label: "Men's", slug: 'men', path: '/clothing/men' },
    { value: 'WOMEN', label: "Women's", slug: 'women', path: '/clothing/women' },
    { value: 'UNISEX', label: 'Unisex', slug: 'unisex', path: '/clothing/unisex' },
  ];

  const isActive = (path: string) => pathname === path;

  // Check if a material is currently selected
  const isMaterialSelected = (materialSlug: string) => {
    if (currentContext.type === 'material' && currentContext.material === materialSlug) return true;
    if (currentContext.type === 'gender-material' && currentContext.material === materialSlug) return true;
    return false;
  };

  const isGenderSelected = (genderSlug: string) => {
    if (currentContext.type === 'gender' && currentContext.gender === genderSlug) return true;
    if (currentContext.type === 'gender-material' && currentContext.gender === genderSlug) return true;
    if (currentContext.type === 'material' && currentContext.gender === genderSlug) return true;
    if (currentContext.type === 'clothing' && currentContext.gender === genderSlug) return true;
    return false;
  };

  return (
    <>
      {/* Desktop Navigation - FIRST */}
      <nav className="hidden md:block bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Main Clothing Link */}
            <Link 
              href={getAllUrl()}
              className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-lg transition-colors ${
                pathname === '/clothing' && !currentContext.gender && !currentContext.material
                  ? 'bg-amber-600 text-white' 
                  : 'text-red-900 hover:bg-amber-50'
              }`}
            >
              <Package className="w-4 h-4" />
              All Clothing
            </Link>

            {/* Dropdown: Shop by Material */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('material')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isMaterialSelected(currentContext.material || '')
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-red-900 hover:bg-amber-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Shop by Material
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'material' ? 'rotate-180' : ''}`} />
              </button>
              
              {openDropdown === 'material' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-amber-100 py-2 z-50">
                  {materials.map((material) => (
                    <Link
                      key={material.value}
                      href={getMaterialUrl(material.slug)}
                      className={`flex justify-between items-center px-4 py-3 hover:bg-amber-50 transition-colors ${
                        isMaterialSelected(material.slug) ? 'bg-amber-50 text-amber-700' : 'text-red-900'
                      }`}
                    >
                      <span>{material.label}</span>
                      {materialCounts && (
                        <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                          {materialCounts[material.value as keyof typeof materialCounts] || 0}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown: Shop by Gender */}
            <div 
              className="relative"
              onMouseEnter={() => setOpenDropdown('gender')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isGenderSelected(currentContext.gender || '')
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-red-900 hover:bg-amber-50'
                }`}
              >
                <Users className="w-4 h-4" />
                Shop by Gender
                <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === 'gender' ? 'rotate-180' : ''}`} />
              </button>
              
              {openDropdown === 'gender' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-amber-100 py-2 z-50">
                  {genders.map((gender) => (
                    <Link
                      key={gender.value}
                      href={getGenderUrl(gender.slug)}
                      className={`flex justify-between items-center px-4 py-3 hover:bg-amber-50 transition-colors ${
                        isGenderSelected(gender.slug) ? 'bg-amber-50 text-amber-700' : 'text-red-900'
                      }`}
                    >
                      <span>{gender.label}</span>
                      {genderCounts && (
                        <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                          {genderCounts[gender.value as keyof typeof genderCounts] || 0}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
              <Link 
                href="/clothing/new-arrivals"
                className="flex items-center gap-1 px-4 py-2 text-red-900 hover:text-amber-600 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                New Arrivals
              </Link>
              <Link 
                href="/clothing/bestsellers"
                className="flex items-center gap-1 px-4 py-2 text-red-900 hover:text-amber-600 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Bestsellers
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - SECOND */}
      <nav className="md:hidden bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              href={getAllUrl()}
              className="flex items-center gap-2 text-lg font-semibold text-red-900"
            >
              <Package className="w-5 h-5" />
              {currentContext.gender ? `${currentContext.gender}'s ` : ''}
              {currentContext.material ? currentContext.material.replace(/-/g, ' ') : 'Clothing'}
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-red-900 hover:bg-amber-50"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t border-amber-100 z-50 max-h-[80vh] overflow-y-auto">
            <div className="py-2">
              <Link 
                href={getAllUrl()}
                className="block px-4 py-3 text-red-900 hover:bg-amber-50 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Clothing
              </Link>
              
              {/* Mobile Material Section */}
              <div className="border-t border-amber-100">
                <div className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Shop by Material
                </div>
                {materials.map((material) => (
                  <Link
                    key={material.value}
                    href={getMaterialUrl(material.slug)}
                    className={`flex justify-between items-center px-4 py-3 pl-8 transition-colors ${
                      isMaterialSelected(material.slug) 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'text-red-900 hover:bg-amber-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{material.label}</span>
                    {materialCounts && (
                      <span className="text-xs bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                        {materialCounts[material.value as keyof typeof materialCounts] || 0}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Gender Section */}
              <div className="border-t border-amber-100">
                <div className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Shop by Gender
                </div>
                {genders.map((gender) => (
                  <Link
                    key={gender.value}
                    href={getGenderUrl(gender.slug)}
                    className={`block px-4 py-3 pl-8 transition-colors ${
                      isGenderSelected(gender.slug)
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-red-900 hover:bg-amber-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {gender.label}
                  </Link>
                ))}
              </div>

              {/* Current Context Indicator */}
              {(currentContext.gender || currentContext.material) && (
                <div className="border-t border-amber-100 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Current view:</p>
                  <div className="flex gap-2 flex-wrap">
                    {currentContext.gender && (
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {currentContext.gender}'s
                      </span>
                    )}
                    {currentContext.material && (
                      <span className="text-sm bg-white px-2 py-1 rounded border">
                        {currentContext.material.replace(/-/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Active Filters Bar - THIRD (BELOW both navigations) */}
      {(currentContext.gender || currentContext.material) && (
        <div className="bg-amber-50 border-b border-amber-200 shadow-sm">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Active filters:</span>
                {currentContext.gender && (
                  <span className="bg-white px-2 py-1 rounded text-amber-700 flex items-center gap-1">
                    Gender: {currentContext.gender}
                    <Link href={getClearFiltersUrl()} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </Link>
                  </span>
                )}
                {currentContext.material && (
                  <span className="bg-white px-2 py-1 rounded text-amber-700 flex items-center gap-1">
                    Material: {currentContext.material.replace(/-/g, ' ')}
                    <Link href={getClearFiltersUrl()} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </Link>
                  </span>
                )}
              </div>
              <Link 
                href={getAllUrl()} 
                className="text-xs text-amber-600 hover:text-amber-800 underline"
              >
                Clear all
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}