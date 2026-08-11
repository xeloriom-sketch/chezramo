'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { REVIEWS } from '@/lib/constants'

function StarIcon() {
  return <svg className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
}

export default function ReviewsSection() {
  const { reviewIndex, setReviewIndex, nextReview } = useStore()
  const [dragStart, setDragStart] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [reservation, setReservation] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const trackRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const interval = setInterval(() => nextReview(), 7000)
    return () => clearInterval(interval)
  }, [nextReview])

  // review counter animation
  useEffect(() => {
    const el = counterRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      obs.disconnect()
      const target = 161
      let t0: number | null = null
      const tick = (ts: number) => {
        if (!t0) t0 = ts
        const p = Math.min((ts - t0) / 2400, 1)
        const e = 1 - Math.pow(1 - p, 3)
        el.textContent = Math.round(e * target).toLocaleString('fr-FR')
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragStart(e.clientX)
    setIsDragging(true)
    setDragDelta(0)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setDragDelta(e.clientX - dragStart)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    if (Math.abs(dragDelta) > 50) {
      dragDelta < 0 ? nextReview() : setReviewIndex((reviewIndex - 1 + REVIEWS.length) % REVIEWS.length)
    }
    setDragDelta(0)
  }

  const trackStyle = `translateX(calc(-${reviewIndex} * (min(480px,88vw) + clamp(16px,4vw,20px)) + 50vw - min(240px,44vw) + ${isDragging ? dragDelta : 0}px))`

  const handleReservation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      fullname: fd.get('fullname') as string,
      email:    fd.get('email')    as string,
      phone:    fd.get('phone')    as string,
      date:     fd.get('date')     as string,
      time:     fd.get('time')     as string,
      guests:   fd.get('guests')   as string,
      message:  fd.get('message')  as string,
    }
    try {
      const API_BASE = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? '/api'
      await fetch(API_BASE === '/api' ? '/api/reservations' : `${API_BASE}/admin-reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch { /* API non dispo (export statique GitHub Pages) — on affiche quand même la confirmation */ }
    const dateStr = body.date
      ? new Date(body.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : body.date
    setSubmitting(false)
    setReservation(`${body.guests} personnes le ${dateStr} à ${body.time} — au nom de ${body.fullname}.`)
  }

  return (
    <section className="relative bg-brand pt-20 pb-0 px-4 overflow-hidden" id="avis" style={{ overflow: 'visible', overflowX: 'clip' }}>
      <div className="absolute inset-0 pattern-bg" />

      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="font-extrabold text-[clamp(30px,4vw,52px)] text-cream" style={{ fontFamily: 'var(--font-baloo)' }}>
          DES CLIENTS HEUREUX
        </h2>
        <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed text-cream">
          Plus de <span ref={counterRef} className="font-extrabold text-accent">161</span> avis Google, note moyenne <strong className="text-accent">4,5 / 5</strong>.
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={trackRef}
        className="relative max-w-full mx-auto mt-10 select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { setIsDragging(false); setDragDelta(0) }}
      >
        <div className="py-6">
          <div
            className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] cursor-grab active:cursor-grabbing"
            style={{ transform: trackStyle }}
          >
            {REVIEWS.map((rv, i) => (
              <div
                key={i}
                className={`flex-none w-[min(480px,88vw)] rounded-3xl p-6 sm:p-8 text-center border-2 transition-all duration-500 ${
                  i === reviewIndex
                    ? 'bg-cream border-cream shadow-2xl scale-100 rotate-0 z-10'
                    : i < reviewIndex
                      ? 'bg-[#1a5c46] border-cream/30 scale-[0.86] rotate-[-5deg] review-tilt-left shadow-lg'
                      : 'bg-[#1a5c46] border-cream/30 scale-[0.86] rotate-[5deg] review-tilt-right shadow-lg'
                }`}
              >
                <div className={`flex justify-center gap-0.5 mb-4 ${i === reviewIndex ? 'text-accent' : 'text-[#E8A93B]'}`}>
                  {[...Array(rv.stars)].map((_, s) => <StarIcon key={s} />)}
                </div>
                <p className={`font-extrabold text-sm sm:text-lg leading-relaxed ${i === reviewIndex ? 'text-brand' : 'text-cream'}`} style={{ fontFamily: 'var(--font-baloo)' }}>
                  {rv.quote}
                </p>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${i === reviewIndex ? 'bg-brand text-cream' : 'bg-cream/25 text-cream'}`} style={{ fontFamily: 'var(--font-baloo)' }}>
                    {rv.author.charAt(0)}
                  </span>
                  <span className={`text-sm font-bold tracking-[.14em] uppercase ${i === reviewIndex ? 'text-[#6A9A80]' : 'text-cream'}`}>
                    {rv.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* dots */}
        <div className="flex justify-center gap-2 mt-6">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setReviewIndex(i)}
              aria-label={`Avis ${i + 1}`}
              className={`h-2.5 rounded-full border border-white/20 transition-all duration-300 hover:bg-accent ${i === reviewIndex ? 'bg-accent w-7' : 'bg-cream/35 w-2.5'}`}
            />
          ))}
        </div>
      </div>

      {/* nav */}
      <div className="relative flex justify-center gap-3 mt-5 pb-8">
        <button onClick={() => setReviewIndex((reviewIndex - 1 + REVIEWS.length) % REVIEWS.length)} className="w-12 h-12 rounded-full border-2 border-cream/60 text-cream hover:bg-accent hover:border-accent hover:text-brand transition flex items-center justify-center text-2xl font-bold">‹</button>
        <button onClick={() => nextReview()} className="w-12 h-12 rounded-full border-2 border-cream/60 text-cream hover:bg-accent hover:border-accent hover:text-brand transition flex items-center justify-center text-2xl font-bold">›</button>
      </div>

      {/* Reservation */}
      <div className="relative pt-16 pb-20 px-4" id="reservation">
        <div className="relative bg-brand rounded-[44px] p-6 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 pattern-bg" />
          <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1fr] bg-cream rounded-3xl overflow-hidden">
            <div className="p-6 sm:p-10">
              <h2 className="font-extrabold text-[clamp(28px,3.4vw,42px)] text-brand" style={{ fontFamily: 'var(--font-baloo)' }}>RÉSERVEZ VOTRE TABLE</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8A8A8A]">Confirmation par e-mail. Pour les groupes ou les commandes à emporter, appelez-nous au 04 27 50 00 62.</p>

              {reservation ? (
                <div className="mt-6 p-6 rounded-2xl border-2 border-brand bg-accent">
                  <h3 className="font-extrabold text-xl flex items-center gap-2" style={{ fontFamily: 'var(--font-baloo)' }}>
                    Table confirmée
                    <svg className="w-5 h-5 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed">{reservation}</p>
                  <button onClick={() => setReservation(null)} className="mt-4 px-5 py-2.5 rounded-full border-2 border-brand bg-cream text-xs font-bold uppercase tracking-widest hover:bg-brand hover:text-cream transition">Nouvelle réservation</button>
                </div>
              ) : (
                <form onSubmit={handleReservation} className="mt-6 space-y-3 min-w-0 w-full">
                  <input type="text" name="fullname" placeholder="Nom complet" required aria-label="Nom complet" className="w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand placeholder:text-[#A0A0A0] focus:outline-none focus:border-accent" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="email" name="email" placeholder="Adresse e-mail" required aria-label="Adresse e-mail" className="w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand placeholder:text-[#A0A0A0] focus:outline-none focus:border-accent" />
                    <input type="tel" name="phone" placeholder="Téléphone" required aria-label="Numéro de téléphone" className="w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand placeholder:text-[#A0A0A0] focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand/50 mb-1 pl-1">Date de réservation</p>
                    <input type="date" name="date" required aria-label="Date de réservation" defaultValue={today} min={today} className="w-full min-w-0 max-w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand focus:outline-none focus:border-accent appearance-none" style={{ boxSizing: 'border-box' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select name="time" required aria-label="Heure de réservation" className="w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand focus:outline-none focus:border-accent">
                      <option value="" disabled>Heure</option>
                      {['12:00','12:30','13:00','19:00','19:30','20:00','21:00'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select name="guests" required aria-label="Nombre de personnes" className="w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand focus:outline-none focus:border-accent">
                      <option value="" disabled>Personnes</option>
                      {['2','3','4','6','8'].map(n => <option key={n} value={n}>{n} pers.</option>)}
                    </select>
                  </div>
                  <textarea name="message" rows={3} placeholder="Allergies, occasion spéciale, table en terrasse…" aria-label="Message optionnel" className="w-full px-4 py-4 rounded-xl border-2 border-brand bg-transparent text-sm text-brand placeholder:text-[#A0A0A0] focus:outline-none focus:border-accent resize-y" />
                  <button type="submit" disabled={submitting} className="w-full py-4 rounded-full border-2 border-brand bg-brand text-cream text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-brand transition btn-hover-scale disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? 'Envoi en cours…' : 'Réserver ma table'}
                  </button>
                </form>
              )}
            </div>
            <div className="min-h-[280px] lg:min-h-full bg-[#1E4D3A] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85"
                alt="Salle de restaurant Chez Ramo — tables dressées, ambiance chaleureuse"
                loading="lazy"
                className="w-full h-full object-cover"
                style={{ minHeight: 280 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 text-cream">
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Chez Ramo · Lagnieu</p>
                <p className="font-extrabold text-lg leading-tight" style={{ fontFamily: 'var(--font-baloo)' }}>RÉSERVEZ<br />VOTRE TABLE</p>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div className="relative max-w-4xl mx-auto mt-12 text-center">
            <h2 className="font-extrabold text-[clamp(26px,3.4vw,44px)] text-cream" style={{ fontFamily: 'var(--font-baloo)' }}>HORAIRES D'OUVERTURE</h2>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-16">
              <div className="text-center">
                <p className="text-xs font-bold tracking-[.2em] uppercase text-accent">Lundi — Samedi</p>
                <p className="font-extrabold text-[clamp(24px,3.5vw,48px)] text-cream" style={{ fontFamily: 'var(--font-baloo)' }}>11H – 14H30</p>
                <p className="font-extrabold text-[clamp(24px,3.5vw,48px)] text-cream" style={{ fontFamily: 'var(--font-baloo)' }}>18H – 22H30</p>
              </div>
              <div className="hidden sm:block w-px bg-cream/25 self-stretch min-h-[80px]" />
              <div className="w-16 h-px bg-cream/25 sm:hidden" />
              <div className="text-center">
                <p className="text-xs font-bold tracking-[.2em] uppercase text-accent">Dimanche</p>
                <p className="font-extrabold text-[clamp(24px,3.5vw,48px)] text-[#C8412F] mt-2" style={{ fontFamily: 'var(--font-baloo)' }}>FERMÉ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
