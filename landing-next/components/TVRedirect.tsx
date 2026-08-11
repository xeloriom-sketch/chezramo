'use client'

import { useEffect } from 'react'

// Redirige /?tv=1 → /tv?tv=1 pour compatibilité avec les URLs déjà sur les TVs
export default function TVRedirect() {
  useEffect(() => {
    const tv = new URLSearchParams(window.location.search).get('tv')
    if (!tv) return
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    window.location.replace(base + '/tv?tv=' + encodeURIComponent(tv))
  }, [])
  return null
}
