import type { Metadata, Viewport } from 'next'
import { Baloo_2, DM_Sans } from 'next/font/google'
import '@/styles/globals.css'

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-baloo',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-dm',
  display: 'swap',
})

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.chezramo.fr'
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const OG_IMAGE  = `${SITE_URL}${BASE_PATH}/og-image.png`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'Chez Ramo — Kebab, Tacos & Restaurant à Lagnieu (01150)',
    template: '%s | Chez Ramo Lagnieu',
  },

  description:
    'Chez Ramo, le restaurant kebab et tacos de Lagnieu (Ain 01150). Broche artisanale halal, galettes, burgers, spécialités balkaniques. Commande en ligne. 32 Rue Pasteur, Lagnieu — 04 27 50 00 62.',

  keywords: [
    'kebab Lagnieu', 'tacos Lagnieu', 'restaurant Lagnieu', 'où manger Lagnieu',
    'restauration rapide Lagnieu', 'kebab 01150', 'Chez Ramo', 'Chez Ramo Lagnieu',
    'restaurant Ain Lagnieu', 'kebab Ambérieu-en-Bugey', 'halal Lagnieu',
    'burger Lagnieu', 'galette Lagnieu', 'Rue Pasteur Lagnieu', 'livraison Lagnieu',
    'commander en ligne kebab', 'meilleur kebab Ain', 'Lagnieu restaurant rapide',
  ],

  authors: [{ name: 'Chez Ramo', url: SITE_URL }],
  creator: 'Chez Ramo',
  publisher: 'Chez Ramo',

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Chez Ramo',
    title: 'Chez Ramo — Kebab, Tacos & Restaurant à Lagnieu',
    description:
      'Le meilleur kebab halal de Lagnieu (01150). Broche artisanale, tacos, burgers et spécialités balkaniques. Commande en ligne rapide.',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Chez Ramo — Kebab, Tacos & Restaurant à Lagnieu' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Chez Ramo — Kebab & Tacos à Lagnieu (01150)',
    description: 'Le meilleur kebab halal de Lagnieu. Commande en ligne directe.',
    images: [OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: `${SITE_URL}/`,
    languages: { 'fr-FR': `${SITE_URL}/` },
  },

  icons: {
    icon: `${BASE_PATH}/favicon.svg`,
    shortcut: `${BASE_PATH}/favicon.svg`,
    apple: `${BASE_PATH}/favicon.svg`,
  },

  category: 'restaurant',
}

export const viewport: Viewport = {
  themeColor: '#1E4D3A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${baloo.variable} ${dmSans.variable}`}>
      <head>
        {/* Preconnects */}
        <link rel="preconnect" href="https://hqfewokpvjmxezhnurbm.supabase.co" crossOrigin="" />
        <link rel="preconnect" href="https://img.icons8.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />

        {/* Preload LCP image */}
        <link rel="preload" as="image" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/uploads/pasted-1785851492914-0.webp`} type="image/webp" fetchPriority="high" />

        {/* Geo meta — critical for local SEO */}
        <meta name="geo.region"    content="FR-01" />
        <meta name="geo.placename" content="Lagnieu, Ain, France" />
        <meta name="geo.position"  content="45.9086;5.3466" />
        <meta name="ICBM"          content="45.9086, 5.3466" />

        {/* Language */}
        <meta httpEquiv="content-language" content="fr-FR" />

        {/* Force light mode — empêche Brave/Chrome de forcer le dark mode */}
        <meta name="color-scheme" content="light" />

        {/* Favicon — explicit avec base path pour GitHub Pages */}
        <link rel="icon" href={`${BASE_PATH}/favicon.svg`} type="image/svg+xml" />
        <link rel="shortcut icon" href={`${BASE_PATH}/favicon.svg`} />
      </head>
      <body style={{ fontFamily: 'var(--font-dm), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
