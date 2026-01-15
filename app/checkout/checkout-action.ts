"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";
import { redirect } from "next/navigation";

export const checkoutAction = async (formData: FormData): Promise<void> => {
     // console.log("BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL, process.env.NEXT_URL);

      // Get base URL properly
  const getBaseUrl = () => {
    // Try environment variables first
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    
    // Fallback for Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Fallback for local development
    return 'http://localhost:3001';
  };

  const baseUrl = getBaseUrl();
  console.log('Base URL:', baseUrl);
  console.log('Environment:', process.env.NODE_ENV);

  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson);
  const line_items = items.map((item: CartItem) => ({
    price_data: {
      currency: "eur",
      product_data: { name: item.name },
      unit_amount: item.price,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    success_url: `${baseUrl}/checkout/success`,
    cancel_url: `${baseUrl}/checkout`,
  });

  redirect(session.url!);
};