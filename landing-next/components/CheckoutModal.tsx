'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStore } from '@/lib/store'
import { useRef, useEffect, useState, useCallback } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? '/api'

function money(n: number) { return n.toFixed(2).replace('.', ',') + ' €' }

export type SavedTicket = {
  id: number
  orderId: number
  cart: { name: string; price: number; qty: number }[]
  total: number
  date: string
}

function generateTicketHTML(orderId: number, cart: SavedTicket['cart'], total: number): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const rows = cart.map(i => `<tr><td class="td-qty">${i.qty}×</td><td class="td-name">${i.name}</td><td class="td-price">${money(i.price * i.qty)}</td></tr>`).join('')
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Ticket RMO-${orderId}</title><style>*{box-sizing:border-box;margin:0;padding:0}@page{size:A4 portrait;margin:0}html,body{width:210mm;height:297mm;font-family:'Helvetica Neue',Arial,sans-serif;background:#F5ECD9;color:#1E4D3A}.page{width:210mm;height:297mm;display:flex;flex-direction:column}.header{background:#1E4D3A;color:#F5ECD9;padding:18mm 22mm 14mm;flex-shrink:0}.logo{font-size:36pt;font-weight:900;letter-spacing:.06em}.tagline{font-size:9pt;letter-spacing:.18em;text-transform:uppercase;opacity:.6;margin-top:3mm}.order-badge{display:inline-block;background:rgba(245,236,217,.15);border:2px solid rgba(245,236,217,.3);color:#F5ECD9;font-size:9pt;font-weight:800;letter-spacing:.12em;padding:3mm 6mm;border-radius:99mm}.order-num{font-size:22pt;font-weight:900;margin-top:3mm}.meta{padding:7mm 22mm;display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px dashed rgba(30,77,58,.25);flex-shrink:0}.meta-label{font-size:8pt;text-transform:uppercase;letter-spacing:.15em;opacity:.45;margin-bottom:1.5mm}.meta-val{font-size:11pt;font-weight:700}.items{padding:6mm 22mm;flex:1;display:flex;flex-direction:column}.section-label{font-size:8pt;text-transform:uppercase;letter-spacing:.15em;opacity:.4;margin-bottom:4mm}table{width:100%;border-collapse:collapse}.td-qty{width:14mm;font-size:11pt;font-weight:700;color:rgba(30,77,58,.45);padding:4mm 4mm 4mm 0;vertical-align:top;border-bottom:1px solid rgba(30,77,58,.1)}.td-name{font-size:12pt;padding:4mm;vertical-align:top;border-bottom:1px solid rgba(30,77,58,.1);line-height:1.4}.td-price{text-align:right;font-size:13pt;font-weight:800;white-space:nowrap;padding:4mm 0 4mm 6mm;vertical-align:top;border-bottom:1px solid rgba(30,77,58,.1)}.total-bar{margin:0 22mm;padding:7mm 8mm;background:#1E4D3A;color:#F5ECD9;border-radius:5mm;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.total-amount{font-size:28pt;font-weight:900}.notice{margin:6mm 22mm 0;padding:9mm 10mm;background:#E8A93B;color:#1E4D3A;border-radius:5mm;display:flex;align-items:center;gap:8mm;flex-shrink:0}.notice-title{font-size:16pt;font-weight:900;text-transform:uppercase}.footer{padding:5mm 22mm 7mm;display:flex;justify-content:space-between;margin-top:auto;flex-shrink:0;font-size:8.5pt;opacity:.35}</style></head><body><div class="page"><div class="header"><div style="display:flex;align-items:center;justify-content:space-between"><div><div class="logo">CHEZ RAMO</div><div class="tagline">Kebab · Tacos · Burgers · Spécialités</div></div><div style="text-align:right"><div class="order-badge">COMMANDE EN LIGNE</div><div class="order-num">RMO-${orderId}</div></div></div></div><div class="meta"><div><div class="meta-label">Date</div><div class="meta-val">${dateStr}</div></div><div style="text-align:right"><div class="meta-label">Heure</div><div class="meta-val">${timeStr}</div></div></div><div class="items"><div class="section-label">Détail de la commande</div><table>${rows}</table></div><div class="total-bar"><span style="font-size:10pt;text-transform:uppercase;letter-spacing:.15em;font-weight:700;opacity:.8">Total payé</span><span class="total-amount">${money(total)}</span></div><div class="notice"><svg width="52" height="52" fill="none" stroke="#1E4D3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg><div><div class="notice-title">À récupérer sur place</div><div style="font-size:10pt;margin-top:2mm;opacity:.75">Présentez ce document lors de votre retrait — Merci !</div></div></div><div class="footer"><span>CHEZ RAMO · LAGNIEU</span><span>Paiement sécurisé Stripe · ${dateStr}</span></div></div></body></html>`
}

function TicketPopup({ ticket, onClose }: { ticket: SavedTicket; onClose: () => void }) {
  const d = new Date(ticket.date)
  const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const download = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const W = 210, margin = 20, cW = 170
    const green: [number,number,number] = [30, 77, 58]
    const cream: [number,number,number] = [245, 236, 217]
    const accent: [number,number,number] = [232, 169, 59]
    const gray: [number,number,number] = [120, 120, 120]
    const dark: [number,number,number] = [20, 20, 20]
    const light: [number,number,number] = [240, 240, 240]

    // ── Header vert ──
    doc.setFillColor(...green)
    doc.rect(0, 0, W, 48, 'F')

    doc.setTextColor(...cream)
    doc.setFontSize(28); doc.setFont('helvetica', 'bold')
    doc.text('CHEZ RAMO', margin, 20)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 185, 160)
    doc.text('Kebab · Tacos · Burgers · Spécialités', margin, 28)

    doc.setTextColor(180, 170, 150); doc.setFontSize(8)
    doc.text('COMMANDE EN LIGNE', W - margin, 17, { align: 'right' })
    doc.setTextColor(...cream); doc.setFontSize(20); doc.setFont('helvetica', 'bold')
    doc.text(`RMO-${ticket.orderId}`, W - margin, 27, { align: 'right' })

    // ── Date / heure ──
    let y = 48
    doc.setFillColor(255, 255, 255)
    doc.rect(0, y, W, 18, 'F')
    doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text('DATE', margin, y + 6)
    doc.setTextColor(...dark); doc.setFontSize(10); doc.setFont('helvetica', 'bold')
    doc.text(dateStr, margin, y + 13)
    doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text('HEURE', W - margin, y + 6, { align: 'right' })
    doc.setTextColor(...dark); doc.setFontSize(10); doc.setFont('helvetica', 'bold')
    doc.text(timeStr, W - margin, y + 13, { align: 'right' })

    // ── Tirets séparateur ──
    y = 66
    doc.setDrawColor(...light)
    doc.setLineDashPattern([2, 2], 0)
    doc.line(margin, y, W - margin, y)
    doc.setLineDashPattern([], 0)

    // ── Articles ──
    y += 8
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 67, W, 200, 'F')

    doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text('DÉTAIL DE LA COMMANDE', margin, y)
    y += 7

    for (const item of ticket.cart) {
      doc.setTextColor(...gray); doc.setFontSize(10); doc.setFont('helvetica', 'bold')
      doc.text(`${item.qty}×`, margin, y)
      doc.setTextColor(...dark); doc.setFont('helvetica', 'normal')
      const name = item.name.length > 52 ? item.name.slice(0, 50) + '…' : item.name
      doc.text(name, margin + 10, y)
      doc.setFont('helvetica', 'bold')
      doc.text(money(item.price * item.qty), W - margin, y, { align: 'right' })
      y += 3
      doc.setDrawColor(...light)
      doc.line(margin, y, W - margin, y)
      y += 7
    }

    y += 4

    // ── Barre total ──
    doc.setFillColor(...green)
    doc.roundedRect(margin, y, cW, 18, 3, 3, 'F')
    doc.setTextColor(...cream); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text('TOTAL PAYÉ', margin + 7, y + 7)
    doc.setFontSize(22); doc.setFont('helvetica', 'bold')
    doc.text(money(ticket.total), W - margin - 7, y + 13, { align: 'right' })

    y += 26

    // ── Notice récupération ──
    doc.setFillColor(...accent)
    doc.roundedRect(margin, y, cW, 18, 3, 3, 'F')
    doc.setTextColor(...green); doc.setFontSize(13); doc.setFont('helvetica', 'bold')
    doc.text('À RÉCUPÉRER SUR PLACE', margin + 7, y + 8)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.text('Présentez ce ticket lors de votre retrait — Merci !', margin + 7, y + 14)

    y += 26

    // ── Pied de page ──
    doc.setTextColor(180, 180, 180); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
    doc.text('CHEZ RAMO · 32 RUE PASTEUR · 01150 LAGNIEU · 04 27 50 00 62', W / 2, y + 4, { align: 'center' })
    doc.text(`Paiement sécurisé Stripe · ${dateStr}`, W / 2, y + 9, { align: 'center' })

    doc.save(`ticket-RMO-${ticket.orderId}.pdf`)
  }

  return (
    <div className="absolute inset-0 z-10 bg-[#F5ECD9] flex flex-col overflow-y-auto" style={{ touchAction: 'pan-y' }}>
      {/* Header */}
      <div className="bg-brand px-6 pt-8 pb-6 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-extrabold text-2xl text-cream" style={{ fontFamily: 'var(--font-baloo)', letterSpacing: '.04em' }}>CHEZ RAMO</p>
            <p className="text-cream/50 text-[10px] tracking-[.2em] uppercase mt-0.5">Kebab · Tacos · Burgers</p>
          </div>
          <div className="text-right">
            <p className="text-cream/50 text-[10px] uppercase tracking-wider">Commande</p>
            <p className="text-cream font-extrabold text-xl" style={{ fontFamily: 'var(--font-baloo)' }}>RMO-{ticket.orderId}</p>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-cream/50 text-xs">
          <span>{dateStr}</span>
          <span>{timeStr}</span>
        </div>
      </div>

      <div className="px-6"><div className="border-t-2 border-dashed border-brand/20" /></div>

      {/* Items */}
      <div className="px-6 py-5 flex-1 space-y-3">
        {ticket.cart.map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div className="flex gap-2.5 min-w-0">
              <span className="text-brand/40 font-bold text-sm w-6 shrink-0">{item.qty}×</span>
              <span className="text-brand text-sm font-medium leading-tight">{item.name}</span>
            </div>
            <span className="text-brand font-bold text-sm shrink-0 tabular-nums">{money(item.price * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="px-6"><div className="border-t border-brand/10" /></div>

      {/* Total */}
      <div className="mx-5 mt-4 px-5 py-4 bg-brand rounded-2xl flex items-center justify-between shrink-0">
        <span className="text-cream/70 text-xs font-bold uppercase tracking-wider">Total payé</span>
        <span className="text-cream font-extrabold text-2xl tabular-nums" style={{ fontFamily: 'var(--font-baloo)' }}>{money(ticket.total)}</span>
      </div>

      {/* Notice */}
      <div className="mx-5 mt-3 px-4 py-3.5 bg-accent rounded-2xl flex items-center gap-3 shrink-0">
        <svg className="w-8 h-8 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>
        <div>
          <p className="text-brand font-extrabold text-sm uppercase" style={{ fontFamily: 'var(--font-baloo)' }}>À récupérer sur place</p>
          <p className="text-brand/60 text-xs mt-0.5">Présentez ce ticket lors du retrait</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-5 space-y-2.5 shrink-0">
        <button onClick={download} className="w-full py-3 rounded-2xl border-2 border-brand/30 text-brand font-bold text-sm flex items-center justify-center gap-2 hover:border-brand transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Télécharger PDF
        </button>
        <button onClick={onClose} className="w-full py-3.5 rounded-2xl bg-brand text-cream font-extrabold text-sm tracking-wide hover:bg-[#163d2e] transition" style={{ fontFamily: 'var(--font-baloo)' }}>
          Fermer
        </button>
      </div>
    </div>
  )
}

export default function CheckoutModal() {
  const {
    cart, checkoutOpen, checkoutStep, paymentPhase, paymentError,
    orderId, total,
    closeCheckout, goToStep, setPaymentPhase, setPaymentError, finishPayment,
    stepItem, cartCount,
  } = useStore()

  const stripeRefs = useRef<{ stripe?: any; cardElement?: any; clientSecret?: string }>({})
  const cardMountedRef = useRef(false)
  const count = cartCount()

  const [cardholderName, setCardholderName] = useState('')
  const [showTicket, setShowTicket] = useState(false)
  const [currentTicket, setCurrentTicket] = useState<SavedTicket | null>(null)
  const [cardReady, setCardReady] = useState(false)

  // Callback ref : React l'appelle exactement quand le div entre dans le DOM
  // C'est le seul moyen fiable de monter un élément Stripe sans timing aléatoire
  const cardDivCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const { cardElement } = stripeRefs.current
    if (!cardElement || cardMountedRef.current) return
    cardMountedRef.current = true
    cardElement.mount(node)
    cardElement.on('ready', () => setCardReady(true))
  }, [])

  // Load saved cardholder name
  useEffect(() => {
    setCardholderName(localStorage.getItem('ramo_cardholder') || '')
  }, [])

  // Cleanup Stripe elements when modal closes
  useEffect(() => {
    if (checkoutOpen) { setShowTicket(false); return }
    stripeRefs.current.cardElement?.destroy()
    stripeRefs.current = {}
    cardMountedRef.current = false
    setCardReady(false)
  }, [checkoutOpen])

  const handleGoToPayment = async () => {
    if (cart.length === 0) return
    goToStep(2)
    setPaymentPhase('loading')
    setPaymentError(null)
    setCardReady(false)
    cardMountedRef.current = false
    // Détruire l'ancien élément si retry
    stripeRefs.current.cardElement?.destroy()
    stripeRefs.current = {}

    try {
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')

      const { loadStripe } = await import('@stripe/stripe-js')
      const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!pk) throw new Error('Clé Stripe manquante.')
      const stripe = await loadStripe(pk) as any
      if (!stripe) throw new Error('Stripe non disponible.')

      const elements = stripe.elements()
      const cardEl = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: { color: '#1E4D3A', fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: '16px', fontSmoothing: 'antialiased', '::placeholder': { color: 'rgba(30,77,58,0.38)' }, iconColor: '#1E4D3A' },
          invalid: { color: '#C8412F', iconColor: '#C8412F' },
        },
      })

      // Stocker stripe + cardElement + secret, PUIS changer la phase
      // Le callback ref (cardDivCallback) sera appelé par React dès que le div apparaît
      stripeRefs.current = { stripe, cardElement: cardEl, clientSecret: data.clientSecret }
      setPaymentPhase('form')
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Erreur')
      setPaymentPhase('error')
    }
  }

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardReady) return
    const { stripe, cardElement, clientSecret } = stripeRefs.current
    if (!stripe || !cardElement || !clientSecret) return
    setPaymentPhase('paying')

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName || undefined },
        },
      })

      if (error) {
        setPaymentError(error.message ?? 'Paiement refusé.')
        setPaymentPhase('error')
        return
      }

      if (paymentIntent?.status !== 'succeeded') {
        setPaymentError('Paiement non finalisé, réessayez.')
        setPaymentPhase('error')
        return
      }
    } catch (err) {
      // Attrape les IntegrationError Stripe et autres erreurs inattendues
      setPaymentError(err instanceof Error ? err.message : 'Erreur lors du paiement.')
      setPaymentPhase('error')
      return
    }

    // Succès — on arrive ici seulement si confirmCardPayment a réussi
    const snapCart = cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
    const snapTotal = total()
    finishPayment()
    const newId = useStore.getState().orderId

    if (cardholderName.trim()) localStorage.setItem('ramo_cardholder', cardholderName.trim())

    // Générer ou récupérer le token client (UUID persistant, jamais partagé)
    let customerToken = localStorage.getItem('ramo_customer_token')
    if (!customerToken) {
      customerToken = crypto.randomUUID()
      localStorage.setItem('ramo_customer_token', customerToken)
      window.dispatchEvent(new CustomEvent('ramo-customer-token'))
    }

    const ticket: SavedTicket = {
      id: Date.now(),
      orderId: newId,
      cart: snapCart,
      total: snapTotal,
      date: new Date().toISOString(),
    }
    const tickets: SavedTicket[] = JSON.parse(localStorage.getItem('ramo_tickets') || '[]')
    tickets.unshift(ticket)
    localStorage.setItem('ramo_tickets', JSON.stringify(tickets.slice(0, 10)))
    window.dispatchEvent(new CustomEvent('ramo-tickets-updated'))
    setCurrentTicket(ticket)

    fetch(`${API_BASE}/admin-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: newId,
        cart: snapCart,
        total: snapTotal,
        customerToken,
        customerName: cardholderName.trim() || null,
      }),
    }).catch(console.error)
  }

  if (!checkoutOpen) return null

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center">
      <div
        onClick={() => paymentPhase !== 'paying' && checkoutStep < 3 ? closeCheckout() : undefined}
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
      />

      <div className="relative bg-white w-full sm:max-w-4xl rounded-t-[2rem] sm:rounded-3xl overflow-hidden flex flex-col" style={{ maxHeight: '96vh', minHeight: '60vh', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>

        {/* Ticket popup overlay */}
        {showTicket && currentTicket && (
          <TicketPopup ticket={currentTicket} onClose={() => setShowTicket(false)} />
        )}

        {/* Drag handle — mobile only */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3 sm:py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-brand text-base" style={{ fontFamily: 'var(--font-baloo)' }}>Chez Ramo</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-2xl p-1.5">
            {['1. Panier', '2. Paiement', '3. Confirmation'].map((label, i) => (
              <span key={i} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-default ${checkoutStep === i + 1 ? 'bg-brand text-white shadow-sm' : 'text-gray-400'}`}>{label}</span>
            ))}
          </div>
          {paymentPhase !== 'paying' && checkoutStep < 3 && (
            <button onClick={() => closeCheckout()} className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0 active:scale-90">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Étape 1 : Panier */}
        {checkoutStep === 1 && (
          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
            <div className="p-4 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
              {/* Articles — col 1-2 sur lg, second sur mobile (order-2) */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Mon panier</h2>
                  <span className="text-xs text-gray-400 font-medium">{count} article{count > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={item.key} className="flex items-center gap-3 sm:gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{money(item.price)} / unité</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => stepItem(idx, -1)} className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-base hover:bg-gray-100 transition active:scale-90">−</button>
                          <span className="text-sm font-bold text-gray-800 w-5 text-center tabular-nums">{item.qty}</span>
                          <button onClick={() => stepItem(idx, 1)} className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-base hover:bg-[#163d2e] transition active:scale-90">+</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-4 shrink-0">
                        <button onClick={() => stepItem(idx, -item.qty)} className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 transition active:scale-90">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                        <span className="text-base font-bold text-gray-900 tabular-nums">{money(item.price * item.qty)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Résumé — premier sur mobile (order-1), col 3 sur lg */}
              <div className="order-1 lg:order-2 bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
                <h3 className="text-sm font-bold text-gray-900">Résumé</h3>
                <div className="space-y-2.5 pb-3 border-b border-gray-200 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Sous-total</span><span className="font-bold text-gray-900 tabular-nums">{money(total())}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Frais de service</span><span className="font-bold text-green-600 text-xs">Gratuit</span></div>
                </div>
                <div className="flex justify-between font-bold text-gray-900"><span>Total TTC</span><span className="text-brand text-xl tabular-nums">{money(total())}</span></div>
                <div className="flex items-center gap-2 bg-brand/5 rounded-xl px-3 py-2.5 border border-brand/10">
                  <svg className="w-4 h-4 text-brand/50 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <span className="text-xs text-brand/60 font-semibold">Retrait au restaurant · Lagnieu</span>
                </div>
                <button onClick={handleGoToPayment} disabled={cart.length === 0} className="w-full py-4 rounded-2xl bg-brand text-white font-extrabold text-sm tracking-wide hover:bg-[#163d2e] active:scale-[.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2" style={{ boxShadow: '0 8px 28px rgba(30,77,58,0.22)', fontFamily: 'var(--font-baloo)' }}>
                  Passer au paiement <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
                <div className="space-y-1.5 pt-1">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Paiement 100% sécurisé · Chiffrement SSL
                  </p>
                  <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Carte bancaire traitée par Stripe · Jamais stockée
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Paiement */}
        {checkoutStep === 2 && (
          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
            <div className="p-4 sm:p-8 w-full max-w-lg mx-auto" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
              {paymentPhase !== 'paying' && (
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => goToStep(1)} className="w-11 h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0 active:scale-90">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900">Paiement sécurisé</h2>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Chiffré TLS · Stripe
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Total</p>
                    <p className="font-extrabold text-brand text-lg tabular-nums" style={{ fontFamily: 'var(--font-baloo)' }}>{money(total())}</p>
                  </div>
                </div>
              )}

              {paymentPhase === 'loading' && (
                <div className="py-16 text-center">
                  <div className="w-10 h-10 mx-auto border-[3px] border-brand/15 border-t-brand rounded-full animate-spin-slow" />
                  <p className="mt-4 text-sm text-gray-400">Initialisation…</p>
                </div>
              )}

              {/* Le formulaire reste dans le DOM pendant 'paying' pour que l'élément Stripe reste monté */}
              {(paymentPhase === 'form' || paymentPhase === 'paying') && (
                <div className="relative">
                  <form onSubmit={handleCardPayment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nom sur la carte</label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={e => setCardholderName(e.target.value)}
                        placeholder="Jean Dupont"
                        autoComplete="cc-name"
                        className="w-full px-4 rounded-2xl border-2 border-brand/15 bg-white text-brand text-base font-medium placeholder:text-gray-300 focus:outline-none focus:border-brand/40 transition"
                        style={{ height: '52px' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Numéro de carte</label>
                      <div
                        ref={cardDivCallback}
                        className="px-4 rounded-2xl border-2 border-brand/15 bg-white transition-opacity flex items-center"
                        style={{ minHeight: '52px', opacity: cardReady ? 1 : 0.4 }}
                      />
                    </div>
                    <button type="submit" disabled={!cardReady || paymentPhase === 'paying'} className="w-full rounded-2xl bg-brand text-white font-extrabold text-base tracking-wide hover:bg-[#163d2e] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" style={{ height: '56px', boxShadow: '0 8px 28px rgba(30,77,58,0.28)', fontFamily: 'var(--font-baloo)' }}>
                      Payer · {money(total())}
                    </button>
                  </form>

                  {/* Spinner superposé — le formulaire reste dans le DOM */}
                  {paymentPhase === 'paying' && (
                    <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 border-[3px] border-brand/15 border-t-brand rounded-full animate-spin-slow" />
                      <p className="text-sm text-gray-500 font-medium">Autorisation en cours…</p>
                      <p className="text-xs text-gray-400">Ne fermez pas cette page</p>
                    </div>
                  )}
                </div>
              )}

              {paymentPhase === 'error' && (
                <div className="space-y-3 py-2">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-red-600">{paymentError || 'Paiement refusé.'}</p>
                  </div>
                  <button onClick={handleGoToPayment} className="w-full rounded-2xl bg-brand text-white font-semibold text-sm tracking-wide hover:bg-[#163d2e] transition active:scale-[.98] flex items-center justify-center" style={{ height: '52px' }}>Réessayer</button>
                  <button onClick={() => closeCheckout()} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">Annuler</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Étape 3 : Confirmation */}
        {checkoutStep === 3 && (
          <div className="flex-1 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
            <div className="flex flex-col items-center px-6 py-8 sm:py-12 text-center" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
              <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
                <span className="absolute top-1 left-2 w-3 h-3 rounded-full bg-accent/70 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center" style={{ boxShadow: '0 8px 32px rgba(30,77,58,0.32)' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
              <p className="text-sm text-gray-400 font-medium">Merci pour votre commande chez Ramo.</p>
              <p className="text-xs font-bold text-gray-700 bg-gray-100 py-2 px-5 rounded-xl inline-block mt-4">N° RMO-{orderId}</p>

              <div className="w-full max-w-xs mt-4 mb-5 px-4 py-4 rounded-2xl bg-accent text-brand flex items-center gap-3 text-left">
                <svg className="w-10 h-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>
                <div>
                  <p className="font-extrabold text-sm uppercase tracking-wide leading-snug" style={{ fontFamily: 'var(--font-baloo)' }}>N'oubliez pas de venir<br />récupérer votre commande<br />sur place !</p>
                  <p className="text-brand/70 text-xs font-semibold mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Délai estimé : 15 à 20 min
                  </p>
                </div>
              </div>

              <div className="w-full max-w-xs space-y-3">
                {currentTicket && (
                  <button onClick={() => setShowTicket(true)} className="w-full rounded-2xl bg-brand text-white font-extrabold text-sm tracking-wide hover:bg-[#163d2e] transition active:scale-[.98] flex items-center justify-center gap-2" style={{ height: '52px', boxShadow: '0 8px 28px rgba(30,77,58,0.28)', fontFamily: 'var(--font-baloo)' }}>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    Voir mon ticket
                  </button>
                )}
                <button
                  onClick={() => { closeCheckout(); window.dispatchEvent(new CustomEvent('open-tickets')) }}
                  className="w-full rounded-2xl border-2 border-brand/20 text-brand font-extrabold text-sm tracking-wide hover:bg-brand/5 transition active:scale-[.98] flex items-center justify-center gap-2"
                  style={{ height: '52px', fontFamily: 'var(--font-baloo)' }}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Suivre ma commande
                </button>
                <button onClick={() => closeCheckout()} className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors">
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
