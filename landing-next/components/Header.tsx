'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'

function loadTicketCount(): number {
  try { return JSON.parse(localStorage.getItem('ramo_tickets') || '[]').length } catch { return 0 }
}

function hasOrders(): boolean {
  try { return !!localStorage.getItem('ramo_customer_token') } catch { return false }
}

export default function Header() {
  const { cartCount, openCart, navMenuOpen, setNavMenuOpen } = useStore()
  const count = cartCount()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastY, setLastY] = useState(0)
  const [ticketCount, setTicketCount] = useState(0)
  const [showOrdersBtn, setShowOrdersBtn] = useState(false)
  const [ordersReadyCount, setOrdersReadyCount] = useState(0)

  useEffect(() => {
    setTicketCount(loadTicketCount())
    const handler = () => setTicketCount(loadTicketCount())
    window.addEventListener('ramo-tickets-updated', handler)
    return () => window.removeEventListener('ramo-tickets-updated', handler)
  }, [])

  useEffect(() => {
    setShowOrdersBtn(hasOrders())
    const onToken = () => setShowOrdersBtn(true)
    const onReady = (e: Event) => setOrdersReadyCount((e as CustomEvent).detail ?? 0)
    window.addEventListener('ramo-customer-token', onToken)
    window.addEventListener('ramo-orders-ready', onReady)
    return () => {
      window.removeEventListener('ramo-customer-token', onToken)
      window.removeEventListener('ramo-orders-ready', onReady)
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY
      setHidden(y > lastY && y > 220)
      setScrolled(y > 90)
      setLastY(y)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [lastY])

  const links = [
    { href: '#menu',    label: 'Menu' },
    { href: '#avis',    label: 'Avis' },
    { href: '#about',   label: 'À propos' },
    { href: '#contact', label: 'Contact' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300 ${hidden && !navMenuOpen ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div
          className={`pointer-events-auto transition-all duration-400 ease-[cubic-bezier(.16,1,.3,1)] w-full ${
            scrolled
              ? 'mt-3 mx-4 max-w-3xl bg-brand rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.28)] px-3 py-1.5'
              : 'max-w-7xl px-5 sm:px-8 py-4'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <a
              href="#"
              className={`font-baloo font-extrabold tracking-wide text-cream flex-shrink-0 transition-all duration-300 ${scrolled ? 'text-base' : 'text-xl sm:text-2xl'}`}
              style={{ fontFamily: 'var(--font-baloo)' }}
            >
              CHEZ RAMO
            </a>

            <ul className="hidden md:flex items-center gap-0" style={{ fontFamily: 'var(--font-baloo)' }}>
              {links.map(l => (
                <li key={l.href}>
                  <a href={l.href} className="block px-3.5 py-2 rounded-full text-cream text-[13px] font-bold uppercase tracking-widest hover:bg-white/15 hover:text-accent transition-all duration-150">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href="#menu"
                className={`hidden sm:inline-flex items-center font-extrabold uppercase tracking-widest transition-all duration-300 rounded-full magnetic ${
                  scrolled ? 'text-[11px] px-4 py-1.5 bg-accent text-brand hover:bg-cream' : 'text-xs px-5 py-2.5 bg-accent text-brand hover:bg-cream'
                }`}
                style={{ fontFamily: 'var(--font-baloo)' }}
              >
                Commander
              </a>

              {(ticketCount > 0 || showOrdersBtn) && (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-tickets'))}
                  className={`relative rounded-full flex items-center justify-center hover:bg-white/15 transition-all duration-200 ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`}
                  aria-label="Mes commandes"
                >
                  <svg className={scrolled ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  {ordersReadyCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-green-500 text-white text-[9px] font-extrabold flex items-center justify-center badge-pulse">
                      {ordersReadyCount}
                    </span>
                  ) : ticketCount > 0 ? (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center badge-pulse">
                      {ticketCount}
                    </span>
                  ) : null}
                </button>
              )}

              <button
                onClick={() => openCart()}
                className={`relative rounded-full flex items-center justify-center hover:bg-white/15 transition-all duration-200 ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`}
                aria-label="Panier"
              >
                <svg className={scrolled ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-brand text-[9px] font-extrabold flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>

              <button
                onClick={() => setNavMenuOpen(!navMenuOpen)}
                className={`md:hidden relative rounded-full flex items-center justify-center hover:bg-white/15 transition-all duration-200 ml-1 ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`}
                aria-label="Menu"
              >
                {navMenuOpen
                  ? <svg className={scrolled ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                  : <svg className={scrolled ? 'w-4 h-4' : 'w-5 h-5'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {navMenuOpen && (
        <div
          className="nav-open fixed inset-0 z-[200] bg-[#163828] flex flex-col md:hidden overflow-hidden"
          onKeyDown={e => e.key === 'Escape' && setNavMenuOpen(false)}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 nav-link-in" style={{ animationDelay: '0ms' }}>
            <span className="font-extrabold text-xl text-cream tracking-wide" style={{ fontFamily: 'var(--font-baloo)' }}>CHEZ RAMO</span>
            <button onClick={() => setNavMenuOpen(false)} className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform" aria-label="Fermer">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
            </button>
          </div>
          <div className="h-px bg-white/10 mx-6" />
          <nav className="flex flex-col flex-1 justify-center px-6 gap-0">
            {[['#menu','Menu','01'],['#avis','Avis','02'],['#about','À propos','03'],['#contact','Contact','04']].map(([href, label, num], i) => (
              <a
                key={href}
                href={href}
                onClick={() => setNavMenuOpen(false)}
                className="nav-link-in group flex items-center justify-between py-5 border-b border-white/10 last:border-0"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <span className="font-extrabold text-[clamp(28px,7vw,36px)] text-cream uppercase tracking-wide group-hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-baloo)' }}>{label}</span>
                <span className="text-cream/30 text-xs font-mono">{num}</span>
              </a>
            ))}
          </nav>
          <div className="nav-link-in px-6 pb-10 shrink-0 space-y-3" style={{ animationDelay: '340ms' }}>
            <a href="#menu" onClick={() => setNavMenuOpen(false)}
               className="flex items-center justify-center gap-2 w-full font-extrabold text-base uppercase tracking-widest py-4 rounded-full bg-accent text-brand active:scale-[.98] transition-transform"
               style={{ fontFamily: 'var(--font-baloo)' }}>
              Commander maintenant
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <p className="text-center text-cream/30 text-xs font-mono tracking-widest">LAGNIEU · OUVERT 7J/7</p>
          </div>
        </div>
      )}
    </>
  )
}
