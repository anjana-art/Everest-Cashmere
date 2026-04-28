// app/checkout/checkout-action.ts
"use server";

import { stripe } from "@/lib/stripe";
import { CartItem } from "@/store/cart-store";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const checkoutAction = async (formData: FormData): Promise<void> => {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;

    if (!userCookie) {
      redirect(`/login?callbackUrl=/checkout`);
    }

    const user = JSON.parse(userCookie);

    const itemsJson = formData.get("items") as string;
    if (!itemsJson) redirect('/cart');

    const items: CartItem[] = JSON.parse(itemsJson);
    if (items.length === 0) redirect('/cart');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3001');

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      currency: "eur",
      customer_email: user.email,

      // ✅ LAYER 2: Portugal-only restriction
      shipping_address_collection: {
        allowed_countries: ["PT"],
      },
      billing_address_collection: "required",

      phone_number_collection: {
        enabled: true,
      },

      metadata: {
        userId: user.id,
        userEmail: user.email,
      },

      // Professional Portuguese/English custom text shown on Stripe checkout page
      custom_text: {
        shipping_address: {
          message: "🇵🇹 Este serviço está disponível apenas em Portugal. / This service is available in Portugal only.",
        },
        submit: {
          message: "A sua encomenda será processada em euros (EUR). Entrega disponível apenas em Portugal.",
        },
      },

      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    redirect(session.url);

  } catch (error: any) {
    // Don't intercept Next.js redirect — it throws internally
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;

    console.error("Checkout error:", {
      message: error.message,
      userId: (() => {
        try {
          const c = cookies();
          // @ts-ignore
          const u = c.get?.('user')?.value;
          return u ? JSON.parse(u).id : 'unknown';
        } catch { return 'unknown'; }
      })(),
    });

    redirect(`/checkout?error=${encodeURIComponent(error.message || 'Checkout failed')}`);
  }
};