import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.jdwebnship.com",
        pathname: "/**",
      },
    ],
  },
  compress: true,

  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@headlessui/react',
      'react-select',
      'embla-carousel-react',
    ],
  },
}

export default nextConfig;
