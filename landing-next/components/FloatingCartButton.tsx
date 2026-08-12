'use client'

import { useStore } from '@/lib/store'

export default function FloatingCartButton() {
  const { cartCount, total, openCart, cartOpen, customizer } = useStore()
  const count = cartCount()
  const money = (n: number) => n.toFixed(2).replace('.', ',') + ' €'

  if (count === 0 || cartOpen || customizer) return null

  return (
    <div className="float-cart sm:hidden">
      <button
        onClick={() => openCart()}
        className="flex items-center gap-2 sm:gap-3 bg-brand text-cream px-5 rounded-full shadow-2xl font-extrabold text-sm border-2 border-accent active:scale-95 transition-transform"
        style={{ fontFamily: 'var(--font-baloo)', height: '52px' }}
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span className="hidden xs:inline">Voir ma commande</span>
        <span className="xs:hidden">Commande</span>
        <span className="bg-accent text-brand text-xs font-extrabold px-2 py-0.5 rounded-full">{count}</span>
        <span className="font-extrabold text-accent">— {money(total())}</span>
      </button>
    </div>
  )
}
