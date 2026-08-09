import type { Metadata, Viewport } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Chez Ramo — Menu',
  robots: 'noindex',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function TVPage() {
  return (
    <>
      {/* TV-specific fonts & styles injected into <head> by Next.js streaming */}
      <link rel="preconnect" href="https://hqfewokpvjmxezhnurbm.supabase.co" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=Anton&family=Nunito:wght@600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,600&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/tv/style.css" />

      <div id="app">
        <div id="header">
          <div id="brand">CHEZ <span>RAMO</span></div>
          <div id="clock">--:--</div>
        </div>
        <div id="viewport"></div>
        <div id="progress-wrap">
          <div id="progress-bar"></div>
        </div>
        {/* TV3 pub mode container */}
        <div id="pub-cols"></div>
      </div>

      {/* TV menu logic — vanilla JS, runs after hydration */}
      <Script src="/tv/menu.js" strategy="afterInteractive" />

      {/* Service Worker registration */}
      <Script id="sw-init" strategy="afterInteractive">{`
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(reg) {
              reg.addEventListener('updatefound', function() {
                var newSW = reg.installing;
                newSW.addEventListener('statechange', function() {
                  if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                    newSW.postMessage('SKIP_WAITING');
                  }
                });
              });
            }).catch(function() {});
            var refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', function() {
              if (!refreshing) { refreshing = true; location.reload(true); }
            });
          });
        }
      `}</Script>
    </>
  )
}
