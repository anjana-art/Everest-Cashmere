// app/products/page.tsx
import { ProductList } from "@/components/product-list";
import { prisma } from "@/lib/prisma";
import ClothingFiltersSidebar from "@/components/filters/ClothingFiltersSidebar"

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
  const params = await Promise.resolve(searchParams);
  
  // Build filter based on search params
  const where: any = { isActive: true };
  
  if (params.category && params.category !== 'all') {
    where.category = params.category;
    
    if (params.type && params.category === 'CLOTHING') {
      where.clothingType = params.type;
    }
    
    if (params.gender) {
      where.gender = params.gender;
    }
  }

  // Sort order
  let orderBy: any = { createdAt: 'desc' };
  if (params.sort === 'price-low') orderBy = { price: 'asc' };
  if (params.sort === 'price-high') orderBy = { price: 'desc' };

  // Fetch products
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
      availableColors: true,
      availableSizes: true,
      defaultColor: true,
      defaultSize: true,
    },
    orderBy,
  });

  // Get counts for filters
  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const clothingCount = await prisma.product.count({ 
    where: { isActive: true, category: 'CLOTHING' } 
  });

  // Format products to match ProductList's expected type
  const formattedProducts = products.map(product => ({
    id: product.id,
    stripeId: product.stripeId || product.id,
    name: product.name,
    description: product.description || null,
    price: Number(product.price),
    images: product.images || [],
    metadata: {
      category: product.category || undefined,
      clothingType: product.clothingType || undefined,
      gender: product.gender || undefined,
      accessoriesType: product.accessoriesType || undefined,
      availableColors: product.availableColors || [],
      availableSizes: product.availableSizes || [],
      defaultColor: product.defaultColor || undefined,
      defaultSize: product.defaultSize || undefined,
    }
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ClothingFiltersSidebar 
            totalProductCount={totalProducts}
            clothingCount={clothingCount}
            currentCategory={params.category}
            currentType={params.type}
            currentGender={params.gender}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {formattedProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-red-800">No products found</p>
            </div>
          ) : (
            <ProductList products={formattedProducts} />
          )}
        </div>
      </div>
    </div>
  );
}