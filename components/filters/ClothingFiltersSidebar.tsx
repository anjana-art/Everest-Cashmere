'use client';

import CategoryFilter from './CategoryFilter';
import MaterialTypeFilter from './MaterialTypeFilter';
import GenderFilter from './GenderFilter';

interface ClothingFiltersSidebarProps {
  totalProductCount: number;
  clothingCount: number;
  currentCategory?: string;
  currentType?: string;
  currentGender?: string;
}

export default function ClothingFiltersSidebar({
  totalProductCount,
  clothingCount,
  currentCategory,
  currentType,
  currentGender,
}: ClothingFiltersSidebarProps) {
  // Only show clothing filters if we're in clothing category
  const showClothingFilters = currentCategory === 'CLOTHING';
  
  // Pass the appropriate count based on current selection
  const categoryCount = !currentCategory || currentCategory === 'all' 
    ? totalProductCount 
    : clothingCount;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-24">
      <h3 className="font-semibold text-lg mb-4 text-red-900">Categories</h3>
      
      <CategoryFilter 
        productCount={categoryCount}
        currentCategory={currentCategory}
      />

      {/* Material Type Filter - Only show for Clothing */}
      {showClothingFilters && (
        <>
          <div className="border-t border-amber-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-red-800 mb-3">Material Type</h4>
            <MaterialTypeFilter 
              currentType={currentType}
              category={currentCategory}
              gender={currentGender}
            />
          </div>

          <div className="border-t border-amber-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-red-800 mb-3">Gender</h4>
            <GenderFilter 
              currentGender={currentGender}
              category={currentCategory}
              type={currentType}
            />
          </div>
        </>
      )}
    </div>
  );
}