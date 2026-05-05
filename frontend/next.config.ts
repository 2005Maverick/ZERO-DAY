import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Move the Next.js dev indicator out of the way of the live-room order ticket
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'radix-ui'],
  },
};

export default nextConfig;
