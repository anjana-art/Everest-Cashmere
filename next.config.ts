// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Use remotePatterns instead of domains (recommended by Next.js)
    remotePatterns: [
      // Stripe images
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        pathname: '/**',
      },
      // Cloudinary images (for your new image uploads)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Your production domain (UPDATED)
      {
        protocol: 'https',
        hostname: 'www.himkash.com',
        pathname: '/**',
      },
      // Your domain without www (UPDATED)
      {
        protocol: 'https',
        hostname: 'himkash.com',
        pathname: '/**',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Local development with IP (keep if needed)
      {
        protocol: 'http',
        hostname: '192.168.1.6',
        port: '3000',
        pathname: '/**',
      },
      // Placeholder images
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      // For uploaded images in public folder (local development only)
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.himkash.com',
        pathname: '/uploads/**',
      },
    ],
    // Keep domains for backward compatibility
    domains: [
      'files.stripe.com',
      'res.cloudinary.com',
      'www.himkash.com',  // UPDATED
      'himkash.com',       // UPDATED
      'localhost',
      '192.168.1.6',
      'via.placeholder.com',
    ],
  },
};

export default nextConfig;