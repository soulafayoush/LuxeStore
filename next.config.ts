import type { NextConfig } from "next";

const nextConfig: NextConfig = {


  // Enable React strict mode for catching potential issues
  reactStrictMode: true,

  // Allow cross-origin requests from preview domains
  allowedDevOrigins: ['https://preview-*.space.chatglm.site', '*.space.z.ai'],

  // Keep existing: TypeScript settings
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.space.chatglm.site',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'date-fns',
    ],
  },

  // Headers for security and caching
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    // Build CSP directives
    const cspDirectives = [
      // Default: restrict to same origin
      "default-src 'self'",

      // Scripts: Next.js inline scripts, Stripe.js, development eval
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
        : "script-src 'self' 'unsafe-inline' https://js.stripe.com",

      // Styles: Next.js inline styles, Google Fonts
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

      // Images: self + Unsplash + preview domains + any data: URIs
      "img-src 'self' data: blob: https://images.unsplash.com https://*.space.chatglm.site https://*.space.z.ai",

      // Fonts: self + Google Fonts
      "font-src 'self' https://fonts.gstatic.com",

      // Connect: API calls, Stripe, preview domains
      "connect-src 'self' https://api.stripe.com https://js.stripe.com https://*.space.chatglm.site https://*.space.z.ai",

      // Frames: Stripe checkout + preview iframe embedding
      "frame-src https://js.stripe.com https://*.space.chatglm.site https://*.space.z.ai",

      // Frame ancestors: allow preview system to embed via iframe
      "frame-ancestors 'self' https://*.space.chatglm.site https://*.space.z.ai",

      // Objects: none (block plugin content)
      "object-src 'none'",

      // Base URI: restrict to same origin
      "base-uri 'self'",

      // Form action: restrict to same origin + Stripe
      "form-action 'self' https://checkout.stripe.com",

      // Upgrade insecure requests in production
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ];

    const cspValue = cspDirectives.join('; ');

    // Permissions-Policy: restrict browser features
    const permissionsPolicy = [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=(self "https://js.stripe.com")',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'encrypted-media=()',
      'picture-in-picture=()',
      'fullscreen=(self)',
    ].join(', ');

    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers (existing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Content Security Policy
          { key: 'Content-Security-Policy', value: cspValue },

          // Permissions Policy
          { key: 'Permissions-Policy', value: permissionsPolicy },

          // Strict-Transport-Security (production only)
          ...(isDev
            ? []
            : [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]),

          // Cross-origin policies
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Compression
  compress: true,
};

export default nextConfig;
