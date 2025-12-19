import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',

  // 🔄 Image Optimization für bessere Performance
  images: {
    formats: ['image/avif', 'image/webp'], // Modern Formate für bessere Kompression
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: true, // Externe Backend-Images nicht optimieren (400 error fix)
    minimumCacheTTL: 31536000, // 1 Jahr Cache für optimierte Images
  },

  // 📦 CDN & Caching Header Konfiguration
  headers: async () => [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable', // 1 Jahr für versionierte Assets
        },
      ],
    },
    {
      source: '/fonts/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Content-Type',
          value: 'font/woff2',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // 🎯 Compression & Performance
  compress: true,
  poweredByHeader: false, // Verstecke Next.js version

  reactCompiler: true,

  // 📊 Bundle Analyze (optional - für Debugging)
  experimental: {
    optimizeCss: true, // Optimiere CSS
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'], // Tree-shake diese packages
  },
};

export default nextConfig;
