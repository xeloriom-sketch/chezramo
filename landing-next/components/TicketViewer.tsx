'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { type SavedTicket } from './CheckoutModal'

type OrderStatus = 'pending' | 'preparing' | 'done' | 'cancelled' | 'collected'
type LiveOrder   = { order_id: number; status: OrderStatus }

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? ''

function money(n: number) { return n.toFixed(2).replace('.', ',') + ' €' }

function loadTickets(): SavedTicket[] {
  try { return JSON.parse(localStorage.getItem('ramo_tickets') || '[]') } catch { return [] }
}
function getToken(): string | null {
  try { return localStorage.getItem('ramo_customer_token') } catch { return null }
}

/* ── Stepper (sans emojis) ── */
const STEPS = [
  { key: 'pending',   label: 'Reçue'     },
  { key: 'preparing', label: 'En cuisine' },
  { key: 'done',      label: 'Prête'     },
  { key: 'collected', label: 'Récupérée' },
] as const

/* Icônes SVG pour chaque étape */
function StepIcon({ step, size = 14 }: { step: number; size?: number }) {
  if (step === 0) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
    </svg>
  )
  if (step === 1) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  )
  if (step === 2) return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
      <path d="M12 22V7"/>
    </svg>
  )
}

function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return null
  const idx = STEPS.findIndex(s => s.key === status)
  return (
    <div className="flex items-start mt-3 px-0.5">
      {STEPS.map((step, i) => {
        const past   = i < idx
        const active = i === idx
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 shrink-0 w-10">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                active ? 'bg-brand text-white shadow-[0_4px_10px_rgba(30,77,58,0.35)] scale-110'
                       : past ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-300'
              }`}>
                {past
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <StepIcon step={i} size={13} />
                }
              </div>
              <span className={`text-[8px] font-bold text-center leading-tight ${
                active ? 'text-brand' : past ? 'text-green-600' : 'text-gray-300'
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 mb-4 rounded-full transition-all duration-500 ${i < idx ? 'bg-green-400' : 'bg-gray-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Lottie — attend que le custom element soit enregistré avant de le créer ── */
function LottiePrep() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [wcReady, setWcReady] = useState(false)

  useEffect(() => {
    if (typeof customElements === 'undefined') return
    if (customElements.get('dotlottie-wc')) { setWcReady(true); return }
    customElements.whenDefined('dotlottie-wc').then(() => setWcReady(true)).catch(() => {})
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !wcReady) return
    el.innerHTML = ''
    const wc = document.createElement('dotlottie-wc')
    wc.setAttribute('src', 'https://lottie.host/b8889fb6-9f19-4f59-af32-5dc97f839ee2/oKQVeXWUd1.lottie')
    wc.setAttribute('autoplay', '')
    wc.setAttribute('loop', '')
    wc.style.cssText = 'width:280px;height:280px;display:block;margin:0 auto'
    el.appendChild(wc)
  }, [wcReady])

  return (
    <div className="flex flex-col items-center py-2">
      <div ref={containerRef} style={{ width: 280, height: wcReady ? 280 : 0, transition: 'height .3s' }} />
      {!wcReady && (
        <div style={{ width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '4px solid #FED7AA', borderTopColor: '#EA580C', animation: 'lottie-spin 1s linear infinite' }} />
        </div>
      )}
      <p style={{ color: '#c2410c', fontWeight: 800, fontSize: 14, textAlign: 'center', marginTop: 6, fontFamily: "'Baloo 2',system-ui" }}>En cours de préparation…</p>
      <p style={{ color: '#fb923c', fontSize: 11, textAlign: 'center', paddingBottom: 4 }}>Votre commande sera bientôt prête !</p>
    </div>
  )
}

/* ── Status block ── */
function StatusBlock({ status }: { status: OrderStatus }) {
  if (status === 'pending') return (
    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl mt-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <div>
        <p className="text-amber-800 font-bold text-xs">Commande reçue</p>
        <p className="text-amber-600/70 text-[10px] mt-0.5">En attente de prise en charge par le restaurant</p>
      </div>
    </div>
  )
  if (status === 'preparing') return (
    <div className="mt-3 bg-orange-50 border border-orange-100 rounded-xl overflow-hidden">
      <LottiePrep />
    </div>
  )
  if (status === 'done') return (
    <div className="flex items-center gap-3 px-4 py-4 bg-green-600 rounded-xl mt-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div>
        <p className="text-white font-extrabold text-sm" style={{ fontFamily: 'var(--font-baloo)' }}>Votre commande est prête !</p>
        <p className="text-white/70 text-[10px] mt-0.5">Venez la récupérer — 32 rue Pasteur, Lagnieu</p>
      </div>
    </div>
  )
  if (status === 'collected') return (
    <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl mt-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></svg>
      </div>
      <div>
        <p className="text-purple-800 font-bold text-xs">Commande récupérée</p>
        <p className="text-purple-500/70 text-[10px] mt-0.5">Merci — à bientôt chez Ramo !</p>
      </div>
    </div>
  )
  if (status === 'cancelled') return (
    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl mt-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
      <div>
        <p className="text-red-700 font-bold text-xs">Commande annulée</p>
        <p className="text-red-400/70 text-[10px] mt-0.5">Contactez le restaurant pour plus d'informations</p>
      </div>
    </div>
  )
  return null
}

/* ── Ticket card ── */
function TicketCard({ ticket, liveStatus, onPickedUp }: {
  ticket: SavedTicket
  liveStatus: OrderStatus | null
  onPickedUp: () => void
}) {
  const d = new Date(ticket.date)
  const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const [confirming, setConfirming] = useState(false)

  const status     = liveStatus ?? 'pending'
  const isDone     = status === 'done'
  const isPreparing = status === 'preparing'
  const isCollected = status === 'collected'
  const isCancelled = status === 'cancelled'

  const borderCls =
    isDone      ? 'border-green-200' :
    isPreparing ? 'border-orange-200' :
    isCollected ? 'border-purple-200' :
    isCancelled ? 'border-red-100' :
                  'border-gray-100'

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${borderCls}`} style={{ boxShadow: '0 2px 12px rgba(30,77,58,0.08)' }}>

      {/* Header vert */}
      <div className="bg-brand px-5 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-cream font-extrabold text-base tracking-wide" style={{ fontFamily: 'var(--font-baloo)' }}>
            RMO-{ticket.orderId}
          </p>
          <p className="text-cream/50 text-[10px] uppercase tracking-widest mt-0.5">{dateStr} à {timeStr}</p>
        </div>
        {/* Badge statut */}
        {status === 'preparing' && (
          <span className="px-3 py-1 rounded-full bg-orange-400 text-white text-[10px] font-extrabold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />En préparation
          </span>
        )}
        {status === 'done' && (
          <span className="px-3 py-1 rounded-full bg-green-400 text-white text-[10px] font-extrabold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />Prête !
          </span>
        )}
        {status === 'collected' && (
          <span className="px-3 py-1 rounded-full bg-purple-400 text-white text-[10px] font-extrabold">✓ Récupérée</span>
        )}
        {status === 'cancelled' && (
          <span className="px-3 py-1 rounded-full bg-red-400 text-white text-[10px] font-extrabold">Annulée</span>
        )}
        {status === 'pending' && (
          <span className="px-3 py-1 rounded-full bg-accent text-brand text-[10px] font-extrabold">En attente</span>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Stepper (seulement si le statut est connu depuis Supabase) */}
        {liveStatus && <OrderStepper status={status} />}

        {/* Articles */}
        <div className={`space-y-1.5 ${liveStatus ? 'border-t border-gray-100 pt-3 mt-3' : ''}`}>
          {ticket.cart.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex gap-2 min-w-0">
                <span className="text-brand/40 font-bold text-xs w-5 shrink-0">{item.qty}×</span>
                <span className="text-brand text-xs font-medium truncate">{item.name}</span>
              </div>
              <span className="text-brand text-xs font-bold shrink-0 tabular-nums">{money(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">Total payé</span>
          <span className="text-brand font-extrabold text-lg tabular-nums" style={{ fontFamily: 'var(--font-baloo)' }}>{money(ticket.total)}</span>
        </div>

        {/* Bloc statut (animation, bandeaux…) */}
        {liveStatus && <StatusBlock status={status} />}

        {/* Bouton récupéré */}
        {!isCollected && !isCancelled && (
          <div className="mt-3">
            {confirming ? (
              <div className="flex gap-2">
                <button onClick={() => setConfirming(false)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-bold hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button onClick={onPickedUp}
                  className="flex-1 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition">
                  Confirmer
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand/5 border border-brand/15 text-brand text-xs font-bold hover:bg-brand/10 transition">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                J'ai récupéré ma commande
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Main ── */
const POLL = 30

export default function TicketViewer() {
  const [open, setOpen]         = useState(false)
  const [tickets, setTickets]   = useState<SavedTicket[]>([])
  const [statusMap, setStatusMap] = useState<Record<number, OrderStatus>>({})
  const [countdown, setCountdown] = useState(POLL)
  const [refreshing, setRefreshing] = useState(false)
  const prevStatuses = useRef<Record<number, string>>({})

  const refresh = () => setTickets(loadTickets())

  /* Charger le script Lottie une seule fois */
  useEffect(() => {
    if (document.querySelector('[data-dotlottie]')) return
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.4/dist/dotlottie-wc.js'
    s.type = 'module'
    s.dataset.dotlottie = '1'
    document.head.appendChild(s)
  }, [])

  const fetchStatuses = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setRefreshing(true)
    try {
      const ordersUrl = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/customer-orders` : '/api/customer/orders'
      const res = await fetch(`${ordersUrl}?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data: LiveOrder[] = await res.json()
      const map: Record<number, OrderStatus> = {}
      data.forEach(o => {
        const prev = prevStatuses.current[o.order_id]
        if (prev && prev !== o.status && o.status === 'done') {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try { new Notification('Chez Ramo 🎉', { body: `Commande RMO-${o.order_id} prête !`, icon: `${BASE}/favicon.svg`, tag: `ramo-${o.order_id}` }) } catch {}
          }
        }
        prevStatuses.current[o.order_id] = o.status
        map[o.order_id] = o.status
      })
      setStatusMap(map)
      const readyCount = data.filter(o => o.status === 'done').length
      window.dispatchEvent(new CustomEvent('ramo-orders-ready', { detail: readyCount }))
    } catch {} finally {
      setRefreshing(false)
      setCountdown(POLL)
    }
  }, [])

  useEffect(() => {
    refresh()
    const onUpdate = () => refresh()
    const onOpen   = () => { refresh(); setOpen(true) }
    window.addEventListener('ramo-tickets-updated', onUpdate)
    window.addEventListener('open-tickets', onOpen)
    window.addEventListener('open-orders', onOpen)   // le bouton horloge ouvre le même modal
    return () => {
      window.removeEventListener('ramo-tickets-updated', onUpdate)
      window.removeEventListener('open-tickets', onOpen)
      window.removeEventListener('open-orders', onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    fetchStatuses()
    const poll = setInterval(() => fetchStatuses(), POLL * 1000)
    const cd   = setInterval(() => setCountdown(c => c <= 1 ? POLL : c - 1), 1000)
    return () => { clearInterval(poll); clearInterval(cd) }
  }, [open, fetchStatuses])

  const markCollected = useCallback(async (ticket: SavedTicket) => {
    const token = getToken()
    if (token) {
      try {
        const patchUrl = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/customer-orders` : '/api/customer/orders'
        await fetch(patchUrl, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, order_id: ticket.orderId }),
        })
      } catch { /* silent — on supprime quand même localement */ }
    }
    const updated = tickets.filter(t => t.id !== ticket.id)
    localStorage.setItem('ramo_tickets', JSON.stringify(updated))
    setTickets(updated)
    window.dispatchEvent(new CustomEvent('ramo-tickets-updated'))
  }, [tickets])

  if (!open) return null

  const activeCount = tickets.filter(t => {
    const s = statusMap[t.orderId]
    return !s || (s !== 'collected' && s !== 'cancelled')
  }).length

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center">
      <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" />

      <div className="relative w-full sm:max-w-md bg-[#F5ECD9] rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{ maxHeight: '88vh', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Drag handle mobile */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-brand/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 shrink-0">
          <div>
            <h2 className="font-extrabold text-xl text-brand" style={{ fontFamily: 'var(--font-baloo)' }}>Mes commandes</h2>
            <p className="text-xs text-brand/50 mt-0.5 flex items-center gap-1.5">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {activeCount === 0
                ? 'Suivi sécurisé · chezramo.fr'
                : `${activeCount} en cours · MAJ dans ${countdown}s`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => fetchStatuses()} disabled={refreshing}
              className={`w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center transition ${refreshing ? 'animate-spin opacity-40' : 'hover:bg-brand/20'}`}
              aria-label="Actualiser">
              <svg className="w-3.5 h-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-brand/10 hover:bg-brand/20 flex items-center justify-center transition">
              <svg className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 space-y-3"
          style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          {tickets.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 rounded-full bg-brand/8 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-brand/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-brand/50">Aucune commande</p>
              <p className="text-xs text-brand/30 mt-1">Vos commandes apparaîtront ici après paiement.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                liveStatus={statusMap[ticket.orderId] ?? null}
                onPickedUp={() => markCollected(ticket)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
