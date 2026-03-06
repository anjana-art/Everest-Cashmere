import { ProductList } from "@/components/product-list";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Match the exact Product type expected by ProductList component
interface Product {
  id: string;
  stripeId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  metadata?: any;
  category?: string | null;
  clothingType?: string | null;
  gender?: string | null;
  accessoriesType?: string | null;
  availableColors?: string[];
  availableSizes?: string[];
  defaultColor?: string | null;
  defaultSize?: string | null;
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    gender?: string;
    sort?: string;
  }> | {
    category?: string;
    type?: string;
    gender?: string;
    sort?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams if it's a Promise
  const params = await Promise.resolve(searchParams);
  
  // Build filter based on search params
  const where: any = { isActive: true };
  
  if (params.category && params.category !== 'all') {
    where.category = params.category;
    
    // Add type filter if provided
    if (params.type) {
      if (params.category === 'CLOTHING') {
        where.clothingType = params.type;
      } else if (params.category === 'ACCESSORIES') {
        where.accessoriesType = params.type;
      }
    }
    
    // Add gender filter if provided
    if (params.gender) {
      where.gender = params.gender;
    }
  }

  // Define sort order based on sort parameter
  let orderBy: any = { createdAt: 'desc' }; // Default: Newest
  
  if (params.sort) {
    switch (params.sort) {
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }
  }

  // Fetch products from your database with filtering and sorting
  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      stripeId: true,
      name: true,
      description: true,
      price: true,
      images: true,
      metadata: true,
      category: true,
      clothingType: true,
      gender: true,
      accessoriesType: true,
      createdAt: true, // Added for sorting reference
      availableColors: true,
      availableSizes: true,
      defaultColor: true,
      defaultSize: true,
    },
    orderBy,
  });

  console.log(`📦 Products from database (filter: ${JSON.stringify(params)}):`, products.length);

  // Get category counts for display
  const categoryCounts = {
    all: await prisma.product.count({ where: { isActive: true } }),
    CLOTHING: await prisma.product.count({ where: { isActive: true, category: 'CLOTHING' } }),
    HOME_DECORE: await prisma.product.count({ where: { isActive: true, category: 'HOME_DECORE' } }),
    ACCESSORIES: await prisma.product.count({ where: { isActive: true, category: 'ACCESSORIES' } }),
  };

  // Convert to the Product type expected by ProductList
  const formattedProducts: Product[] = products.map(product => ({
    id: product.id,
    stripeId: product.stripeId || product.id,
    name: product.name,
    description: product.description || null,
    price: Number(product.price),
    images: product.images || [],
    metadata: product.metadata || {},
    category: product.category || null,
    clothingType: product.clothingType || null,
    gender: product.gender || null,
    accessoriesType: product.accessoriesType || null,
    availableColors: product.availableColors || [],
    availableSizes: product.availableSizes || [],
    defaultColor: product.defaultColor || null,
    defaultSize: product.defaultSize || null,
  }));

  // Generate page title based on filters
  const getPageTitle = () => {
    if (!params.category || params.category === 'all') {
      return 'All Products';
    }
    
    const categoryName = params.category.replace('_', ' ');
    
    if (params.type && params.gender) {
      const typeName = params.type.replace('_', ' ');
      const genderName = params.gender.toLowerCase();
      return `${genderName.charAt(0).toUpperCase() + genderName.slice(1)}'s ${typeName} ${categoryName}`;
    }
    
    if (params.type) {
      const typeName = params.type.replace('_', ' ');
      return `${typeName} ${categoryName}`;
    }
    
    if (params.gender) {
      const genderName = params.gender.toLowerCase();
      return `${genderName.charAt(0).toUpperCase() + genderName.slice(1)}'s ${categoryName}`;
    }
    
    return categoryName;
  };

  // Generate description based on filters
  const getDescription = () => {
    const total = products.length;
    
    if (params.category === 'CLOTHING') {
      if (params.type && params.gender) {
        const typeName = params.type.replace('_', ' ').toLowerCase();
        const genderName = params.gender.toLowerCase();
        return `Browse our collection of ${total} ${genderName}'s ${typeName} clothing items. Premium quality and comfort.`;
      }
      if (params.type) {
        const typeName = params.type.replace('_', ' ').toLowerCase();
        return `Discover our ${total} ${typeName} clothing pieces. Luxurious fabrics and elegant designs.`;
      }
      if (params.gender) {
        const genderName = params.gender.toLowerCase();
        return `Explore ${total} ${genderName}'s clothing items. Style meets comfort in every piece.`;
      }
      return `Shop our collection of ${total} clothing items. From casual to formal, find your perfect fit.`;
    }
    
    if (params.category === 'ACCESSORIES') {
      if (params.type) {
        const typeName = params.type.toLowerCase();
        return `Browse our selection of ${total} ${typeName}'s accessories. Complete your look with style.`;
      }
      return `Discover ${total} accessories to complement your style. From statement pieces to everyday essentials.`;
    }
    
    if (params.category === 'HOME_DECORE') {
      return `Transform your space with our collection of ${total} home decor items. Elegance for every room.`;
    }
    
    return `Browse our entire collection of ${total} premium products. Quality craftsmanship and timeless design.`;
  };

  // Get current active filters for display (including sort)
  const activeFilters = [];
  if (params.category && params.category !== 'all') {
    activeFilters.push({
      key: 'category',
      label: params.category.replace('_', ' '),
      value: params.category
    });
  }
  if (params.type) {
    activeFilters.push({
      key: 'type',
      label: params.type.replace('_', ' '),
      value: params.type
    });
  }
  if (params.gender) {
    activeFilters.push({
      key: 'gender',
      label: params.gender,
      value: params.gender
    });
  }
  // Add sort to active filters if not default
  if (params.sort && params.sort !== 'newest') {
    const sortLabels: Record<string, string> = {
      'price-low': 'Price: Low to High',
      'price-high': 'Price: High to Low',
    };
    if (sortLabels[params.sort]) {
      activeFilters.push({
        key: 'sort',
        label: sortLabels[params.sort],
        value: params.sort
      });
    }
  }

  // Function to build URL with current params and updated sort
  const buildUrlWithSort = (sortValue: string) => {
    const urlParams = new URLSearchParams();
    
    // Add existing filters
    if (params.category && params.category !== 'all') {
      urlParams.set('category', params.category);
    }
    if (params.type) {
      urlParams.set('type', params.type);
    }
    if (params.gender) {
      urlParams.set('gender', params.gender);
    }
    
    // Add sort parameter (except for 'newest' which is default)
    if (sortValue && sortValue !== 'newest') {
      urlParams.set('sort', sortValue);
    }
    
    return `/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  };

  // Function to remove a filter
  const removeFilter = (filterKey: string) => {
    const urlParams = new URLSearchParams();
    
    // Add all current params except the one being removed
    if (filterKey !== 'category' && params.category && params.category !== 'all') {
      urlParams.set('category', params.category);
    }
    if (filterKey !== 'type' && params.type) {
      urlParams.set('type', params.type);
    }
    if (filterKey !== 'gender' && params.gender) {
      urlParams.set('gender', params.gender);
    }
    if (filterKey !== 'sort' && params.sort && params.sort !== 'newest') {
      urlParams.set('sort', params.sort);
    }
    
    // If removing category, also remove type and gender
    if (filterKey === 'category') {
      // Already handled by not adding them above
    }
    
    return `/products${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-red-900">{getPageTitle()}</h1>
        <p className="text-red-700">{getDescription()}</p>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-red-800">Active Filters:</span>
            {activeFilters.map(filter => (
              <div
                key={`${filter.key}-${filter.value}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
              >
                <span>{filter.label}</span>
                <Link
                  href={removeFilter(filter.key)}
                  className="text-amber-600 hover:text-amber-800"
                >
                  <span className="sr-only">Remove {filter.label} filter</span>
                  ×
                </Link>
              </div>
            ))}
            {activeFilters.length > 0 && (
              <Link
                href="/products"
                className="text-sm text-red-600 hover:text-amber-600 underline ml-2"
              >
                Clear all filters
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Filter Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-24">
            <h3 className="font-semibold text-lg mb-4 text-red-900">Categories</h3>
            
            <div className="space-y-2">
              {/* All Products */}
              <Link
                href="/products"
                className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                  (!params.category || params.category === 'all')
                    ? 'bg-amber-50 text-amber-600 font-medium'
                    : 'text-red-900 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span>All Products</span>
                <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                  {categoryCounts.all}
                </span>
              </Link>

              {/* Clothing */}
              <Link
                href="/products?category=CLOTHING"
                className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                  params.category === 'CLOTHING'
                    ? 'bg-amber-50 text-amber-600 font-medium'
                    : 'text-red-900 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span>Clothing</span>
                <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                  {categoryCounts.CLOTHING}
                </span>
              </Link>

              {/* Clothing Sub-filters */}
              {params.category === 'CLOTHING' && (
                <div className="ml-4 space-y-2">
                  {/* Clothing Type */}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Material Type</h4>
                    <div className="space-y-1">
                      <Link
                        href="/products?category=CLOTHING"
                        className={`block p-2 rounded text-sm transition-colors ${
                          !params.type
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        All Materials
                      </Link>
                      <Link
                        href="/products?category=CLOTHING&type=CASHMERE"
                        className={`block p-2 rounded text-sm transition-colors ${
                          params.type === 'CASHMERE'
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        Cashmere
                      </Link>
                      <Link
                        href="/products?category=CLOTHING&type=CASHMERE_MARINO_WOOL"
                        className={`block p-2 rounded text-sm transition-colors ${
                          params.type === 'CASHMERE_MARINO_WOOL'
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        Cashmere + Marino Wool
                      </Link>
                      <Link
                        href="/products?category=CLOTHING&type=MARINO_WOOL"
                        className={`block p-2 rounded text-sm transition-colors ${
                          params.type === 'MARINO_WOOL'
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        Marino Wool
                      </Link>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Gender</h4>
                    <div className="space-y-1">
                      <Link
                        href={params.type ? 
                          `/products?category=CLOTHING&type=${params.type}` : 
                          '/products?category=CLOTHING'
                        }
                        className={`block p-2 rounded text-sm transition-colors ${
                          !params.gender
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        All Genders
                      </Link>
                      <Link
                        href={params.type ? 
                          `/products?category=CLOTHING&type=${params.type}&gender=MEN` : 
                          '/products?category=CLOTHING&gender=MEN'
                        }
                        className={`block p-2 rounded text-sm transition-colors ${
                          params.gender === 'MEN'
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        Men
                      </Link>
                      <Link
                        href={params.type ? 
                          `/products?category=CLOTHING&type=${params.type}&gender=WOMEN` : 
                          '/products?category=CLOTHING&gender=WOMEN'
                        }
                        className={`block p-2 rounded text-sm transition-colors ${
                          params.gender === 'WOMEN'
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        Women
                      </Link>
                      <Link
                        href={params.type ? 
                          `/products?category=CLOTHING&type=${params.type}&gender=UNISEX` : 
                          '/products?category=CLOTHING&gender=UNISEX'
                        }
                        className={`block p-2 rounded text-sm transition-colors ${
                          params.gender === 'UNISEX'
                            ? 'text-amber-600 font-medium bg-amber-50'
                            : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        Unisex
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Home Decore */}
              <Link
                href="/products?category=HOME_DECORE"
                className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                  params.category === 'HOME_DECORE'
                    ? 'bg-amber-50 text-amber-600 font-medium'
                    : 'text-red-900 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span>Home Decore</span>
                <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                  {categoryCounts.HOME_DECORE}
                </span>
              </Link>

              {/* Accessories */}
              <Link
                href="/products?category=ACCESSORIES"
                className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                  params.category === 'ACCESSORIES'
                    ? 'bg-amber-50 text-amber-600 font-medium'
                    : 'text-red-900 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                <span>Accessories</span>
                <span className="text-sm bg-amber-100 text-red-800 px-2 py-1 rounded-full">
                  {categoryCounts.ACCESSORIES}
                </span>
              </Link>

              {/* Accessories Sub-filters */}
              {params.category === 'ACCESSORIES' && (
                <div className="ml-4 mt-3">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Gender</h4>
                  <div className="space-y-1">
                    <Link
                      href="/products?category=ACCESSORIES"
                      className={`block p-2 rounded text-sm transition-colors ${
                        !params.type
                          ? 'text-amber-600 font-medium bg-amber-50'
                          : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      All Accessories
                    </Link>
                    <Link
                      href="/products?category=ACCESSORIES&type=MEN"
                      className={`block p-2 rounded text-sm transition-colors ${
                        params.type === 'MEN'
                          ? 'text-amber-600 font-medium bg-amber-50'
                          : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      Men
                    </Link>
                    <Link
                      href="/products?category=ACCESSORIES&type=WOMEN"
                      className={`block p-2 rounded text-sm transition-colors ${
                        params.type === 'WOMEN'
                          ? 'text-amber-600 font-medium bg-amber-50'
                          : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      Women
                    </Link>
                    <Link
                      href="/products?category=ACCESSORIES&type=UNISEX"
                      className={`block p-2 rounded text-sm transition-colors ${
                        params.type === 'UNISEX'
                          ? 'text-amber-600 font-medium bg-amber-50'
                          : 'text-red-800 hover:text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      Unisex
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Results Info */}
          <div className="flex justify-between items-center mb-6">
            {/* Sort options */}
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-red-800">Sort by:</span>
              <div className="flex items-center space-x-1">
                <Link
                  href={buildUrlWithSort('newest')}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    (!params.sort || params.sort === 'newest')
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-red-800 hover:bg-amber-100'
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={buildUrlWithSort('price-low')}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    params.sort === 'price-low'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-red-800 hover:bg-amber-100'
                  }`}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={buildUrlWithSort('price-high')}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    params.sort === 'price-high'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-red-800 hover:bg-amber-100'
                  }`}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>
          </div>

          {/* Products */}
          {formattedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-red-800 mb-4 text-lg">No products found</div>
              <p className="text-red-700 mb-6">
                {params.category 
                  ? `We couldn't find any products in the "${params.category.replace('_', ' ')}" category.`
                  : 'No products are currently available.'
                }
              </p>
              <Link 
                href="/products" 
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <>
              <ProductList products={formattedProducts} />
              
              {/* Pagination (optional - you can add later) */}
              {products.length >= 20 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button className="px-3 py-2 rounded border border-amber-200 text-red-800 hover:bg-amber-50 transition-colors">
                      Previous
                    </button>
                    <button className="px-3 py-2 rounded bg-amber-600 text-white">1</button>
                    <button className="px-3 py-2 rounded border border-amber-200 text-red-800 hover:bg-amber-50 transition-colors">2</button>
                    <button className="px-3 py-2 rounded border border-amber-200 text-red-800 hover:bg-amber-50 transition-colors">3</button>
                    <button className="px-3 py-2 rounded border border-amber-200 text-red-800 hover:bg-amber-50 transition-colors">
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}