// app/products/[id]/page.tsx - ADD sizeGuide to the query

import { ProductDetail } from "@/components/product-detail";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  if (!id) {
    return {
      title: "Product Not Found | HIM-KASH",
      description: "The product you are looking for does not exist.",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      images: true,
      price: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | HIM-KASH",
      description: "The product you are looking for does not exist.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_PROD_URL || "https://himkash.com";
  const productUrl = `${baseUrl}/products/${id}`;
  
  // Optimize image for WhatsApp (smaller size, better compression)
  let productImage = '';
  
  if (product.images && product.images.length > 0) {
    const originalImage = product.images[0];
    
    if (originalImage.includes('cloudinary')) {
      // Add Cloudinary transformations for WhatsApp
      // w_500: width 500px, h_500: height 500px, c_fill: crop to fill, f_auto: auto format, q_auto: auto quality
      productImage = originalImage.replace(
        '/upload/',
        '/upload/w_500,h_500,c_fill,q_auto:good,f_auto/'
      );
    } else {
      productImage = originalImage;
    }
  } else {
    productImage = `${baseUrl}/himkash_logo_register.webp`;
  }

  console.log("📱 WhatsApp Optimized Image URL:", productImage);

  return {
    title: `${product.name} | HIM-KASH Luxury Cashmere`,
    description: product.description || `Discover ${product.name} - Premium cashmere from Nepal at ${product.price}€`,
    openGraph: {
      title: product.name,
      description: product.description || `Handcrafted cashmere sweater - ${product.price}€`,
      url: productUrl,
      siteName: "HIM-KASH",
      images: [
        {
          url: productImage,
          width: 500,  // WhatsApp prefers 500px
          height: 500,
          alt: product.name,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description || `Luxury cashmere from Nepal`,
      images: [productImage],
    },
    // WhatsApp specific meta tags
    other: {
      'wa:image': productImage,
      'wa:image:width': '500',
      'wa:image:height': '500',
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      stripeId: true,
      name: true,
      description: true,
      price: true,
      images: true,
      sizeGuide: true, // ⭐ ADD THIS LINE - FIXES THE ISSUE
      category: true,
      clothingType: true,
      availableColors: true,
      availableSizes: true,
      defaultColor: true,
      defaultSize: true,
      stock: true,
      isActive: true,
      metadata: true,
    },
  });

  if (!product || !product.isActive) return notFound();

  const metadata = product.metadata && 
    typeof product.metadata === 'object' && 
    !Array.isArray(product.metadata) && 
    Object.keys(product.metadata).length > 0
      ? product.metadata as Record<string, any>
      : { category: product.category };

  return (
    <ProductDetail
      product={{
        id: product.id,
        stripeId: product.stripeId || product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        images: product.images || [],
        sizeGuide: product.sizeGuide || null, // ⭐ PASS THE sizeGuide TO THE COMPONENT
        category: product.category,
        clothingType: product.clothingType,
        availableColors: product.availableColors || [],
        availableSizes: product.availableSizes || [],
        defaultColor: product.defaultColor,
        defaultSize: product.defaultSize,
        metadata: metadata,
      }}
    />
  );
}