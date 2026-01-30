// app/products/[id]/page.tsx - CORRECTED FOR YOUR SCHEMA
import { ProductDetail } from "@/components/product-detail";
import { notFound } from 'next/navigation';
import { prisma } from "@/lib/prisma";

// Define the Product type matching your ProductDetail component
interface Product {
  id: string;
  stripeId: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
  category?: string | null;
  stock?: number;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  console.log('🔍 ProductPage - ID from params:', id);
  
  // Validate ID
  if (!id || id === 'undefined' || id === 'null') {
    console.error('❌ Invalid product ID');
    notFound();
  }
  
  try {
    // Fetch product from database using the ID from URL
    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        stripeId: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        availableColors: true,
        availableSizes: true,
        defaultColor: true,
        defaultSize: true,
        stock: true,
        isActive: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Debug log
    console.log('🔍 Found product:', {
      exists: !!product,
      id: product?.id,
      name: product?.name,
      isActive: product?.isActive,
      stock: product?.stock,
      hasImages: product?.images?.length,
    });

    // If product not found
    if (!product) {
      console.error('❌ Product not found with ID:', id);
      notFound();
    }

    // Check if product is active
    if (product.isActive === false) {
      console.warn('⚠️ Product is inactive:', product.id);
      notFound();
    }

    // Check stock if applicable
    if (product.stock !== undefined && product.stock <= 0) {
      console.warn('⚠️ Product out of stock:', product.id);
      // You might still want to show it but disable purchase
    }

    // Convert price from Decimal to number
    const priceAsNumber = Number(product.price);
    
    // Handle metadata - convert from JsonValue to the expected structure
    let metadata: { category?: string; [key: string]: any } = {};
    
    if (product.metadata && typeof product.metadata === 'object' && product.metadata !== null) {
      metadata = product.metadata as { category?: string; [key: string]: any };
    } else if (product.category) {
      // If no metadata but we have category, use it
      metadata = { category: product.category };
    }
    
    // Prepare product data for component with correct typing
    const formattedProduct: Product = {
      id: product.id,
      stripeId: product.stripeId || product.id,
      name: product.name,
      description: product.description,
      price: priceAsNumber,
      images: product.images || [],
      metadata: metadata,
      category: product.category,
      stock: product.stock,
    };

    console.log('✅ Sending to ProductDetail:', {
      id: formattedProduct.id,
      name: formattedProduct.name,
      price: formattedProduct.price,
      imageCount: formattedProduct.images.length,
      metadata: formattedProduct.metadata,
    });

    return <ProductDetail product={formattedProduct} />;
    
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    
    // Don't fall back to Stripe since you're not using Stripe IDs
    notFound();
  }
}