import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'Chez Ramo — Kebab, Tacos & Restaurant à Lagnieu'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#1E4D3A',
          fontFamily: 'system-ui, sans-serif',
          padding: '0 80px',
          position: 'relative',
        }}
      >
        {/* Background accent circles */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'rgba(232,169,59,0.12)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -40, width: 300, height: 300, borderRadius: '50%', background: 'rgba(245,236,217,0.06)', display: 'flex' }} />

        {/* Tagline */}
        <div style={{ color: 'rgba(232,169,59,0.85)', fontSize: 22, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 20, display: 'flex' }}>
          32 Rue Pasteur · Lagnieu · 01150
        </div>

        {/* Brand name */}
        <div style={{ color: '#F5ECD9', fontSize: 110, fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', display: 'flex' }}>
          CHEZ RAMO
        </div>

        {/* Subtitle */}
        <div style={{ color: '#E8A93B', fontSize: 36, fontWeight: 700, marginTop: 28, letterSpacing: '0.06em', display: 'flex' }}>
          Kebab · Tacos · Burgers · Halal
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 48, display: 'flex', alignItems: 'center',
          background: '#E8A93B', color: '#1E4D3A',
          padding: '18px 48px', borderRadius: 999,
          fontSize: 24, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Commander en ligne · chezramo.fr
        </div>

        {/* Bottom rating */}
        <div style={{ position: 'absolute', bottom: 40, left: 80, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: '#E8A93B', fontSize: 28, display: 'flex' }}>★★★★</div>
          <div style={{ color: 'rgba(245,236,217,0.6)', fontSize: 18, display: 'flex' }}>161 avis Google</div>
        </div>

        {/* Phone */}
        <div style={{ position: 'absolute', bottom: 40, right: 80, color: 'rgba(245,236,217,0.6)', fontSize: 20, display: 'flex' }}>
          04 27 50 00 62
        </div>
      </div>
    ),
    { ...size }
  )
}
