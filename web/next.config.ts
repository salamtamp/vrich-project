import { svgrOptions } from './svg.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: process.cwd(),

  reactStrictMode: false,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // add image optimization
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Development (Turbopack - stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: svgrOptions,
          },
        ],
        as: '*.js',
      },
    },
  },

  // Production (Webpack)
  webpack: (config: any, opts: { isServer: boolean }) => {
    const { isServer } = opts;
    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        dgram: false,
      };
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: svgrOptions,
        },
      ],
    });

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  experimental: {
    // Package imports optimization
    optimizePackageImports: ['lodash', 'date-fns', 'lucide-react', '@radix-ui/react-icons'],

    // Server components improvements
    serverComponentsHmrCache: true,

    // Better tree shaking
    optimizeServerReact: true,
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: ['msw'],

  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.CDN_URL : '',
};

export default nextConfig;
