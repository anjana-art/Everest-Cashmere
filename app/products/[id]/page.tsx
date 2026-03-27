import { ProductDetail } from "@/components/product-detail";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  // ✅ Fix: Handle metadata type
  const metadata = product.metadata && typeof product.metadata === 'object' && !Array.isArray(product.metadata)
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
        category: product.category,
        clothingType: product.clothingType,
        // ✅ Remove stock if it's not in the Product type
        // stock: product.stock,
        availableColors: product.availableColors || [],
        availableSizes: product.availableSizes || [],
        defaultColor: product.defaultColor,
        defaultSize: product.defaultSize,
        metadata: metadata,
      }}
    />
  );
}