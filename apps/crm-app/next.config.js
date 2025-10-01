/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output Configuration for Vercel
  output: 'standalone',

  // TypeScript Configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint Configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Performance Optimizations
  poweredByHeader: false,

  // Security Headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],

  // Environment Variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental Features
  experimental: {
    // Runtime configuration
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Image Configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Bundle Analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
        }
      }
      return config
    },
  }),
}

module.exports = nextConfig
