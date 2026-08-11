'use client'

import { useState, useEffect, useRef } from 'react'
import { MENU_DATA } from '@/lib/constants'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        autoplay?: boolean
        loop?: boolean
        speed?: number
        background?: string
      }
    }
  }
}

const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=VOTRE_PLACE_ID'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const ITEM_IMG: Record<string, string> = {
  // Sandwichs & galettes
  'Kebab':              '/uploads/cut/Kebab.png',
  'Kebab Frites':       '/uploads/cut/Kebab%20Frites.png',
  'Kebab Géant':        '/uploads/cut/Kebab%20Geant.png',
  'Kofte':              '/uploads/cut/Kofte.png',
  'Américain':          '/uploads/cut/Americain.png',
  'Escalope':           '/uploads/cut/Escalope.png',
  'Cordon Bleu':        '/uploads/cut/Cordon%20Bleu.png',
  'Galette (Dürum)':    '/uploads/cut/Galette.png',
  'Miche Kebab':        '/uploads/cut/Miche%20Kebab.png',
  // Tacos
  'Tacos':              '/uploads/cut/Tacos.png',
  'Maxi Tacos':         '/uploads/cut/Maxi%20Tacos.png',
  // Burgers & finger
  'Chicken Burger':     '/uploads/cut/Chicken%20Burger.png',
  'Cheese Burger':      '/uploads/cut/Cheese%20Burger.png',
  'Nuggets (x7)':       '/uploads/cut/Nuggets%20(x7).png',
  'Wings (x4)':         '/uploads/cut/Wings%20(x8).png',
  'Tenders (x4)':       '/uploads/cut/Tenders%20(x4).png',
  // Assiettes
  'Assiette Kebab':     '/uploads/cut/Assiette%20Kebab.png',
  'Assiette Escalope':  '/uploads/cut/Assiette%20Escalope.png',
  'Assiette Kofte':     '/uploads/cut/Assiette%20Kofte.png',
  'Assiette Steak':     '/uploads/cut/Assiette%20Steak.png',
  'Assiette Cordon Bleu': '/uploads/cut/Assiette%20Cordon%20Bleu.png',
  'Assiette Mixte':     '/uploads/cut/Assiette%20Mixte.png',
  'Assiette Enfant':    '/uploads/cut/Assiette%20Enfant.png',
  'Assiette Emporter':  '/uploads/cut/Assiette%20Emporter.png',
  // Plats maison
  'Escalope Crème':     '/uploads/cut/Escalope_Cr%C3%A8me.png',
  'Filet de Poulet':    '/uploads/cut/Filet_de_Poulet.png',
  'Pleskavice':         '/uploads/cut/Pleskavice.png',
  'Makarona':           '/uploads/cut/Makarona.png',
  // Qofte
  'Qofte x5':           '/uploads/cut/Qofte_x5.png',
  'Qofte x7':           '/uploads/cut/Qofte_x7.png',
  'Qofte x10':          '/uploads/cut/Qofte_x10.png',
  // Salades & burek
  'Salade Grecque':     '/uploads/cut/Salade_Grecque.png',
  'Salade du Berger':   '/uploads/cut/Salade%20du%20Berger.png',
  'Salade Shope':       '/uploads/cut/Salade_Shope.png',
  'Burek Fromage':      '/uploads/cut/Burek_Fromage.png',
  'Burek Épinards':     '/uploads/cut/Burek_%C3%89pinards.png',
  'Burek Viande':       '/uploads/cut/Burek_Viande.png',
  'Fli - Flija':        '/uploads/cut/Fli_-_Flija.png',
  // Desserts
  'Trilece':            '/uploads/cut/Trilece.png',
  'Tiramisu':           '/uploads/cut/Tiramisu.png',
  // Menu enfant
  'Menu Enfant':        '/uploads/cut/Assiette%20Enfant.png',
  // Accompagnements
  'Frites':             '/uploads/cut/Frites.png',
  'Barquette Viande':   '/uploads/cut/Barquette.png',
  'Nos Sauces':         '/uploads/cut/Nos%20Sauces.png',
  // Boissons
  'Coca-Cola':          '/uploads/cut/Boissons%2033cl.png',
  'Fanta Orange':       '/uploads/cut/Boissons%2033cl.png',
  'Fanta Citron':       '/uploads/cut/Boissons%2033cl.png',
  'Sprite':             '/uploads/cut/Boissons%2033cl.png',
  'Ice Tea Pêche':      '/uploads/cut/Boissons%2033cl.png',
  'Ice Tea Citron':     '/uploads/cut/Boissons%2033cl.png',
  'Oasis':              '/uploads/cut/Boissons%2033cl.png',
  'Eau plate':          '/uploads/cut/Boissons%2033cl.png',
  'Eau gazeuse':        '/uploads/cut/Boissons%2033cl.png',
  'Café':               '/uploads/cut/Caf%C3%A9.png',
  'Thé à la menthe':    '/uploads/cut/Th%C3%A9.png',
}

function getImg(title: string, fallback: string) {
  return BASE + (ITEM_IMG[title] ?? fallback)
}

// Zoom automatique sur la zone non-transparente de chaque image
function SmartFoodImg({ src, alt, size, bg, radius = 16 }: {
  src: string; alt: string; size: number; bg: string; radius?: number
}) {
  const ref = useRef<HTMLImageElement>(null)

  const fit = () => {
    const img = ref.current
    if (!img?.complete || !img.naturalWidth) return
    try {
      const W = img.naturalWidth, H = img.naturalHeight
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const ctx = c.getContext('2d', { willReadFrequently: true })
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(0, 0, W, H).data
      let x0 = W, x1 = 0, y0 = H, y1 = 0
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 20) {
          const x = (i >> 2) % W, y = (i >> 2) / W | 0
          if (x < x0) x0 = x; if (x > x1) x1 = x
          if (y < y0) y0 = y; if (y > y1) y1 = y
        }
      }
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1
      if (cw < 1 || ch < 1) return
      const s = Math.min(W / cw, H / ch) * 0.88
      img.style.transform = `scale(${Math.min(s, 3)})`
    } catch { /* cross-origin */ }
  }

  useEffect(() => { fit() }) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: radius, overflow: 'hidden', flexShrink: 0 }}>
      <img ref={ref} src={src} alt={alt} onLoad={fit}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        loading="lazy"
      />
    </div>
  )
}

const IMG_BG = [
  '#FFF0D9', '#D4F5EE', '#EAF4FB', '#FCE8F0',
  '#F0F4FF', '#E8F8E8', '#FFF8E1', '#F5EEFF',
  '#FFE8D6', '#E0F7FA', '#F9FBE7', '#FDE8FF',
]

const BS_BG = [
  '#FFF0D9', '#D4F5EE', '#EAF4FB', '#FCE8F0', '#F0F4FF',
]

const CATEGORIES = [
  { id: 'kebab',     label: 'KEBAB & GALETTES', img: '/uploads/cut/Kebab%20Frites.png',      cats: ['Sandwichs Vedettes','Nos Spécialités','Tradition & Galettes'] },
  { id: 'tacos',     label: 'TACOS',             img: '/uploads/cut/Maxi%20Tacos.png',         cats: ['Tacos'] },
  { id: 'burgers',   label: 'BURGERS & FINGER',  img: '/uploads/cut/Cheese%20Burger.png',      cats: ['Burgers','Finger Food'] },
  { id: 'assiettes', label: 'ASSIETTES',         img: '/uploads/cut/Assiette%20Kebab.png',     cats: ['Assiettes Gourmet','Assiettes Gourmet (Suite)','Assiettes & Salade'] },
  { id: 'plats',     label: 'PLATS MAISON',      img: '/uploads/cut/Kofte.png',                cats: ['Plats Maison','Qofte Grillées','Burek & Spécialités'] },
  { id: 'salades',   label: 'SALADES & BUREK',   img: '/uploads/cut/Salade%20du%20Berger.png', cats: ['Salades Fraîches','Salades & Burek'] },
  { id: 'drinks',    label: 'DESSERTS & DRINKS', img: '/uploads/cut/Tiramisu.png',             cats: ['Desserts','Menu Enfants','Accompagnements & Sauces','Boissons & Boissons Chaudes'] },
]

const BEST_SELLERS = [
  { title: 'Kebab Frites',   price: '9,50',  img: '/uploads/cut/Kebab%20Frites.png',      catId: 'kebab',     badge: 'Top Vente' },
  { title: 'Maxi Tacos',     price: '15,00', img: '/uploads/cut/Maxi%20Tacos.png',         catId: 'tacos',     badge: 'Populaire' },
  { title: 'Cheese Burger',  price: '6,00',  img: '/uploads/cut/Cheese%20Burger.png',      catId: 'burgers',   badge: 'Coup de ♥' },
  { title: 'Assiette Kebab', price: '15,00', img: '/uploads/cut/Assiette%20Kebab.png',     catId: 'assiettes', badge: 'Spécialité' },
  { title: 'Tiramisu',       price: '3,50',  img: '/uploads/cut/Tiramisu.png',             catId: 'drinks',    badge: 'Dessert' },
]

const PRIZES = [
  { id: 'drink', label: 'Une boisson offerte',  desc: 'Coca, Fanta, Sprite ou eau plate (33 cl)', color: '#3B82F6' },
  { id: 'fries', label: 'Des frites offertes',  desc: 'Petite portion de frites maison',           color: '#F59E0B' },
  { id: 'cake',  label: 'Un dessert offert',    desc: 'Trilece ou Tiramisu maison',                color: '#EC4899' },
  { id: 'sauce', label: 'Une sauce bonus',      desc: 'Au choix parmi nos 12 sauces maison',       color: '#10B981' },
  { id: 'gift',  label: '1 € offert',           desc: 'Sur votre prochaine visite chez Chez Ramo', color: '#8B5CF6' },
]

// Roue de la fortune — 2 gagnants sur 10 cases = 20% de chance
const WHEEL_SEGS = [
  { label: ['Boisson', 'offerte'],  bg: '#1E4D3A', fg: '#E8A93B', prizeId: 'drink' },
  { label: ['Pas de',  'chance'],   bg: '#F1F5F9', fg: '#94A3B8', prizeId: null    },
  { label: ['Retente', 'ta chance'],bg: '#FEF2F2', fg: '#EF4444', prizeId: null    },
  { label: ['Pas de',  'chance'],   bg: '#F1F5F9', fg: '#94A3B8', prizeId: null    },
  { label: ['Dessert', 'offert'],   bg: '#E8A93B', fg: '#1E4D3A', prizeId: 'cake'  },
  { label: ['Pas de',  'chance'],   bg: '#F1F5F9', fg: '#94A3B8', prizeId: null    },
  { label: ['Retente', 'ta chance'],bg: '#FEF2F2', fg: '#EF4444', prizeId: null    },
  { label: ['Pas de',  'chance'],   bg: '#F1F5F9', fg: '#94A3B8', prizeId: null    },
  { label: ['Pas de',  'chance'],   bg: '#FEF2F2', fg: '#EF4444', prizeId: null    },
  { label: ['Pas de',  'chance'],   bg: '#F1F5F9', fg: '#94A3B8', prizeId: null    },
]

const CONFETTI_COLORS = ['#1E4D3A','#E8A93B','#F5ECD9','#EC4899','#6BCB77']

function makeConfetti() {
  return Array.from({ length: 28 }, (_, i) => ({
    left:  `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 0.9}s`,
    dur:   `${1.5 + Math.random() * 1.1}s`,
    size:  `${7 + Math.random() * 7}px`,
    round: Math.random() > 0.5 ? '50%' : '3px',
  }))
}

function catItems(cats: string[]) {
  return MENU_DATA.filter(i => cats.includes(i.category))
}

const LS_KEY   = 'ramo_qr_session'
const ONE_HOUR = 3_600_000
const TEN_MIN  = 600_000

type Phase   = 'menu' | 'rating' | 'roulette' | 'prize' | 'thanks'
type Session = { start: number; finished?: boolean; finishedAt?: number; rated?: boolean }

function getSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null') } catch { return null }
}
function saveSession(s: Session) { localStorage.setItem(LS_KEY, JSON.stringify(s)) }

export default function MenuQRPage() {
  const [phase,            setPhase]            = useState<Phase>('menu')
  const [selCatId,         setSelCatId]         = useState('kebab')
  const [searchQ,          setSearchQ]          = useState('')
  const [showSearch,       setShowSearch]       = useState(false)
  const [showModal,        setShowModal]        = useState(false)
  const [showReviewPopup,  setShowReviewPopup]  = useState(false)
  const [table,            setTable]            = useState('')
  const [mounted,          setMounted]          = useState(false)
  const [selItem,          setSelItem]          = useState<typeof MENU_DATA[0] | null>(null)
  const [closingItem,      setClosingItem]      = useState(false)
  const [stars,            setStars]            = useState(0)
  const [hovered,          setHovered]          = useState(0)
  const [prize,            setPrize]            = useState<typeof PRIZES[0] | null>(null)
  const [feedback,         setFeedback]         = useState('')
  const [sent,             setSent]             = useState(false)
  const [wheelRot,         setWheelRot]         = useState(0)
  const [wheelSpun,        setWheelSpun]        = useState(false)
  const [confetti,         setConfetti]         = useState<ReturnType<typeof makeConfetti>>([])
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chipRowRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    if (!document.querySelector('script[data-dotlottie]')) {
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.4/dist/dotlottie-wc.js'
      s.type = 'module'
      s.dataset.dotlottie = '1'
      document.head.appendChild(s)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    setTable(new URLSearchParams(window.location.search).get('table') ?? '')
    const session = getSession()
    const now = Date.now()
    if (!session) {
      saveSession({ start: now })
      scheduleModal(ONE_HOUR)
    } else if (!session.rated) {
      if (session.finished && session.finishedAt) {
        const diff = now - session.finishedAt
        if (diff < TEN_MIN) { setPhase('rating'); return }
        if (diff > ONE_HOUR * 2) { saveSession({ start: now }); scheduleModal(ONE_HOUR); return }
      }
      const elapsed = now - session.start
      if (elapsed >= ONE_HOUR) setShowModal(true)
      else scheduleModal(ONE_HOUR - elapsed)
    }
    const popupT = setTimeout(() => {
      const s = getSession()
      if (!s?.rated) setShowReviewPopup(true)
    }, 35_000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      clearTimeout(popupT)
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!chipRowRef.current) return
    const btn = chipRowRef.current.querySelector<HTMLElement>(`[data-cat="${selCatId}"]`)
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selCatId])

  function scheduleModal(ms: number) {
    timerRef.current = setTimeout(() => setShowModal(true), ms)
  }

  const onFinished = () => {
    const s = getSession()
    saveSession({ ...(s ?? { start: Date.now() }), finished: true, finishedAt: Date.now() })
    setShowModal(false)
    setPhase('rating')
  }

  const onRate = () => {
    if (!stars) return
    const s = getSession()
    saveSession({ ...(s ?? { start: Date.now() }), rated: true })
    if (stars >= 4) {
      setWheelRot(0)
      setWheelSpun(false)
      setPhase('roulette')
    } else {
      setPhase('thanks')
    }
  }

  const spinWheel = () => {
    if (wheelSpun) return
    setWheelSpun(true)
    const N = WHEEL_SEGS.length
    const winIdx = [0, 4]
    const loseIdx = [1, 2, 3, 5, 6, 7, 8, 9]
    const isWin = Math.random() < 0.20
    const segIdx = isWin
      ? winIdx[Math.floor(Math.random() * winIdx.length)]
      : loseIdx[Math.floor(Math.random() * loseIdx.length)]
    const alignAngle = ((360 - (segIdx + 0.5) * (360 / N)) % 360 + 360) % 360
    const finalRot = wheelRot + alignAngle + 360 * 7
    setWheelRot(finalRot)
    setTimeout(() => {
      const seg = WHEEL_SEGS[segIdx]
      if (seg.prizeId) {
        const prz = PRIZES.find(p => p.id === seg.prizeId) ?? PRIZES[0]
        setPrize(prz)
        setConfetti(makeConfetti())
        setPhase('prize')
      } else {
        setPhase('thanks')
      }
    }, 5500)
  }

  const closeItem = () => {
    setClosingItem(true)
    setTimeout(() => { setSelItem(null); setClosingItem(false) }, 380)
  }

  const selCat   = CATEGORIES.find(c => c.id === selCatId) ?? CATEGORIES[0]
  const selItems = catItems(selCat.cats)
  const starLabels = ['','Vraiment désolés…','On peut mieux faire','Correct, merci !','Super, merci !','Parfait, merci !']
  const searchResults = searchQ.length > 1
    ? MENU_DATA.filter(i =>
        i.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQ.toLowerCase())
      )
    : []

  if (!mounted) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: QR_CSS }} />

      {/* ── LOADER LOTTIE ────────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
        style={{ background: 'white', animation: 'loaderOut .8s 5.5s both', pointerEvents: 'none' }}
      >
        {/* Animation Lottie */}
        <dotlottie-wc
          src="https://lottie.host/14372833-cb89-4521-8559-7ea458f94637/tvjUu4AUAQ.lottie"
          autoplay loop
          style={{ width: 300, height: 300, display: 'block', position: 'relative', zIndex: 1 }}
        />

        {/* Branding */}
        <div className="text-center" style={{ marginTop: -20, position: 'relative', zIndex: 2 }}>
          <p className="font-extrabold uppercase" style={{ fontFamily: 'var(--font-baloo)', fontSize: '2rem', letterSpacing: '.22em', color: '#1E4D3A' }}>
            Chez Ramo
          </p>
          <div style={{ width: 36, height: 2, borderRadius: 99, background: '#E8A93B', margin: '10px auto', animation: 'loaderBar 5.5s cubic-bezier(.4,0,.2,1) both' }} />
          <p className="font-medium uppercase" style={{ color: 'rgba(30,77,58,.4)', fontSize: '.7rem', letterSpacing: '.3em' }}>
            Notre carte
          </p>
        </div>
      </div>

      {/* ── PHASE OVERLAYS ───────────────────────────────────────────────────── */}
      {phase !== 'menu' && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto qr-noscroll" style={{ background: '#1E4D3A' }}>
          <div className="flex items-center justify-between px-5 py-4 bg-white/10 border-b border-white/20 shrink-0">
            <span className="font-extrabold text-base text-white tracking-wide" style={{ fontFamily: 'var(--font-baloo)' }}>CHEZ RAMO</span>
            <div className="flex items-center gap-1.5">
              {(['rating','roulette','prize'] as Phase[]).map(p => (
                <div key={p} className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: (phase === p || (p === 'prize' && phase === 'thanks')) ? 20 : 6, background: (phase === p || (p === 'prize' && phase === 'thanks')) ? '#E8A93B' : 'rgba(255,255,255,.3)' }} />
              ))}
            </div>
          </div>

          {phase === 'rating' && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center shadow-2xl qr-bounce-in">
                <StarOutlineIcon size={42} color="#1E4D3A" />
              </div>
              <div className="qr-slide-up" style={{ '--reveal-delay': '.1s' } as React.CSSProperties}>
                <p className="text-[10px] font-bold tracking-[.22em] uppercase mb-2 text-white/70">Votre avis compte</p>
                <h2 className="font-extrabold leading-none uppercase text-white" style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(28px,8vw,44px)' }}>
                  Comment s&apos;est<br/>passé votre repas ?
                </h2>
                <p className="mt-3 text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
                  Notez votre expérience et aidez-nous à nous améliorer
                </p>
              </div>
              <div className="flex gap-3 bg-white/15 rounded-full px-6 py-4 border border-white/20 qr-slide-up" style={{ '--reveal-delay': '.2s' } as React.CSSProperties}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setStars(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, WebkitTapHighlightColor: 'transparent', transform: stars === s ? 'scale(1.3)' : 'scale(1)', transition: 'transform 150ms' }}
                    aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
                  >
                    <StarFilledIcon size={36} color={((hovered || stars) >= s) ? '#FFD700' : 'white'} opacity={((hovered || stars) >= s) ? 1 : 0.3} />
                  </button>
                ))}
              </div>
              {stars > 0 && <p className="font-bold text-white text-sm tracking-wide qr-fade-in">{starLabels[stars]}</p>}
              <button onClick={onRate} disabled={!stars}
                className="w-full max-w-xs font-extrabold uppercase tracking-widest text-sm py-4 rounded-full shadow-lg disabled:opacity-25 disabled:cursor-not-allowed active:scale-[.98] transition-transform qr-slide-up"
                style={{ '--reveal-delay': '.3s', fontFamily: 'var(--font-baloo)', background: '#E8A93B', color: '#1E4D3A' } as React.CSSProperties}
              >
                Valider mon avis
              </button>
            </div>
          )}

          {phase === 'roulette' && (
            <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 gap-6 text-center">
              {/* Titre */}
              <div className="qr-slide-up">
                <p className="text-[10px] font-bold tracking-[.22em] uppercase mb-2 text-white/60">Tentez votre chance</p>
                <h2 className="font-extrabold leading-none uppercase text-white" style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(26px,7vw,38px)' }}>
                  La roue<br/>de la chance
                </h2>
              </div>

              {/* Roue SVG */}
              <div className="relative qr-pop-in" style={{ '--reveal-delay': '.15s' } as React.CSSProperties}>
                {/* Halo extérieur */}
                <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,169,59,.2) 0%, transparent 70%)', filter: 'blur(12px)', animation: 'qrPulse 2s ease-in-out infinite' }} />
                <svg width={270} height={270} viewBox="-135 -135 270 270" style={{ display: 'block', filter: 'drop-shadow(0 12px 32px rgba(0,0,0,.4))' }}>
                  {/* Roue rotative */}
                  <g style={{
                    transform: `rotate(${wheelRot}deg)`,
                    transition: wheelSpun ? 'transform 5.5s cubic-bezier(.15,.7,.05,1)' : 'none',
                  }}>
                    {WHEEL_SEGS.map((seg, i) => {
                      const N = WHEEL_SEGS.length
                      const R = 120
                      const a1 = (i * 360/N - 90) * Math.PI / 180
                      const a2 = ((i+1) * 360/N - 90) * Math.PI / 180
                      const x1 = R * Math.cos(a1), y1 = R * Math.sin(a1)
                      const x2 = R * Math.cos(a2), y2 = R * Math.sin(a2)
                      const aM = ((i + 0.5) * 360/N - 90) * Math.PI / 180
                      const tx = R * 0.63 * Math.cos(aM), ty = R * 0.63 * Math.sin(aM)
                      const tRot = (i + 0.5) * 360/N
                      return (
                        <g key={i}>
                          <path d={`M 0 0 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                            fill={seg.bg} stroke="white" strokeWidth="2.5" />
                          <g transform={`translate(${tx},${ty}) rotate(${tRot})`}>
                            {seg.label.map((line, li) => (
                              <text key={li} y={(li - (seg.label.length - 1) / 2) * 10}
                                fill={seg.fg} fontSize="8" fontWeight="800" textAnchor="middle" dominantBaseline="middle"
                                style={{ letterSpacing: '0.03em' }}>
                                {line}
                              </text>
                            ))}
                          </g>
                        </g>
                      )
                    })}
                    {/* Cercle central */}
                    <circle r={26} fill="white" stroke="rgba(0,0,0,.06)" strokeWidth="2" />
                    <text textAnchor="middle" dominantBaseline="middle" fontSize="20" y={1}>🎁</text>
                  </g>
                  {/* Pointeur fixe en haut */}
                  <polygon points="-12,-120 12,-120 0,-92" fill="#E8A93B" stroke="white" strokeWidth="2" strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.3))' }} />
                  {/* Bordure extérieure */}
                  <circle r={122} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="4" />
                  <circle r={118} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="2" />
                </svg>
              </div>

              {/* Bouton / Loading */}
              {!wheelSpun ? (
                <button onClick={spinWheel}
                  className="font-extrabold uppercase tracking-widest text-sm py-4 px-10 rounded-full active:scale-95 transition-transform qr-slide-up"
                  style={{ '--reveal-delay': '.3s', fontFamily: 'var(--font-baloo)', background: '#E8A93B', color: '#1E4D3A', boxShadow: '0 8px 32px rgba(232,169,59,.5)' } as React.CSSProperties}>
                  Tourner la roue !
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 qr-fade-in">
                  <div style={{ width: 160, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #E8A93B, #fff)', borderRadius: 99, animation: 'loaderBar 5.5s linear both' }} />
                  </div>
                  <p className="text-xs font-bold tracking-widest uppercase text-white/40">Ça tourne…</p>
                </div>
              )}
            </div>
          )}

          {phase === 'prize' && prize && (
            <div className="flex flex-col items-center justify-center flex-1 px-5 py-10 gap-5">
              {confetti.map((c, i) => (
                <div key={i} style={{ position: 'fixed', top: 0, left: c.left, width: c.size, height: c.size, background: c.color, borderRadius: c.round, zIndex: 60, pointerEvents: 'none', animation: `confetti ${c.dur} ease ${c.delay} forwards` }} />
              ))}
              <div className="text-center qr-slide-up">
                <p className="text-[10px] font-bold tracking-[.22em] uppercase mb-2 text-white/70">Vous avez gagné</p>
                <h2 className="font-extrabold leading-none uppercase text-white" style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(32px,9vw,52px)' }}>Félicitations !</h2>
              </div>
              <div className="w-full relative mt-10 qr-pop-in" style={{ maxWidth: 320, '--reveal-delay': '.15s' } as React.CSSProperties}>
                <div className="absolute -translate-x-1/2 -top-10 w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl z-10"
                  style={{ left: '50%', background: prize.color, boxShadow: `0 8px 32px ${prize.color}70`, animation: 'float 3s ease-in-out infinite' }}>
                  <PrizeSlotIcon id={prize.id} size={38} />
                </div>
                <div className="rounded-3xl pt-14 pb-7 px-6 text-center shadow-2xl bg-white">
                  <div className="font-extrabold text-xl mb-1 uppercase tracking-wide text-gray-900" style={{ fontFamily: 'var(--font-baloo)' }}>{prize.label}</div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{prize.desc}</p>
                  <div className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold tracking-wide border border-green-100 bg-green-50 text-gray-700">
                    <PhoneIcon size={13} color="#1E4D3A" />
                    Montrez cet écran à la caisse
                  </div>
                </div>
              </div>
              <div className="w-full rounded-3xl p-5 shadow-xl bg-white qr-slide-up" style={{ maxWidth: 320, '--reveal-delay': '.35s' } as React.CSSProperties}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">{[...Array(5)].map((_,i) => <StarFilledIcon key={i} size={13} color="#FFD700" opacity={1} />)}</div>
                  <span className="font-extrabold text-sm text-gray-900" style={{ fontFamily: 'var(--font-baloo)' }}>Partagez votre avis</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">Un avis Google nous aide vraiment. Ça prend 30 secondes !</p>
                <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-full w-full hover:opacity-90 transition-opacity"
                  style={{ fontFamily: 'var(--font-baloo)', background: '#4285F4' }}
                >
                  <GoogleIcon />
                  Laisser un avis Google
                </a>
              </div>
            </div>
          )}

          {phase === 'thanks' && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-xl qr-bounce-in">
                <HeartIcon size={40} color="white" />
              </div>
              <div className="qr-slide-up">
                <p className="text-[10px] font-bold tracking-[.22em] uppercase mb-2 text-white/70">Merci</p>
                <h2 className="font-extrabold leading-none uppercase text-white" style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(28px,8vw,44px)' }}>
                  Votre retour<br/>nous touche
                </h2>
                <p className="mt-3 text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
                  Nous allons tout mettre en œuvre pour vous satisfaire lors de votre prochaine visite.
                </p>
              </div>
              {!sent ? (
                <>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                    placeholder="Comment améliorer votre expérience ? (facultatif)" rows={3}
                    className="w-full max-w-sm rounded-2xl p-4 text-sm resize-none outline-none qr-slide-up placeholder:text-white/40"
                    style={{ '--reveal-delay': '.2s', background: 'rgba(255,255,255,.15)', border: '2px solid rgba(255,255,255,.25)', color: 'white' } as React.CSSProperties}
                  />
                  <button onClick={() => setSent(true)}
                    className="w-full max-w-sm font-extrabold uppercase tracking-widest text-sm py-4 rounded-full shadow-lg active:scale-[.98] transition-transform qr-slide-up"
                    style={{ '--reveal-delay': '.3s', fontFamily: 'var(--font-baloo)', background: '#E8A93B', color: '#1E4D3A' } as React.CSSProperties}
                  >
                    Envoyer
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-full px-6 py-3 qr-bounce-in bg-white/20 border border-white/30">
                  <CheckIcon size={20} color="white" />
                  <span className="font-bold text-white text-sm">Message envoyé — merci !</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL "Fini ?" ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[2rem] flex flex-col items-center gap-5 text-center anim-sheet-up relative" style={{ padding: '2.5rem 1.5rem calc(2rem + env(safe-area-inset-bottom,0px))' }} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full absolute top-3" />
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl mt-2" style={{ background: '#1E4D3A' }}>
              <UtensilsIcon size={30} color="white" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[.22em] uppercase mb-1" style={{ color: '#E8A93B' }}>Moment de vérité</p>
              <h3 className="font-extrabold text-2xl uppercase text-gray-900" style={{ fontFamily: 'var(--font-baloo)' }}>
                Avez-vous fini<br/>de manger ?
              </h3>
              <p className="mt-2 text-gray-400 text-sm">Donnez votre avis et tentez de gagner un cadeau !</p>
            </div>
            <div className="w-full flex flex-col gap-3 mt-1">
              <button onClick={onFinished}
                className="w-full text-white font-extrabold uppercase tracking-widest text-sm py-4 rounded-full shadow-lg active:scale-[.98] transition-transform"
                style={{ fontFamily: 'var(--font-baloo)', background: '#1E4D3A', boxShadow: '0 8px 24px rgba(30,77,58,.35)' }}
              >
                Oui, j&apos;ai fini
              </button>
              <button onClick={() => setShowModal(false)}
                className="w-full font-semibold py-3.5 rounded-full text-sm border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
              >
                Non, je suis encore là
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW POPUP ────────────────────────────────────────────────────── */}
      {showReviewPopup && phase === 'menu' && !showModal && (
        <div className="fixed left-4 right-4 z-40 qr-popup-in" style={{ bottom: 88, maxWidth: 440, margin: '0 auto' }}>
          <div className="bg-white rounded-3xl p-4 flex items-center gap-3.5" style={{ boxShadow: '0 8px 40px rgba(0,0,0,.18)', border: '1px solid rgba(232,169,59,.2)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1E4D3A, #2d6b50)' }}>
              <GiftIcon size={22} color="#E8A93B" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-baloo)' }}>Vous avez apprécié ?</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Laissez un avis et gagnez un cadeau !</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => { setShowReviewPopup(false); setShowModal(true) }}
                className="font-extrabold uppercase text-white py-1.5 px-3 rounded-xl text-[10px] tracking-wide transition active:scale-95"
                style={{ fontFamily: 'var(--font-baloo)', background: '#1E4D3A' }}
              >
                Donner mon avis
              </button>
              <button onClick={() => setShowReviewPopup(false)} className="text-[10px] text-gray-400 font-medium text-center">
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ITEM DETAIL MODAL ──────────────────────────────────────────────── */}
      {selItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: closingItem ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)', transition: 'background .38s ease-in-out' }}
          onClick={closeItem}>
          <div className="w-full max-w-md bg-white overflow-hidden"
            style={{ borderRadius: '2rem 2rem 0 0', animation: closingItem ? 'itemSheetDown .38s ease-in-out both' : 'itemSheetUp .45s ease-in-out both' }}
            onClick={e => e.stopPropagation()}>
            {/* Image */}
            <div className="relative" style={{ height: 230, background: IMG_BG[MENU_DATA.findIndex(m => m.title === selItem.title) % IMG_BG.length] }}>
              <SmartFoodImg
                src={getImg(selItem.title, '')} alt={selItem.title}
                size={230} bg="transparent" radius={0}
              />
              <button onClick={closeItem}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: 'rgba(255,255,255,.9)', WebkitTapHighlightColor: 'transparent' }}>
                <CloseIcon size={16} color="#1E4D3A" />
              </button>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-white/50" />
            </div>
            {/* Content */}
            <div className="px-6 py-5" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-xl uppercase text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-baloo)' }}>
                    {selItem.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">{selItem.description}</p>
                </div>
                <div className="shrink-0 font-extrabold text-2xl" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>
                  {selItem.price}&thinsp;€
                </div>
              </div>
              {selItem.menu_price && (
                <div className="mt-4 p-4 rounded-2xl flex items-center justify-between"
                  style={{ background: '#FFFBF0', border: '1.5px solid rgba(232,169,59,.3)' }}>
                  <div>
                    <div className="font-extrabold text-sm uppercase" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>En menu</div>
                    <div className="text-xs text-gray-400 mt-0.5">Boisson + frites incluses</div>
                  </div>
                  <div className="font-extrabold text-xl" style={{ fontFamily: 'var(--font-baloo)', color: '#E8A93B' }}>
                    {selItem.menu_price}&thinsp;€
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── APP SHELL ───────────────────────────────────────────────────────── */}
      <div className="min-h-screen flex flex-col antialiased relative" style={{ background: '#1E4D3A' }}>
        {/* Doodle bg sur tout le vert */}
        <div className="pattern-bg fixed inset-0 pointer-events-none z-0" style={{ opacity: .07 }} />

        {/* HEADER */}
        <header className="sticky top-0 z-40 shrink-0 relative" style={{ background: 'rgba(30,77,58,.92)', backdropFilter: 'blur(12px)' }}>
          <div className="relative flex items-center justify-between px-4 py-3.5">
            <div className="flex flex-col">
              <div className="font-extrabold text-white uppercase tracking-[.08em]" style={{ fontFamily: 'var(--font-baloo)', fontSize: '1.1rem' }}>Chez Ramo</div>
              <div className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,.55)' }}>
                {table ? `Table ${table}` : 'Bienvenue !'}
              </div>
            </div>
            <button
              onClick={() => { setShowSearch(s => !s); setSearchQ('') }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: showSearch ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.2)', color: 'white' }}
            >
              {showSearch ? <CloseIcon size={18} /> : <SearchIcon size={18} />}
            </button>
          </div>
          {showSearch && (
            <div className="px-4 pb-4 qr-slide-down">
              <div className="bg-white rounded-2xl flex items-center gap-2.5 px-4 py-3.5 shadow-lg">
                <SearchIcon size={16} color="#1E4D3A" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Kebab, tacos, burger…"
                  className="flex-1 text-sm text-gray-800 outline-none placeholder:text-gray-300 bg-transparent"
                />
                {searchQ && (
                  <button onClick={() => setSearchQ('')}>
                    <CloseIcon size={15} color="#ccc" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* CONTENT */}
        <div ref={contentRef} className="flex-1 overflow-y-auto qr-noscroll pb-24" style={{ background: '#1E4D3A' }}>

          {showSearch && searchQ.length > 1 ? (
            /* ── SEARCH RESULTS — sur fond vert ── */
            <div className="min-h-screen qr-section-in px-4 pt-4 pb-32">
              <p className="text-white/50 text-[10px] font-extrabold uppercase tracking-[.14em] mb-3" style={{ fontFamily: 'var(--font-baloo)' }}>
                {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} pour «&nbsp;{searchQ}&nbsp;»
              </p>
              <div className="space-y-2.5">
                {searchResults.length > 0 ? searchResults.map((item, i) => {
                  const cat = CATEGORIES.find(c => c.cats.includes(item.category))
                  return (
                    <div key={item.title} className="flex items-center gap-3 rounded-2xl p-3 qr-item-in"
                      style={{ '--item-delay': `${i * 30}ms`, background: 'rgba(255,255,255,.92)', boxShadow: '0 4px 20px rgba(0,0,0,.15)' } as React.CSSProperties}>
                      <SmartFoodImg
                        src={getImg(item.title, cat?.img ?? '')} alt={item.title}
                        size={96} bg={IMG_BG[i % IMG_BG.length]}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-sm uppercase truncate" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>{item.title}</div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">{item.description}</div>
                      </div>
                      <div className="font-extrabold text-sm shrink-0" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>{item.price}&thinsp;€</div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-20">
                    <SearchIcon size={40} color="rgba(255,255,255,.2)" />
                    <p className="text-sm font-semibold mt-3 text-white/50">Aucun résultat</p>
                    <p className="text-xs mt-1 text-white/30">Essayez «&nbsp;kebab&nbsp;» ou «&nbsp;tacos&nbsp;»</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── MAIN VIEW ── */
            <>
              {/* Greeting */}
              <div className="px-5 pt-4 pb-2">
                <h1 className="font-extrabold text-white leading-tight qr-slide-up" style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(18px,5.5vw,26px)' }}>
                  Que souhaitez-vous<br/>manger aujourd&apos;hui ?
                </h1>
              </div>

              {/* Best sellers */}
              <div className="mt-5">
                <div className="flex items-center justify-between px-5 mb-3">
                  <h2 className="font-extrabold text-white text-[11px] uppercase tracking-[.12em]" style={{ fontFamily: 'var(--font-baloo)' }}>
                    Les plus commandés
                  </h2>
                  <span className="text-white/40 text-xs font-semibold">5 plats</span>
                </div>
                <div className="flex gap-3 qr-noscroll qr-hscroll px-5 pb-4">
                  {BEST_SELLERS.map((bs, i) => (
                    <button
                      key={bs.title}
                      onClick={() => setSelCatId(bs.catId)}
                      className="flex flex-col shrink-0 active:scale-95 transition-transform qr-card-in"
                      style={{ width: 142, '--card-delay': `${i * 75}ms` } as React.CSSProperties}
                    >
                      <div className="bg-white rounded-3xl shadow-xl overflow-visible relative" style={{ paddingBottom: 0 }}>
                        <span
                          className="absolute top-2.5 left-2.5 z-10 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ fontFamily: 'var(--font-baloo)', background: '#1E4D3A' }}
                        >
                          {bs.badge}
                        </span>
                        <div className="rounded-t-3xl overflow-hidden" style={{ background: BS_BG[i % BS_BG.length], height: 130, padding: '4px 4px 0 4px' }}>
                          <img
                            src={BASE + bs.img} alt={bs.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                          />
                        </div>
                        <div className="px-3 pt-5 pb-3">
                          <div className="font-extrabold text-[11px] uppercase text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-baloo)' }}>{bs.title}</div>
                          <div className="font-extrabold text-sm mt-1" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>{bs.price}&thinsp;€</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Menu sur fond vert avec doodle ── */}
              <div className="px-0 pb-4" style={{ minHeight: '60vh' }}>

                {/* Category chips — sticky */}
                <div
                  ref={chipRowRef}
                  className="sticky z-10 pt-3 pb-3"
                  style={{ top: showSearch ? 116 : 62, backdropFilter: 'blur(12px)', background: 'rgba(30,77,58,.85)' }}
                >
                  <div className="flex gap-2 qr-noscroll qr-hscroll" style={{ paddingLeft: 16, paddingRight: 16 }}>
                    {CATEGORIES.map(cat => {
                      const active = selCatId === cat.id
                      return (
                        <button
                          key={cat.id}
                          data-cat={cat.id}
                          onClick={() => setSelCatId(cat.id)}
                          className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 active:scale-95"
                          style={{
                            fontFamily: 'var(--font-baloo)',
                            background: active ? '#E8A93B' : 'rgba(255,255,255,.12)',
                            color: active ? '#1E4D3A' : 'rgba(255,255,255,.75)',
                            boxShadow: active ? '0 4px 16px rgba(232,169,59,.45)' : 'none',
                            transform: active ? 'scale(1.06)' : 'scale(1)',
                          }}
                        >
                          {cat.label.split(' & ')[0]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Items list */}
                <div className="px-4 pt-4 pb-32">
                  <div key={selCatId} className="qr-section-in">
                    {/* Section title */}
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-extrabold text-base uppercase text-white" style={{ fontFamily: 'var(--font-baloo)', letterSpacing: '-.01em' }}>
                        {selCat.label}
                      </h3>
                      <span className="ml-auto text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase" style={{ background: 'rgba(232,169,59,.25)', color: '#E8A93B', fontFamily: 'var(--font-baloo)' }}>
                        {selItems.length} plats
                      </span>
                    </div>
                    {/* Cards */}
                    <div className="space-y-2.5">
                      {selItems.map((item, i) => (
                        <div
                          key={item.title}
                          role="button"
                          onClick={() => setSelItem(item)}
                          className="flex items-center gap-3.5 rounded-2xl p-3 qr-item-in qr-item-hover"
                          style={{
                            '--item-delay': `${i * 35}ms`,
                            background: 'rgba(255,255,255,.92)',
                            boxShadow: '0 4px 20px rgba(0,0,0,.15)',
                            backdropFilter: 'blur(8px)',
                            cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                          } as React.CSSProperties}
                        >
                          <SmartFoodImg
                            src={getImg(item.title, selCat.img)} alt={item.title}
                            size={96} bg={IMG_BG[i % IMG_BG.length]}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-extrabold text-[13px] uppercase leading-tight" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>
                              {item.title}
                            </div>
                            <div className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed text-gray-500">{item.description}</div>
                            {item.menu_price && (
                              <span className="inline-block mt-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase" style={{ background: '#FFF3E8', color: '#E8A93B' }}>
                                Menu {item.menu_price}&thinsp;€
                              </span>
                            )}
                          </div>
                          <div className="shrink-0 font-extrabold text-[14px]" style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A' }}>
                            {item.price}&thinsp;€
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── BOTTOM NAV — pill flottant ──────────────────────────────────── */}
        <div
          className="fixed z-40"
          style={{
            bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
            left: '50%', transform: 'translateX(-50%)',
            width: 'min(calc(100% - 32px), 360px)',
          }}
        >
          <nav
            className="flex items-center relative"
            style={{
              background: 'white',
              borderRadius: 28,
              height: 68,
              boxShadow: '0 8px 40px rgba(30,77,58,.25), 0 2px 8px rgba(30,77,58,.12)',
              padding: '0 8px',
              overflow: 'visible',
            }}
          >
            {/* Accueil */}
            <button
              onClick={() => { setShowSearch(false); setSearchQ(''); contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-90 rounded-2xl"
              style={{ color: !showSearch ? '#1E4D3A' : '#bbb' }}
            >
              <div className="relative">
                <HomeIcon size={20} />
              </div>
              <span className="text-[8.5px] font-extrabold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-baloo)' }}>
                Accueil
              </span>
            </button>

            {/* Centre FAB — Finir & noter */}
            <div className="relative flex flex-col items-center justify-center" style={{ width: 80, overflow: 'visible' }}>
              <button
                onClick={() => setShowModal(true)}
                className="flex flex-col items-center justify-center gap-1 transition-all active:scale-90"
                style={{ overflow: 'visible' }}
              >
                <div
                  style={{
                    width: 58, height: 58, borderRadius: 20,
                    background: 'linear-gradient(145deg, #E8A93B 0%, #d4922a 100%)',
                    boxShadow: '0 -4px 20px rgba(232,169,59,.4), 0 6px 20px rgba(232,169,59,.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: -28,
                    animation: 'fabGlow 2.5s ease-in-out infinite',
                    position: 'relative',
                  }}
                >
                  {/* Bordure verte autour du FAB */}
                  <div style={{ position: 'absolute', inset: -3, borderRadius: 24, border: '3px solid white', zIndex: -1 }} />
                  <GiftIcon size={26} color="#1E4D3A" />
                </div>
                <span className="text-[8px] font-extrabold uppercase tracking-wide mt-0.5"
                  style={{ fontFamily: 'var(--font-baloo)', color: '#1E4D3A', whiteSpace: 'nowrap' }}>
                  Finir &amp; noter
                </span>
              </button>
            </div>

            {/* Recherche */}
            <button
              onClick={() => { setShowSearch(s => !s); setSearchQ('') }}
              className="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-90 rounded-2xl"
              style={{ color: showSearch ? '#1E4D3A' : '#bbb' }}
            >
              <div className="relative">
                <SearchIcon size={20} />
              </div>
              <span className="text-[8.5px] font-extrabold uppercase tracking-wide"
                style={{ fontFamily: 'var(--font-baloo)' }}>
                Recherche
              </span>
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function UtensilsIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z"/><path d="M21 15v7"/></svg>
}
function CheckIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
}
function SearchIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function CloseIcon({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function HomeIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function GiftIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
}
function StarOutlineIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function StarFilledIcon({ size = 24, color = '#FFD700', opacity = 1 }: { size?: number; color?: string; opacity?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" style={{ opacity }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function HeartIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
}
function PhoneIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
}
function GoogleIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
}
function PrizeSlotIcon({ id, size = 28 }: { id: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: '#fff', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (id) {
    case 'drink': return <svg {...p}><path d="M5 2h14l-2 16a2 2 0 01-2 2H9a2 2 0 01-2-2L5 2z"/><path d="M3 2h18"/><path d="M10 7h4"/></svg>
    case 'fries': return <svg {...p}><rect x="6" y="12" width="12" height="10" rx="1"/><path d="M8 12V6a1 1 0 012 0v6"/><path d="M12 12V4a1 1 0 012 0v8"/><path d="M16 12V7a1 1 0 012 0v5"/></svg>
    case 'cake':  return <svg {...p}><path d="M20 21v-8a2 2 0 00-2-2H6a2 2 0 00-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v2M12 8v2M17 8v2"/></svg>
    case 'sauce': return <svg {...p}><path d="M8 2h8l1 5H7L8 2z"/><path d="M7 7h10v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7z"/><path d="M9 12h6M9 16h6"/></svg>
    default:      return <svg {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
  }
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const QR_CSS = `
  .qr-noscroll::-webkit-scrollbar { display: none; }
  .qr-noscroll { -ms-overflow-style: none; scrollbar-width: none; }

  /* Scroll horizontal fluide sur mobile */
  .qr-hscroll {
    display: flex;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
    overscroll-behavior-x: contain;
    scroll-snap-type: none;
    -ms-overflow-style: none;
    scrollbar-width: none;
    pointer-events: auto;
    user-select: none;
    -webkit-user-select: none;
  }
  .qr-hscroll::-webkit-scrollbar { display: none; }
  .qr-hscroll > * { pointer-events: auto; flex-shrink: 0; touch-action: manipulation; }

  @keyframes loaderOut    { from { opacity:1; } to { opacity:0; } }
  @keyframes dotBounce    { from { opacity:.3; transform:translateY(0); } to { opacity:1; transform:translateY(-5px); } }
  @keyframes loaderBar    { from { width:0%; } to { width:100%; } }

  dotlottie-wc,
  dotlottie-wc canvas,
  dotlottie-wc * {
    background: transparent !important;
  }
  @keyframes slotScroll   { 0% { transform:translateY(0); } 100% { transform:translateY(calc(-100% + 120px)); } }
  @keyframes confetti     { 0% { transform:translateY(-30px) rotate(0deg); opacity:1; } 100% { transform:translateY(100vh) rotate(700deg); opacity:0; } }
  @keyframes qrSlideUp    { from { transform:translateY(28px); opacity:0; } to { transform:none; opacity:1; } }
  @keyframes qrPopIn      { 0% { transform:scale(.8); opacity:0; } 65% { transform:scale(1.06); } 85% { transform:scale(.97); } 100% { transform:scale(1); opacity:1; } }
  @keyframes qrBounceIn   { 0% { transform:scale(0) rotate(-6deg); opacity:0; } 65% { transform:scale(1.2) rotate(2deg); } 82% { transform:scale(.94); } 100% { transform:scale(1) rotate(0); opacity:1; } }
  @keyframes qrFadeIn     { from { opacity:0; } to { opacity:1; } }
  @keyframes qrPulse      { 0%,100% { opacity:.4; transform:scale(1); } 50% { opacity:.8; transform:scale(1.04); } }
  @keyframes float        { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }

  @keyframes imgFloat1    { 0%,100% { transform:translateY(0) rotate(-3deg) scale(1); } 50% { transform:translateY(-10px) rotate(-5deg) scale(1.04); } }
  @keyframes imgFloat2    { 0%,100% { transform:translateY(0) rotate(2deg) scale(1); } 50% { transform:translateY(-12px) rotate(4deg) scale(1.05); } }
  @keyframes imgFloat3    { 0%,100% { transform:translateY(0) rotate(-1deg) scale(1); } 50% { transform:translateY(-8px) rotate(2deg) scale(1.03); } }
  @keyframes imgFloat4    { 0%,100% { transform:translateY(0) rotate(3deg) scale(1); } 50% { transform:translateY(-11px) rotate(5deg) scale(1.04); } }
  @keyframes imgFloat5    { 0%,100% { transform:translateY(0) rotate(-4deg) scale(1); } 50% { transform:translateY(-9px) rotate(-2deg) scale(1.03); } }

  @keyframes qrCardIn     { from { opacity:0; transform:scale(.85) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes qrSectionIn  { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:none; } }
  @keyframes qrItemIn     { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes qrSlideDown  { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:none; } }
  @keyframes qrPopupIn    { from { opacity:0; transform:translateY(40px); } 80% { transform:translateY(-6px); } to { opacity:1; transform:none; } }
  @keyframes fabGlow      { 0%,100% { box-shadow:0 -4px 20px rgba(30,77,58,.35),0 6px 16px rgba(30,77,58,.35); } 50% { box-shadow:0 -4px 28px rgba(30,77,58,.55),0 8px 24px rgba(30,77,58,.5); } }

  @keyframes qrTabIn    { from { transform:scaleX(0); } to { transform:scaleX(1); } }
  @keyframes qrItemHover { to { transform:translateX(3px); box-shadow:0 4px 20px rgba(30,77,58,.12); } }
  @keyframes qrGoldShine {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes qrNavPop   { 0%{transform:scale(1)} 40%{transform:scale(.88)} 70%{transform:scale(1.08)} 100%{transform:scale(1)} }
  @keyframes qrPriceIn  { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
  @keyframes qrBgPulse  {
    0%,100% { background-color: rgba(30,77,58,.0); }
    50%     { background-color: rgba(30,77,58,.04); }
  }
  @keyframes itemSheetUp   { from { transform:translateY(100%); } to { transform:translateY(0); } }
  @keyframes itemSheetDown { from { transform:translateY(0); }   to { transform:translateY(100%); } }

  .qr-slide-up      { animation: qrSlideUp   .55s ease-in-out var(--reveal-delay,0s) both; }
  .qr-slide-down    { animation: qrSlideDown .4s  ease-in-out both; }
  .qr-pop-in        { animation: qrPopIn     .6s  ease-in-out var(--reveal-delay,0s) both; }
  .qr-bounce-in     { animation: qrBounceIn  .65s ease-in-out var(--reveal-delay,0s) both; }
  .qr-fade-in       { animation: qrFadeIn    .45s ease-in-out var(--reveal-delay,0s) both; }
  .qr-pulse         { animation: qrPulse 2s ease-in-out infinite; position:absolute; }
  .qr-card-in       { animation: qrCardIn   .55s ease-in-out var(--card-delay,0s) both; }
  .qr-section-in    { animation: qrSectionIn .45s ease-in-out both; }
  .qr-item-in       { animation: qrItemIn   .45s ease-in-out var(--item-delay,0s) both; }
  .qr-popup-in      { animation: qrPopupIn   .6s  ease-in-out both; }
  .qr-tab-indicator { animation: qrTabIn    .35s ease-in-out both; }
  .qr-item-hover    { transition: transform .22s ease-in-out, box-shadow .22s ease-in-out; }
  .qr-item-hover:active { transform: scale(.97); box-shadow: 0 1px 4px rgba(30,77,58,.08) !important; }
  .qr-item-sheet    { animation: itemSheetUp .45s ease-in-out both; }
`
