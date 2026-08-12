'use client'

import { useStore } from '@/lib/store'

export default function CartSidebar() {
  const { cart, cartOpen, cartCount, total, closeCart, stepItem, openCheckout } = useStore()
  const count = cartCount()
  const money = (n: number) => n.toFixed(2).replace('.', ',') + ' €'


  if (!cartOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-stretch sm:justify-end">
      <div onClick={() => closeCart()} className="absolute inset-0 bg-brand/55 backdrop-blur-sm cursor-pointer" />

      <div className="relative w-full sm:w-[min(430px,50vw)] bg-cream flex flex-col shadow-2xl anim-sheet-up rounded-t-[2rem] sm:rounded-none h-[90vh] sm:h-full border-t-2 sm:border-t-0 sm:border-l-2 border-brand">
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-brand/25" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-brand/15 shrink-0">
          <h2 className="font-extrabold text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-baloo)' }}>VOTRE COMMANDE</h2>
          <div className="flex items-center gap-2">
            {count > 0 && (
              <span className="text-xs font-bold text-[#8A8A8A] bg-brand/10 px-3 py-1 rounded-full">
                {count} article{count > 1 ? 's' : ''}
              </span>
            )}
            <button onClick={() => closeCart()} className="w-11 h-11 rounded-full border-2 border-brand bg-transparent hover:bg-accent transition flex items-center justify-center active:scale-90">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-hide" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-14 h-14 mx-auto mb-3 text-brand/25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/></svg>
              <p className="text-sm font-bold text-brand">Votre panier est vide</p>
              <p className="text-xs text-[#8A8A8A] mt-1">Ajoutez des plats depuis la carte.</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={item.key} className="flex items-start gap-3 p-4 rounded-2xl border-2 border-brand/20 bg-brand/5 cart-item-in">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold uppercase leading-tight">{item.name.split(' · ')[0]}</h4>
                  {item.name.includes(' · ') && (
                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">{item.name.split(' · ').slice(1).join(' · ')}</p>
                  )}
                  <p className="text-sm font-bold text-brand mt-1">{money(item.price)} / unité</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => stepItem(idx, -1)} className="w-10 h-10 rounded-full border-2 border-brand bg-transparent font-bold hover:bg-accent transition flex items-center justify-center text-base active:scale-90">–</button>
                  <span className="min-w-[24px] text-center font-extrabold text-base" style={{ fontFamily: 'var(--font-baloo)' }}>{item.qty}</span>
                  <button onClick={() => stepItem(idx, 1)} className="w-10 h-10 rounded-full bg-brand text-cream font-bold hover:bg-accent hover:text-brand transition flex items-center justify-center text-base active:scale-90">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 pb-safe pt-4 border-t-2 border-brand/15 space-y-3 shrink-0" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-between text-sm text-[#8A8A8A]">
            <span>À emporter · Chez Ramo</span>
            <span className="text-xs text-[#8A8A8A]">Retrait au restaurant</span>
          </div>
          <div className="flex justify-between font-extrabold text-2xl pt-1 border-t border-brand/15" style={{ fontFamily: 'var(--font-baloo)' }}>
            <span>Total</span>
            <span>{money(total())}</span>
          </div>
          <button
            onClick={() => openCheckout()}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-full border-2 border-brand bg-brand text-cream text-sm font-extrabold uppercase tracking-widest transition ${cart.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-accent hover:text-brand btn-hover-scale'}`}
            style={{ fontFamily: 'var(--font-baloo)' }}
          >
            Passer la commande
          </button>
          <p className="text-center text-[10px] tracking-[.08em] text-[#8A8A8A]">Paiement sécurisé · Apple Pay · Google Pay</p>
        </div>
      </div>
    </div>
  )
}
