// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import CookieBanner from '@/components/CookieBanner';
import Footer from "@/components/Footer";


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
    default: "Himkash | Handmade Himalayan Cashmere & Fine Wool",
    template: "%s | HIMKASH",
  },
  description: "Discover pure cashmere and fine wool pieces, handmade in Nepal. HIM-KASH brings sustainable Himalayan luxury to a conscious European lifestyle.",
  // ... rest of your metadata
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col bg-amber-50">
        <Navbar />
        {children}
        <Footer />

        <CookieBanner />

      </body>
    </html>
  );
}