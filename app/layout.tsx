import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.himkash.com"),

  title: {
    default: "HIM-KASH | Handmade Himalayan Cashmere & Fine Wool",
    template: "%s | HIM-KASH",
  },

  description:
    "Discover pure cashmere and fine wool pieces, handmade in Nepal. HIM-KASH brings sustainable Himalayan luxury to a conscious European lifestyle.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    siteName: "HIM-KASH",
    url: "/",
    locale: "en_GB",
    title: "HIM-KASH | Handmade Himalayan Cashmere & Fine Wool",
    description:
      "Pure cashmere and fine wool. Handmade in Nepal, designed for a conscious European lifestyle.",
    images: [
      {
        url: "/og-himkash.jpg",
        width: 1200,
        height: 630,
        alt: "HIM-KASH Luxury Cashmere",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "HIM-KASH | Himalayan Cashmere & Fine Wool",
    description:
      "Handmade cashmere from the Himalayas. Sustainable, timeless, conscious luxury.",
    images: ["/og-himkash.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  keywords: [
    "HIM-KASH",
    "Himalayan cashmere",
    "handmade cashmere",
    "sustainable wool clothing",
    "Nepalese luxury fashion",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col bg-amber-50 ">

       <Navbar/>
        <main className=" flex-grow container max-auto px-4 py-8">
        {children}
        </main>
      </body>
    </html>
  );
}
