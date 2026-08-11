import type { Metadata, Viewport } from 'next'
import AdminClient from './AdminClient'

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  title: 'Chez Ramo — Admin',
  robots: 'noindex, nofollow',
  manifest: `${BASE_PATH}/admin-manifest.json`,
  appleWebApp: {
    capable: true,
    title: 'Ramo Admin',
    statusBarStyle: 'default',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#1E4D3A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function AdminPage() {
  return <AdminClient />
}
