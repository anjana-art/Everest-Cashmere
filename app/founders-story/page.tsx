import FoundersStory from "@/components/foundersStory";

// 1. Export Meta Data for Google Search Engine Optimization
export const metadata = {
  title: "Anjana Bhatta – Founder's Story | Himkash",
  description: "Learn about Anjana Bhatta, founder of Himkash, bridging authentic Nepalese cashmere and fine wool craftsmanship with European fashion.",
  keywords: ["Anjana Bhatta", "Himkash founder", "Cashmere Nepal", "Sustainable Luxury"],
  openGraph: {
    title: "Anjana Bhatta – Founder's Story | Himkash",
    description: "Learn about Anjana Bhatta, founder of Himkash.",
    url: "https://www.himkash.com/founders-story",
    siteName: "Himkash",
    images: [
      {
        url: "https://www.himkash.com/Anjana_proff_image.webp",
        width: 800,
        height: 800,
        alt: "Anjana Bhatta - Founder of Himkash",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anjana Bhatta – Founder's Story | Himkash",
    description: "Read the story of Anjana Bhatta, founder of Himkash.",
    images: ["https://www.himkash.com/Anjana_proff_image.webp"],
  },
};

export default function About() {
  // This will log in your server/terminal output during page requests
  console.log("Rendering Founder's Story page on the server...");

  return (
    <main>
      <FoundersStory />
    </main>
  );
}