import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: false,

  compiler: {
    removeConsole: true,
  },

  images: {
    // ✅ Let Next.js handle optimization (if your hosting supports it)
    unoptimized: true, // IMPORTANT: Change this!
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.jdwebnship.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // ✅ 1 year cache
  },

  compress: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@headlessui/react",
      "react-select",
      "embla-carousel-react",
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
