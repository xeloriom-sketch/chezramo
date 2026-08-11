import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/diaporama', '/tv', '/menu-qr'],
      },
    ],
    sitemap: 'https://www.chezramo.fr/sitemap.xml',
    host: 'https://www.chezramo.fr',
  }
}
