import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// This is required for local development to use Cloudflare bindings
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: false,

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.jdwebnship.com",
        pathname: "/**",
      },
    ],
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
    // Ignore ESLint errors during builds to allow OpenNext build to proceed
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Also ignore TypeScript errors during builds if needed
    ignoreBuildErrors: false,
  },
  /* Your existing Next.js config options */
};

export default nextConfig;





