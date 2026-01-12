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
  // Set empty turbopack config to use webpack instead
  // Next.js 16 enables Turbopack by default, but we need webpack for custom optimization
  turbopack: undefined,
  // Optimize bundle splitting to reduce number of JS files
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize chunk splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Group vendor libraries together
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Group common components together
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate large libraries
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Group Next.js chunks
            nextjs: {
              name: 'nextjs',
              test: /[\\/]node_modules[\\/](next)[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
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
