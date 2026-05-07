// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      qualities: [75, 85, 90], // Add this line

    // Use remotePatterns instead of domains (recommended by Next.js)
    remotePatterns: [
      // Stripe images
      {
        protocol: 'https',
        hostname: 'files.stripe.com',
        pathname: '/**',
      },
      // Your production domain
      {
        protocol: 'https',
        hostname: 'www.evereste.eu',
        pathname: '/**',
      },
      // Your domain without www (if needed)
      {
        protocol: 'https',
        hostname: 'evereste.eu',
        pathname: '/**',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      // Local development with IP
      {
        protocol: 'http',
        hostname: '192.168.1.6',
        port: '3001',
        pathname: '/**',
      },
      // Any other domains you use for images
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // For placeholder images
        pathname: '/**',
      },
      // Add this for any uploaded images in public folder
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.evereste.eu',
        pathname: '/uploads/**',
      },
    ],
    // You can also keep domains for backward compatibility
    domains: [
      'files.stripe.com',
      'www.evereste.eu',
      'evereste.eu',
      'localhost',
      '192.168.1.6',
      'via.placeholder.com',
    ],
    // Optional: Disable image optimization if you have issues
    // unoptimized: true,
  },
  // Other Next.js config options...
};

export default nextConfig;