'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useStore } from '@/lib/store'
import { useRef } from 'react'

function money(n: number) { return n.toFixed(2).replace('.', ',') + ' €' }

function generateTicketHTML(orderId: number, cart: { name: string; price: number; qty: number }[], total: number): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
  const timeStr = now.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
  const rows = cart.map(item =>
    `<tr><td class="td-qty">${item.qty}×</td><td class="td-name">${item.name}</td><td class="td-price">${money(item.price * item.qty)}</td></tr>`
  ).join('')

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Ticket RMO-${orderId}</title><style>
*{box-sizing:border-box;margin:0;padding:0}@page{size:A4 portrait;margin:0}html,body{width:210mm;height:297mm;font-family:'Helvetica Neue',Arial,sans-serif;background:#F5ECD9;color:#1E4D3A}
.page{width:210mm;height:297mm;display:flex;flex-direction:column}.header{background:#1E4D3A;color:#F5ECD9;padding:18mm 22mm 14mm;flex-shrink:0}.header-inner{display:flex;align-items:center;justify-content:space-between}.logo{font-size:36pt;font-weight:900;letter-spacing:.06em;line-height:1}.tagline{font-size:9pt;letter-spacing:.18em;text-transform:uppercase;opacity:.6;margin-top:3mm}.order-badge{display:inline-block;background:rgba(245,236,217,.15);border:2px solid rgba(245,236,217,.3);color:#F5ECD9;font-size:9pt;font-weight:800;letter-spacing:.12em;padding:3mm 6mm;border-radius:99mm}.order-num{font-size:22pt;font-weight:900;margin-top:3mm}.meta{padding:7mm 22mm;display:flex;justify-content:space-between;align-items:center;border-bottom:1.5px dashed rgba(30,77,58,.25);flex-shrink:0}.meta-label{font-size:8pt;text-transform:uppercase;letter-spacing:.15em;opacity:.45;margin-bottom:1.5mm}.meta-val{font-size:11pt;font-weight:700}.items{padding:6mm 22mm;flex:1;display:flex;flex-direction:column}.section-label{font-size:8pt;text-transform:uppercase;letter-spacing:.15em;opacity:.4;margin-bottom:4mm}table{width:100%;border-collapse:collapse;flex:1}.td-qty{width:14mm;font-size:11pt;font-weight:700;color:rgba(30,77,58,.45);padding:4mm 4mm 4mm 0;vertical-align:top;border-bottom:1px solid rgba(30,77,58,.1)}.td-name{font-size:12pt;padding:4mm;vertical-align:top;border-bottom:1px solid rgba(30,77,58,.1);line-height:1.4}.td-price{text-align:right;font-size:13pt;font-weight:800;white-space:nowrap;padding:4mm 0 4mm 6mm;vertical-align:top;border-bottom:1px solid rgba(30,77,58,.1)}.total-bar{margin:0 22mm;padding:7mm 8mm;background:#1E4D3A;color:#F5ECD9;border-radius:5mm;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.total-label{font-size:10pt;text-transform:uppercase;letter-spacing:.15em;font-weight:700;opacity:.8}.total-amount{font-size:28pt;font-weight:900}.notice{margin:6mm 22mm 0;padding:9mm 10mm;background:#E8A93B;color:#1E4D3A;border-radius:5mm;display:flex;align-items:center;gap:8mm;flex-shrink:0}.notice-title{font-size:16pt;font-weight:900;text-transform:uppercase;letter-spacing:.04em;line-height:1.2}.notice-sub{font-size:10pt;margin-top:2mm;opacity:.75}.footer{padding:5mm 22mm 7mm;display:flex;justify-content:space-between;align-items:center;margin-top:auto;flex-shrink:0}.footer-brand{font-size:9pt;font-weight:900;letter-spacing:.08em;opacity:.35}.footer-info{font-size:8.5pt;opacity:.35;text-align:right}
</style></head><body><div class="page">
<div class="header"><div class="header-inner"><div><div class="logo">CHEZ RAMO</div><div class="tagline">Kebab · Tacos · Burgers · Plats maison</div></div><div style="text-align:right"><div class="order-badge">COMMANDE EN LIGNE</div><div class="order-num">RMO-${orderId}</div></div></div></div>
<div class="meta"><div><div class="meta-label">Date</div><div class="meta-val">${dateStr}</div></div><div style="text-align:right"><div class="meta-label">Heure</div><div class="meta-val">${timeStr}</div></div></div>
<div class="items"><div class="section-label">Détail de la commande</div><table>${rows}</table></div>
<div class="total-bar"><span class="total-label">Total payé</span><span class="total-amount">${money(total)}</span></div>
<div class="notice"><div style="flex-shrink:0"><svg width="52" height="52" fill="none" stroke="#1E4D3A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg></div><div><div class="notice-title">À récupérer sur place</div><div class="notice-sub">Présentez ce document lors de votre retrait — Merci !</div></div></div>
<div class="footer"><div class="footer-brand">CHEZ RAMO · LAGNIEU</div><div class="footer-info">Paiement sécurisé Stripe · ${dateStr}</div></div>
</div></body></html>`
}

export default function CheckoutModal() {
  const {
    cart, checkoutOpen, checkoutStep, paymentPhase, paymentError,
    orderId, confirmedCart, confirmedTotal, total,
    closeCheckout, goToStep, setPaymentPhase, setPaymentError, finishPayment,
    stepItem, cartCount,
  } = useStore()

  const stripeRefs = useRef<{ elements?: any; cardElement?: any; clientSecret?: string }>({})

  const count = cartCount()

  const handleGoToPayment = async () => {
    if (cart.length === 0) return
    goToStep(2)
    setPaymentPhase('loading')
    setPaymentError(null)

    try {
      const res = await fetch('/api/create-payment-intent', {
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

      const elements = stripe.elements({ clientSecret: data.clientSecret })
      const expressEl = elements.create('expressCheckout', {
        buttonHeight: 52,
        buttonType: { applePay: 'buy', googlePay: 'buy' },
        buttonTheme: { applePay: 'black', googlePay: 'black' },
        layout: { maxColumns: 1, maxRows: 2 },
      })
      const cardEl = stripe.elements().create('card', {
        hidePostalCode: true,
        style: {
          base: { color: '#1E4D3A', fontFamily: '"Baloo 2", system-ui, sans-serif', fontSize: '16px', fontSmoothing: 'antialiased', '::placeholder': { color: 'rgba(30,77,58,0.38)' }, iconColor: '#1E4D3A' },
          invalid: { color: '#C8412F', iconColor: '#C8412F' },
        },
      })

      stripeRefs.current = { elements, cardElement: cardEl, clientSecret: data.clientSecret }
      setPaymentPhase('form')

      await new Promise(r => setTimeout(r, 50))
      expressEl.mount('#express-checkout-element')
      cardEl.mount('#stripe-card-element')

      expressEl.on('confirm', async () => {
        setPaymentPhase('paying')
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: `${window.location.origin}/?payment=success` },
          redirect: 'if_required',
        })
        if (error) { setPaymentError(error.message ?? 'Erreur'); setPaymentPhase('error') }
        else {
          const snapCart = cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
          const snapTotal = total()
          finishPayment()
          const newId = useStore.getState().orderId
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: newId, cart: snapCart, total: snapTotal }),
          }).catch(console.error)
        }
      })
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Erreur')
      setPaymentPhase('error')
    }
  }

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    const { cardElement, clientSecret } = stripeRefs.current
    if (!cardElement || !clientSecret) return
    setPaymentPhase('paying')
    const { loadStripe } = await import('@stripe/stripe-js')
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    const stripe = await loadStripe(pk) as any
    if (!stripe) return
    const { error } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } })
    if (error) { setPaymentError(error.message ?? 'Erreur'); setPaymentPhase('error') }
    else {
      const snapCart = cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }))
      const snapTotal = total()
      finishPayment()
      const newId = useStore.getState().orderId
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: newId, cart: snapCart, total: snapTotal }),
      }).catch(console.error)
    }
  }

  const downloadTicket = () => {
    const html = generateTicketHTML(orderId, confirmedCart, confirmedTotal)
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  if (!checkoutOpen) return null

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center">
      <div
        onClick={() => paymentPhase !== 'paying' && checkoutStep < 3 ? closeCheckout() : undefined}
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
      />

      <div className="relative bg-white w-full sm:max-w-4xl rounded-t-[1.5rem] sm:rounded-3xl overflow-hidden flex flex-col" style={{ maxHeight: '96vh', boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center shrink-0">
              <span className="font-extrabold text-accent text-sm leading-none" style={{ fontFamily: 'var(--font-baloo)' }}>R</span>
            </div>
            <span className="font-extrabold text-brand text-base" style={{ fontFamily: 'var(--font-baloo)' }}>Chez Ramo</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-2xl p-1.5">
            {['1. Panier','2. Paiement','3. Confirmation'].map((label, i) => (
              <span key={i} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-default ${checkoutStep === i+1 ? 'bg-brand text-white shadow-sm' : 'text-gray-400'}`}>{label}</span>
            ))}
          </div>
          {paymentPhase !== 'paying' && (
            <button onClick={() => closeCheckout()} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        {/* Étape 1 : Panier */}
        {checkoutStep === 1 && (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Mon panier</h2>
                  <span className="text-xs text-gray-400 font-medium">{count} article{count > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={item.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{money(item.price)} / unité</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => stepItem(idx, -1)} className="w-7 h-7 rounded-xl bg-white border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm hover:bg-gray-100 transition">−</button>
                          <span className="text-sm font-bold text-gray-800 w-4 text-center tabular-nums">{item.qty}</span>
                          <button onClick={() => stepItem(idx, 1)} className="w-7 h-7 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-sm hover:bg-[#163d2e] transition">+</button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-4 shrink-0">
                        <button onClick={() => stepItem(idx, -item.qty)} className="text-gray-300 hover:text-red-400 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                        <span className="text-base font-bold text-gray-900 tabular-nums">{money(item.price * item.qty)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-900">Résumé de commande</h3>
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
                <p className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Chiffré TLS · Stripe
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 : Paiement */}
        {checkoutStep === 2 && (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-5 sm:p-8 w-full max-w-lg mx-auto">
              {paymentPhase !== 'paying' && (
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => goToStep(1)} className="w-9 h-9 rounded-2xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition shrink-0">
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

              {paymentPhase === 'form' && (
                <div className="space-y-4">
                  <div id="express-checkout-element" />
                  <div id="co-divider" className="hidden items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[10px] text-gray-400 tracking-[.12em] uppercase font-bold shrink-0">ou carte</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <form onSubmit={handleCardPayment} className="space-y-3">
                    <div id="stripe-card-element" className="px-4 py-4 rounded-2xl border-2 border-brand/15 bg-white" style={{ minHeight: '44px' }} />
                    <button type="submit" className="w-full py-4 rounded-2xl bg-brand text-white font-extrabold text-base tracking-wide hover:bg-[#163d2e] active:scale-[0.98] transition-all" style={{ boxShadow: '0 8px 28px rgba(30,77,58,0.28)', fontFamily: 'var(--font-baloo)' }}>
                      Payer · {money(total())}
                    </button>
                  </form>
                </div>
              )}

              {paymentPhase === 'paying' && (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 mx-auto border-[3px] border-brand/15 border-t-brand rounded-full animate-spin-slow" />
                  <p className="mt-4 text-sm text-gray-500 font-medium">Autorisation en cours…</p>
                  <p className="text-xs text-gray-400 mt-1">Ne fermez pas cette page</p>
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
                  <button onClick={() => { closeCheckout(); setTimeout(() => useStore.getState().openCheckout(), 50) }} className="w-full py-3.5 rounded-2xl bg-brand text-white font-semibold text-sm tracking-wide hover:bg-[#163d2e] transition">Réessayer</button>
                  <button onClick={() => closeCheckout()} className="w-full py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors">Annuler</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Étape 3 : Confirmation */}
        {checkoutStep === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <span className="absolute top-1 left-2 w-3 h-3 rounded-full bg-accent/70 animate-ping" />
              <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center" style={{ boxShadow: '0 8px 32px rgba(30,77,58,0.32)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
            <p className="text-sm text-gray-400 font-medium">Merci pour votre commande chez Ramo.</p>
            <p className="text-xs font-bold text-gray-700 bg-gray-100 py-2 px-5 rounded-xl inline-block mt-5">N° RMO-{orderId}</p>

            <div className="w-full max-w-xs mt-4 mb-5 px-4 py-4 rounded-2xl bg-accent text-brand flex items-center gap-3 text-left">
              <svg className="w-10 h-10 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>
              <p className="font-extrabold text-sm uppercase tracking-wide leading-snug" style={{ fontFamily: 'var(--font-baloo)' }}>N'oubliez pas de venir<br />récupérer votre commande<br />sur place !</p>
            </div>

            <div className="w-full max-w-xs space-y-3">
              <button onClick={downloadTicket} className="w-full py-3.5 rounded-2xl border-2 border-brand text-brand font-extrabold text-sm tracking-wide hover:bg-brand hover:text-white transition active:scale-[.98] flex items-center justify-center gap-2" style={{ fontFamily: 'var(--font-baloo)' }}>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Télécharger mon ticket
              </button>
              <button onClick={() => closeCheckout()} className="w-full py-4 rounded-2xl bg-brand text-white font-extrabold text-sm tracking-wide hover:bg-[#163d2e] transition active:scale-[.98]" style={{ boxShadow: '0 8px 28px rgba(30,77,58,0.28)', fontFamily: 'var(--font-baloo)' }}>
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
