'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Order = {
  order_id: number
  status: 'pending' | 'preparing' | 'done' | 'cancelled' | 'collected'
  items: { name: string; qty: number; price: number }[]
  total: number
  created_at: string
}

const POLL_INTERVAL = 30
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? ''

function money(n: number) { return n.toFixed(2).replace('.', ',') + ' €' }

function getOrCreateToken(): string {
  let t = localStorage.getItem('ramo_customer_token')
  if (!t) { t = crypto.randomUUID(); localStorage.setItem('ramo_customer_token', t) }
  return t
}

/* ── Step progress bar ── */
const STEPS: { key: Order['status']; label: string; emoji: string }[] = [
  { key: 'pending',   label: 'Reçue',    emoji: '📋' },
  { key: 'preparing', label: 'En cuisine', emoji: '🔥' },
  { key: 'done',      label: 'Prête',    emoji: '✅' },
  { key: 'collected', label: 'Récupérée', emoji: '🎉' },
]

function OrderStepper({ status }: { status: Order['status'] }) {
  if (status === 'cancelled') return null
  const currentIdx = STEPS.findIndex(s => s.key === status)
  return (
    <div className="flex items-start mt-4 mb-1 px-1">
      {STEPS.map((step, i) => {
        const past   = i < currentIdx
        const active = i === currentIdx
        const future = i > currentIdx
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all duration-300 ${
                active  ? 'bg-brand text-white shadow-[0_4px_12px_rgba(30,77,58,0.35)] scale-110' :
                past    ? 'bg-green-500 text-white' :
                          'bg-gray-100 text-gray-300'
              }`}>
                {past ? '✓' : step.emoji}
              </div>
              <span className={`text-[9px] font-bold text-center leading-tight transition-colors ${
                active ? 'text-brand' : past ? 'text-green-600' : 'text-gray-300'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 mb-5 rounded-full transition-all duration-500 ${
                i < currentIdx ? 'bg-green-400' : 'bg-gray-100'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Refresh ring — arc SVG countdown ── */
function RefreshRing({ seconds, total, spinning }: { seconds: number; total: number; spinning: boolean }) {
  const r = 10
  const circ = 2 * Math.PI * r
  const progress = spinning ? 0 : (seconds / total)
  const dash = circ * progress
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className={spinning ? 'animate-spin' : ''} style={{ transform: spinning ? undefined : 'rotate(-90deg)' }}>
      <circle cx="14" cy="14" r={r} fill="none" stroke="#E5E7EB" strokeWidth="2.5" />
      <circle cx="14" cy="14" r={r} fill="none" stroke="#1E4D3A" strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: spinning ? 'none' : 'stroke-dasharray 1s linear' }} />
      {!spinning && (
        <text x="14" y="18" textAnchor="middle" fontSize="8" fill="#6B7280" fontWeight="700">{seconds}</text>
      )}
    </svg>
  )
}

export default function CustomerOrdersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [countdown, setCountdown]   = useState(POLL_INTERVAL)
  const [notifPerm, setNotifPerm]   = useState<NotificationPermission>('default')
  const prevStatuses = useRef<Record<number, string>>({})
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── permission ── */
  const checkPerm = useCallback(() => {
    if (typeof Notification !== 'undefined') setNotifPerm(Notification.permission)
  }, [])
  useEffect(() => {
    checkPerm()
    window.addEventListener('focus', checkPerm)
    return () => window.removeEventListener('focus', checkPerm)
  }, [checkPerm])

  /* ── Lottie script ── */
  useEffect(() => {
    if (!orders.some(o => o.status === 'preparing')) return
    if (document.querySelector('[data-dotlottie]')) return
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.4/dist/dotlottie-wc.js'
    s.type = 'module'
    s.dataset.dotlottie = '1'
    document.head.appendChild(s)
  }, [orders])

  /* ── fetch ── */
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    const token = getOrCreateToken()
    try {
      const ordersUrl = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/customer-orders` : '/api/customer/orders'
      const res = await fetch(`${ordersUrl}?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      if (!res.ok) return
      const data: Order[] = await res.json()

      data.forEach(order => {
        const prev = prevStatuses.current[order.order_id]
        if (prev && prev !== order.status && order.status === 'done') {
          triggerNotification(order.order_id)
        }
        prevStatuses.current[order.order_id] = order.status
      })

      setOrders(data)
      const readyCount = data.filter(o => o.status === 'done').length
      window.dispatchEvent(new CustomEvent('ramo-orders-ready', { detail: readyCount }))
    } catch { /* silent */ } finally {
      setLoading(false)
      setRefreshing(false)
      setCountdown(POLL_INTERVAL)
    }
  }, [])

  function triggerNotification(orderId: number) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    try {
      new Notification('Chez Ramo — Commande prête ! 🎉', {
        body: `Votre commande RMO-${orderId} est prête. Venez la récupérer !`,
        icon: `${BASE}/favicon.svg`,
        tag: `ramo-order-${orderId}`,
      })
    } catch { /* unavailable */ }
  }

  async function requestNotif() {
    if (typeof Notification === 'undefined') return
    setNotifPerm(await Notification.requestPermission())
  }

  /* ── polling + countdown ── */
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetchOrders()

    const poll = setInterval(() => fetchOrders(true), POLL_INTERVAL * 1000)

    countdownRef.current = setInterval(() => {
      setCountdown(c => (c <= 1 ? POLL_INTERVAL : c - 1))
    }, 1000)

    return () => {
      clearInterval(poll)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [open, fetchOrders])

  if (!open) return null

  const activeOrders  = orders.filter(o => !['collected', 'cancelled'].includes(o.status))
  const historyOrders = orders.filter(o =>  ['collected', 'cancelled'].includes(o.status))
  const hasActive = activeOrders.length > 0
  const needsNotif = notifPerm !== 'granted' && orders.some(o => ['pending', 'preparing'].includes(o.status))

  return (
    <div className="fixed inset-0 z-[96] flex items-end sm:items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />

      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-[1.75rem] sm:rounded-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="font-extrabold text-brand text-lg" style={{ fontFamily: 'var(--font-baloo)' }}>
              Mes commandes
            </h2>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Suivi sécurisé · chezramo.fr
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Manual refresh + countdown ring */}
            <button
              onClick={() => fetchOrders()}
              disabled={refreshing}
              className="flex items-center justify-center hover:opacity-70 transition disabled:opacity-40"
              aria-label="Actualiser"
              title={`Actualisation dans ${countdown}s`}
            >
              <RefreshRing seconds={countdown} total={POLL_INTERVAL} spinning={refreshing} />
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition ml-1"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Notification banner ── */}
        {needsNotif && (
          <div className="mx-4 mb-2 px-4 py-3 bg-brand/5 rounded-2xl border border-brand/10 flex items-center gap-3 shrink-0">
            <span className="text-xl shrink-0">🔔</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand">Soyez averti quand c'est prêt</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Notification même si vous fermez cet onglet</p>
            </div>
            <button onClick={requestNotif}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-[#163d2e] transition active:scale-95">
              Activer
            </button>
          </div>
        )}

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-2" style={{ touchAction: 'pan-y' }}>

          {loading ? (
            /* Skeleton */
            <div className="space-y-3 pt-2">
              {[1, 2].map(i => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="h-4 w-24 bg-gray-200 rounded-lg" />
                    <div className="h-5 w-28 bg-gray-100 rounded-full" />
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                  <div className="h-0.5 bg-gray-100 mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>

          ) : orders.length === 0 ? (
            /* Empty state */
            <div className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-brand/5 flex items-center justify-center">
                <svg className="w-9 h-9 text-brand/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <p className="text-base font-extrabold text-gray-700" style={{ fontFamily: 'var(--font-baloo)' }}>Aucune commande</p>
              <p className="text-xs text-gray-400 mt-1">Votre historique apparaîtra ici après votre première commande.</p>
              <button onClick={onClose}
                className="mt-5 px-6 py-2.5 rounded-full bg-brand text-white text-sm font-bold hover:bg-[#163d2e] transition active:scale-95"
                style={{ fontFamily: 'var(--font-baloo)' }}>
                Commander maintenant
              </button>
            </div>

          ) : (
            <>
              {/* ── Active orders ── */}
              {hasActive && (
                <div className="space-y-3 pt-1">
                  {activeOrders.map(order => (
                    <OrderCard key={order.order_id} order={order} />
                  ))}
                </div>
              )}

              {/* ── History ── */}
              {historyOrders.length > 0 && (
                <div className="pt-2">
                  {hasActive && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
                      Historique
                    </p>
                  )}
                  <div className="space-y-2">
                    {historyOrders.map(order => (
                      <OrderCard key={order.order_id} order={order} compact />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-gray-50 shrink-0 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-gray-300 font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Connexion chiffrée HTTPS
          </span>
          <span className="text-[10px] text-gray-300 font-medium">Chez Ramo · Lagnieu</span>
        </div>
      </div>
    </div>
  )
}

/* ── Order card ── */
function OrderCard({ order, compact = false }: { order: Order; compact?: boolean }) {
  const [expanded, setExpanded] = useState(!compact)
  const d = new Date(order.created_at)
  const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const isPending   = order.status === 'pending'
  const isPreparing = order.status === 'preparing'
  const isDone      = order.status === 'done'
  const isCollected = order.status === 'collected'
  const isCancelled = order.status === 'cancelled'

  const cardBg =
    isDone      ? 'border-green-200 bg-gradient-to-br from-green-50 to-white' :
    isPreparing ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-white' :
    isCollected ? 'border-purple-100 bg-purple-50/30' :
    isCancelled ? 'border-red-100 bg-red-50/20' :
                  'border-gray-100 bg-gray-50'

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${cardBg}`}>

      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
            isDone ? 'bg-green-100' : isPreparing ? 'bg-orange-100' : isCollected ? 'bg-purple-100' : isCancelled ? 'bg-red-100' : 'bg-gray-100'
          }`}>
            {isDone ? '✅' : isPreparing ? '🔥' : isCollected ? '🎉' : isCancelled ? '❌' : '📋'}
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-brand text-sm" style={{ fontFamily: 'var(--font-baloo)' }}>
              RMO-{order.order_id}
            </p>
            <p className="text-[10px] text-gray-400">{dateStr} · {timeStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold text-brand text-sm tabular-nums">{money(order.total)}</span>
          <svg className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">

          {/* Stepper */}
          {!isCancelled && <OrderStepper status={order.status} />}

          {/* Items */}
          <div className="bg-white/70 rounded-xl p-3 space-y-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-[11px]">
                <span className="text-gray-500">{item.qty}× <span className="text-gray-700 font-medium">{item.name}</span></span>
                <span className="text-gray-500 tabular-nums font-medium">{money(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
              <span className="text-[10px] text-gray-400 font-medium">Total payé</span>
              <span className="font-extrabold text-brand text-sm tabular-nums">{money(order.total)}</span>
            </div>
          </div>

          {/* Status blocks */}
          {isPending && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
              <span className="text-xl shrink-0">⏳</span>
              <div>
                <p className="text-amber-800 font-bold text-xs">Commande reçue</p>
                <p className="text-amber-600/70 text-[10px] mt-0.5">En attente de prise en charge par le restaurant</p>
              </div>
            </div>
          )}

          {isPreparing && (
            <div className="flex flex-col items-center gap-2 py-2 bg-white/60 rounded-xl border border-orange-100">
              {/* @ts-ignore */}
              <dotlottie-wc
                src="https://lottie.host/b8889fb6-9f19-4f59-af32-5dc97f839ee2/oKQVeXWUd1.lottie"
                style={{ width: '150px', height: '150px' }}
                autoplay
                loop
              />
              <p className="text-orange-700 font-extrabold text-sm" style={{ fontFamily: 'var(--font-baloo)' }}>
                En cours de préparation…
              </p>
              <p className="text-orange-400 text-[10px] pb-2">Votre commande sera bientôt prête !</p>
            </div>
          )}

          {isDone && (
            <div className="flex items-center gap-3 px-4 py-4 bg-green-600 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">🎉</div>
              <div>
                <p className="text-white font-extrabold text-sm" style={{ fontFamily: 'var(--font-baloo)' }}>Votre commande est prête !</p>
                <p className="text-white/70 text-[10px] mt-0.5">Venez la récupérer au restaurant — 32 rue Pasteur, Lagnieu</p>
              </div>
            </div>
          )}

          {isCollected && (
            <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
              <span className="text-xl shrink-0">✅</span>
              <div>
                <p className="text-purple-800 font-bold text-xs">Commande récupérée</p>
                <p className="text-purple-500/70 text-[10px] mt-0.5">Merci pour votre visite — à bientôt chez Ramo !</p>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <span className="text-xl shrink-0">❌</span>
              <div>
                <p className="text-red-700 font-bold text-xs">Commande annulée</p>
                <p className="text-red-400/70 text-[10px] mt-0.5">Contactez le restaurant pour plus d'informations</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
