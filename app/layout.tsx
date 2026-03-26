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
  metadataBase: new URL('https://www.himkash.com'), 

  title: "HIM-KASH | Luxury  Cashmere & Fine Wool",
  
  description: "Discover timeless elegance crafted from pure cashmere and fine wool. Handmade and hand-spun, rooted in Nepalese craftsmanship.",
  robots: {                // ← add this
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
        }
      },
  icons: {
    icon: '/himkash_red900.png',
    shortcut: '/himkash_red900.png',
    apple: '/himkash_red900.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/himkash_red900.png',
    },
  },
  openGraph: {
    title: "HIM-KASH | Luxury Cashmere & Fine Wool",
   
    description: "Himalayan Kashmere - Sustainable luxury from the mountains to your wardrobe.",
    url: "https://www.himkash.com",
    siteName: "HIM-KASH",
  },
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
