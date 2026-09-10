import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/navbar";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import MetaPixel from "@/components/MetaPixel";

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
    default:
      "Himkash | Himalayan Cashmere & Fine Wool | Handcrafted in Nepal, Now Available in Portugal",
    template: "%s | Himkash",
  },

  description:
    "Discover pure cashmere and fine merino wool pieces handcrafted in Nepal. Himkash brings sustainable Himalayan luxury to a conscious European lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-amber-50`}
      >
        <Navbar />

        <main className="flex-1">{children}</main>

        <Footer />

        <MetaPixel />
        <CookieBanner />
      </body>
    </html>
  );
}