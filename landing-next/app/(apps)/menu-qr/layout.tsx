import '@/styles/globals.css'
import { Baloo_2, DM_Sans } from 'next/font/google'

const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-baloo',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm',
  display: 'swap',
})

// Layout non-racine : pas de <html>/<body>, juste les fonts + globals CSS
export default function MenuQRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${baloo.variable} ${dmSans.variable}`}
      style={{ fontFamily: 'var(--font-dm), system-ui, sans-serif' }}
    >
      {children}
    </div>
  )
}
