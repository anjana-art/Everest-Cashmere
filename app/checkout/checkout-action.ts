// app/checkout/checkout-action.ts
"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const checkoutAction = async (formData: FormData): Promise<void> => {
  try {
    // Get user from cookies (now set by your login API)
    const cookieStore = await cookies(); // Note: await here!
    const userCookie = cookieStore.get('user')?.value;
    
    if (!userCookie) {
      console.log("No user cookie, redirecting to login");
      redirect(`/login?callbackUrl=/checkout`);
    }
    
    const user = JSON.parse(userCookie);
    console.log("User from cookie:", user.email);
    
    // Get cart items from form
    const itemsJson = formData.get("items") as string;
    if (!itemsJson) {
      redirect('/cart');
    }
    
    const items: CartItem[] = JSON.parse(itemsJson);
    
    if (items.length === 0) {
      redirect('/cart');
    }
    
    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3001';
    
    // Create Stripe line items
    const line_items = items.map((item: CartItem) => ({
      price_data: {
        currency: "eur",
        product_data: { 
          name: `${item.name} (${item.color}, ${item.size})`,
          images: item.imageUrl ? [item.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });
    
    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }
    
    // Redirect to Stripe
    redirect(session.url);
    
  } catch (error: any) {
    console.error("Checkout error:", error);
    redirect(`/checkout?error=${encodeURIComponent(error.message || 'Checkout failed')}`);
  }
};