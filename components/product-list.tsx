'use client';

import { ProductCard } from "./product-card";
import { useState } from "react";

interface Product {
  id: string;           // Database ID
  stripeId: string;     // Stripe ID
  name: string;
  description: string | null;
  price: number;        // Already in euros
  images: string[];
  metadata?: {
    category?: string;
    [key: string]: any;
  };
}

interface Props {
  products: Product[];
}

export const ProductList = ({ products }: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredProduct = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(term);
    const descriptionMatch = product.description
      ? product.description.toLowerCase().includes(term)
      : false;
    return nameMatch || descriptionMatch;
  });

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-md rounded border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>
      <ul  className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-6">
        {filteredProduct.map((product, index) => (
          <li key={product.id}>
            <ProductCard product={product} priority={index < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
};