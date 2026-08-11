/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver unoptimized permet à Next.js de servir avec les bons headers
  // Les images du site utilisent <picture> + WebP manuellement — pas de régression
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Supprimer le header X-Powered-By (cache la tech stack)
  poweredByHeader: false,

  async headers() {
    return [
      /* ── Uploads & images statiques : cache 1 an ── */
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          { key: 'Vary', value: 'Accept' },
        ],
      },
      /* ── Fonts & assets Next.js ── */
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      /* ── Pages publiques ── */
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',     value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy',     value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',  value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection',    value: '1; mode=block' },
        ],
      },
      /* ── Webhook Stripe ── */
      {
        source: '/api/webhook',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Canonicalize www vers non-www (ou l'inverse selon votre DNS)
      // À activer quand le domaine est configuré
      // { source: '/(.*)', has: [{ type: 'host', value: 'chezramo.fr' }], destination: 'https://www.chezramo.fr/:path*', permanent: true },
    ]
  },
}

export default nextConfig
