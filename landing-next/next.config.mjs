/** @type {import('next').NextConfig} */

// GitHub Pages static export : STATIC_EXPORT=true dans GitHub Actions
const isStatic = process.env.STATIC_EXPORT === 'true'
const BASE = isStatic ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : ''

const nextConfig = {
  ...(isStatic ? { output: 'export' } : {}),

  basePath: BASE,

  images: {
    unoptimized: isStatic,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  poweredByHeader: false,

  // headers() et redirects() ignorés en mode static export (non supportés)
  ...(!isStatic ? {
    async headers() {
      return [
        {
          source: '/uploads/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
            { key: 'Vary', value: 'Accept' },
          ],
        },
        {
          source: '/_next/static/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Frame-Options',        value: 'SAMEORIGIN' },
            { key: 'X-Content-Type-Options',  value: 'nosniff' },
            { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
            { key: 'X-XSS-Protection',        value: '1; mode=block' },
          ],
        },
        {
          source: '/api/webhook',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
          ],
        },
      ]
    },

    async redirects() {
      return []
    },
  } : {}),
}

export default nextConfig
