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

const BASE    = process.env.NEXT_PUBLIC_BASE_PATH    ?? ''
const SB_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SB_KEY  = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ''

async function saveFeedback(stars: number, message: string, table_num: string, prize: string | null) {
  try {
    // Appel direct Supabase (fonctionne depuis la page statique GitHub Pages)
    if (SB_URL && SB_KEY) {
      await fetch(`${SB_URL}/rest/v1/feedbacks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SB_KEY,
          Authorization: `Bearer ${SB_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ stars, message: message.trim() || null, table_num: table_num || null, prize }),
      })
    } else {
      // Fallback : route API Next.js (dev local)
      await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, message, table_num, prize }),
      })
    }
  } catch { /* silencieux */ }
}

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

// Couleurs claires par catégorie
const CAT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  kebab:     { bg: '#E6F4EE', text: '#1E4D3A', accent: '#1E4D3A' },
  tacos:     { bg: '#FFF0E4', text: '#A84E0E', accent: '#C8621A' },
  burgers:   { bg: '#FFECEC', text: '#B82C2C', accent: '#D63B3B' },
  assiettes: { bg: '#F0EAFF', text: '#5C2EA0', accent: '#7B3FC4' },
  plats:     { bg: '#E4F3F7', text: '#14566A', accent: '#1A6B7A' },
  salades:   { bg: '#E8F5EB', text: '#1E6430', accent: '#2E7D3C' },
  drinks:    { bg: '#FFF4E4', text: '#8A4008', accent: '#B8560A' },
}

const BS_COLORS = ['#FFF3E0', '#E8F5E9', '#E3F2FD', '#FCE4EC', '#F3E5F5']

const CATEGORIES = [
  { id: 'kebab',     label: 'KEBAB & GALETTES', img: '/uploads/cut/Kebab%20Frites.png',      cats: ['Sandwichs Vedettes','Nos Spécialités','Tradition & Galettes'] },
  { id: 'tacos',     label: 'TACOS',             img: '/uploads/cut/Maxi%20Tacos.png',         cats: ['Tacos'] },
  { id: 'burgers',   label: 'BURGERS & FINGER',  img: '/uploads/cut/Cheese%20Burger.png',      cats: ['Burgers','Finger Food'] },
  { id: 'assiettes', label: 'ASSIETTES',         img: '/uploads/cut/Assiette%20Kebab.png',     cats: ['Assiettes Gourmet','Assiettes Gourmet (Suite)','Assiettes & Salade'] },
  { id: 'plats',     label: 'NOS PLATS',          img: '/uploads/cut/Kofte.png',                cats: ['Plats Maison','Qofte Grillées','Burek & Spécialités'] },
  { id: 'salades',   label: 'SALADES & BUREK',   img: '/uploads/cut/Salade%20du%20Berger.png', cats: ['Salades Fraîches','Salades & Burek'] },
  { id: 'drinks',    label: 'DESSERTS & DRINKS', img: '/uploads/cut/Tiramisu.png',             cats: ['Desserts','Menu Enfants','Accompagnements & Sauces','Boissons & Boissons Chaudes'] },
]

const BEST_SELLERS = [
  { title: 'Kebab Frites',   price: '9,50',  img: '/uploads/cut/Kebab%20Frites.png',   catId: 'kebab'   },
  { title: 'Chicken Burger', price: '7,00',  img: '/uploads/cut/Chicken%20Burger.png', catId: 'burgers' },
  { title: 'Kebab Géant',    price: '11,00', img: '/uploads/cut/Kebab%20Geant.png',    catId: 'kebab'   },
  { title: 'Cheese Burger',  price: '6,00',  img: '/uploads/cut/Cheese%20Burger.png',  catId: 'burgers' },
  { title: 'Miche Kebab',    price: '10,50', img: '/uploads/cut/Miche%20Kebab.png',    catId: 'kebab'   },
]

const PRIZES = [
  { id: 'drink', label: 'Une boisson offerte',  desc: 'Coca, Fanta, Sprite ou eau plate (33 cl)', color: '#3B82F6' },
  { id: 'fries', label: 'Des frites offertes',  desc: 'Petite portion de frites',                  color: '#F59E0B' },
  { id: 'cake',  label: 'Un dessert offert',    desc: 'Trilece ou Tiramisu',                       color: '#EC4899' },
  { id: 'sauce', label: 'Une sauce bonus',      desc: 'Au choix parmi nos 12 sauces',              color: '#10B981' },
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
  const [view,             setView]             = useState<'categories' | 'items'>('categories')
  const [selCatId,         setSelCatId]         = useState('kebab')
  const [searchQ,          setSearchQ]          = useState('')
  const [showSearch,       setShowSearch]       = useState(false)
  const [showModal,        setShowModal]        = useState(false)
  const [showReviewPopup,  setShowReviewPopup]  = useState(false)
  const [table,            setTable]            = useState('')
  const [mounted,          setMounted]          = useState(false)
  const [screen,           setScreen]           = useState<'welcome' | 'home'>(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ramo_welcomed')) return 'home'
    return 'welcome'
  })
  const [bannerIdx,        setBannerIdx]        = useState(0)
  const bannerRef     = useRef<HTMLDivElement>(null)
  const touchStartXRef = useRef(0)
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
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef  = useRef<HTMLDivElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  function getAC() {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!audioCtxRef.current) audioCtxRef.current = new AC()
    return audioCtxRef.current
  }

  function playTap(freq = 700) {
    try {
      const ctx = getAC()
      const doPlay = () => {
        const t = ctx.currentTime + 0.005
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.07)
        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
        osc.start(t); osc.stop(t + 0.11)
      }
      // Si le context est déjà running : joue immédiatement
      // Sinon : resume() d'abord (le context a déjà été unlocked par le touchstart)
      if (ctx.state === 'running') { doPlay() }
      else { ctx.resume().then(doPlay).catch(() => {}) }
    } catch { /* silencieux si navigateur bloque */ }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Crée et unlock le context dès le premier toucher — iOS exige que
    // la création + resume() se fassent dans une gesture utilisateur
    const wakeCtx = () => {
      try {
        const ctx = getAC()
        if (ctx.state !== 'running') void ctx.resume()
      } catch { /* ignore */ }
    }
    document.addEventListener('touchstart', wakeCtx, { passive: true, capture: true })

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, [role="button"]')) playTap()
    }
    document.addEventListener('click', handler, { capture: true })
    return () => {
      document.removeEventListener('touchstart', wakeCtx, { capture: true })
      document.removeEventListener('click', handler, { capture: true })
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
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selCatId])

  const BANNERS_COUNT = 4
  useEffect(() => {
    if (view !== 'categories' || showSearch) return
    const id = setInterval(() => {
      setBannerIdx(idx => (idx + 1) % BANNERS_COUNT)
    }, 4000)
    return () => clearInterval(id)
  }, [view, showSearch])

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

      {/* ── WELCOME SCREEN (première visite) ────────────────────────────────── */}
      {screen === 'welcome' && mounted && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#1E4D3A',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '60px 28px 48px',
          textAlign: 'center',
        }}>
          <div className="pattern-bg" style={{ position: 'absolute', inset: 0, opacity: 0.06 }} />

          {/* Logo */}
          <div style={{ zIndex: 1 }}>
            <p style={{ fontFamily: 'var(--font-baloo)', fontSize: '2rem', fontWeight: 900, color: 'white', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              CHEZ RAMO
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.25em', textTransform: 'uppercase' as const, marginTop: 4 }}>
              Kebab Artisanal · Lagnieu
            </p>
          </div>

          {/* Kebab flottant */}
          <div style={{ zIndex: 1, position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute', borderRadius: '50%', width: 300, height: 300,
              background: 'radial-gradient(circle, rgba(232,169,59,.2) 0%, transparent 70%)',
            }} />
            <img
              src={`${BASE}/uploads/lucid-origin_A_award-winning_professional_studio_food_photography_of_a_gourmet_luxury_kebab._-0.png`}
              alt="Kebab Chez Ramo"
              style={{
                width: 280, height: 280, objectFit: 'contain',
                filter: 'drop-shadow(0 28px 56px rgba(0,0,0,0.55))',
                animation: 'heroFloat 3.5s ease-in-out infinite',
                position: 'relative', zIndex: 1,
              }}
            />
          </div>

          {/* Texte + CTA */}
          <div style={{ zIndex: 1, width: '100%' }}>
            <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(22px,6vw,30px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 10 }}>
              Bienvenue{table ? ` — Table ${table}` : ' chez Ramo !'}
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, marginBottom: 28, letterSpacing: '0.02em' }}>
              Broche artisanale · Sauces maison · Kebab généreux
            </p>
            <button
              onClick={() => { playTap(600); sessionStorage.setItem('ramo_welcomed', '1'); setScreen('home') }}
              style={{
                width: '100%', background: '#E8A93B', color: '#1E4D3A',
                fontFamily: 'var(--font-baloo)', fontWeight: 900,
                fontSize: 15, textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                border: 'none', borderRadius: 99, padding: '18px 24px',
                boxShadow: '0 8px 28px rgba(232,169,59,.45)',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              Voir la carte
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE OVERLAYS ───────────────────────────────────────────────────── */}
      {phase !== 'menu' && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto qr-noscroll" style={{ background: 'white' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F0F0F0', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--font-baloo)', fontSize: 15, fontWeight: 900, color: '#111', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Chez Ramo</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {(['rating','roulette','prize'] as Phase[]).map(p => (
                <div key={p} style={{ height: 5, borderRadius: 99, transition: 'all .5s', width: (phase === p || (p === 'prize' && phase === 'thanks')) ? 20 : 5, background: (phase === p || (p === 'prize' && phase === 'thanks')) ? '#111' : '#E0E0E0' }} />
              ))}
            </div>
          </div>

          {phase === 'rating' && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-7 text-center">
              <div style={{ width: 72, height: 72, borderRadius: 24, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="qr-bounce-in">
                <StarOutlineIcon size={36} color="white" />
              </div>
              <div className="qr-slide-up" style={{ '--reveal-delay': '.1s' } as React.CSSProperties}>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#AAA', marginBottom: 8 }}>Votre avis compte</p>
                <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(26px,8vw,42px)', fontWeight: 900, color: '#111', lineHeight: 1.05, textTransform: 'uppercase' as const }}>
                  Comment s&apos;est<br/>passé votre repas ?
                </h2>
                <p style={{ marginTop: 12, color: '#999', fontSize: 13, lineHeight: 1.6 }}>
                  Notez votre expérience et aidez-nous à nous améliorer
                </p>
              </div>
              <div style={{ '--reveal-delay': '.2s', display: 'flex', gap: 10, background: '#F5F5F5', borderRadius: 99, padding: '14px 20px' } as React.CSSProperties} className="qr-slide-up">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setStars(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, WebkitTapHighlightColor: 'transparent', transform: stars === s ? 'scale(1.3)' : 'scale(1)', transition: 'transform 150ms' }}
                    aria-label={`${s} étoile${s > 1 ? 's' : ''}`}
                  >
                    <StarFilledIcon size={36} color={((hovered || stars) >= s) ? '#F5A623' : '#D5D5D5'} opacity={1} />
                  </button>
                ))}
              </div>
              {stars > 0 && <p style={{ fontWeight: 700, color: '#111', fontSize: 14, letterSpacing: '0.03em' }} className="qr-fade-in">{starLabels[stars]}</p>}
              <button onClick={onRate} disabled={!stars}
                className="w-full max-w-xs active:scale-[.98] transition-transform qr-slide-up"
                style={{ '--reveal-delay': '.3s', fontFamily: 'var(--font-baloo)', background: '#111', color: 'white', border: 'none', borderRadius: 99, padding: '16px 24px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', opacity: stars ? 1 : 0.25, boxShadow: '0 6px 20px rgba(0,0,0,.18)' } as React.CSSProperties}
              >
                Valider mon avis
              </button>
            </div>
          )}

          {phase === 'roulette' && (
            <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 gap-6 text-center">
              <div className="qr-slide-up">
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#AAA', marginBottom: 8 }}>Tentez votre chance</p>
                <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(24px,7vw,36px)', fontWeight: 900, color: '#111', lineHeight: 1.05, textTransform: 'uppercase' as const }}>
                  La roue<br/>de la chance
                </h2>
              </div>

              <div className="relative qr-pop-in" style={{ '--reveal-delay': '.15s' } as React.CSSProperties}>
                <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,.06) 0%, transparent 70%)', filter: 'blur(12px)', animation: 'qrPulse 2s ease-in-out infinite' }} />
                <svg width={270} height={270} viewBox="-135 -135 270 270" style={{ display: 'block', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,.15))' }}>
                  <g style={{ transform: `rotate(${wheelRot}deg)`, transition: wheelSpun ? 'transform 5.5s cubic-bezier(.15,.7,.05,1)' : 'none' }}>
                    {WHEEL_SEGS.map((seg, i) => {
                      const N = WHEEL_SEGS.length, R = 120
                      const a1 = (i * 360/N - 90) * Math.PI / 180
                      const a2 = ((i+1) * 360/N - 90) * Math.PI / 180
                      const x1 = R * Math.cos(a1), y1 = R * Math.sin(a1)
                      const x2 = R * Math.cos(a2), y2 = R * Math.sin(a2)
                      const aM = ((i + 0.5) * 360/N - 90) * Math.PI / 180
                      const tx = R * 0.63 * Math.cos(aM), ty = R * 0.63 * Math.sin(aM)
                      const tRot = (i + 0.5) * 360/N
                      return (
                        <g key={i}>
                          <path d={`M 0 0 L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={seg.bg} stroke="white" strokeWidth="2.5" />
                          <g transform={`translate(${tx},${ty}) rotate(${tRot})`}>
                            {seg.label.map((line, li) => (
                              <text key={li} y={(li - (seg.label.length - 1) / 2) * 10} fill={seg.fg} fontSize="8" fontWeight="800" textAnchor="middle" dominantBaseline="middle" style={{ letterSpacing: '0.03em' }}>{line}</text>
                            ))}
                          </g>
                        </g>
                      )
                    })}
                    <circle r={26} fill="white" stroke="rgba(0,0,0,.08)" strokeWidth="2" />
                    <text textAnchor="middle" dominantBaseline="middle" fontSize="20" y={1}>🎁</text>
                  </g>
                  <polygon points="-12,-120 12,-120 0,-92" fill="#111" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <circle r={122} fill="none" stroke="#E0E0E0" strokeWidth="3" />
                </svg>
              </div>

              {!wheelSpun ? (
                <button onClick={spinWheel}
                  className="font-extrabold uppercase tracking-widest text-sm active:scale-95 transition-transform qr-slide-up"
                  style={{ '--reveal-delay': '.3s', fontFamily: 'var(--font-baloo)', background: '#111', color: 'white', border: 'none', borderRadius: 99, padding: '16px 36px', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,.18)' } as React.CSSProperties}>
                  Tourner la roue !
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 qr-fade-in">
                  <div style={{ width: 160, height: 3, borderRadius: 99, background: '#EBEBEB', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#111', borderRadius: 99, animation: 'loaderBar 5.5s linear both' }} />
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#BBB' }}>Ça tourne…</p>
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
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#AAA', marginBottom: 8 }}>Vous avez gagné</p>
                <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(30px,9vw,50px)', fontWeight: 900, color: '#111', textTransform: 'uppercase' as const }}>Félicitations !</h2>
              </div>
              <div className="w-full relative mt-10 qr-pop-in" style={{ maxWidth: 320, '--reveal-delay': '.15s' } as React.CSSProperties}>
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: -40, width: 80, height: 80, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: prize.color, boxShadow: `0 8px 32px ${prize.color}70`, animation: 'float 3s ease-in-out infinite' }}>
                  <PrizeSlotIcon id={prize.id} size={38} />
                </div>
                <div style={{ borderRadius: 28, paddingTop: 56, paddingBottom: 28, paddingLeft: 24, paddingRight: 24, textAlign: 'center', boxShadow: '0 4px 32px rgba(0,0,0,.08)', border: '1px solid #F0F0F0', background: 'white' }}>
                  <p style={{ fontFamily: 'var(--font-baloo)', fontWeight: 900, fontSize: 18, textTransform: 'uppercase' as const, color: '#111', marginBottom: 6 }}>{prize.label}</p>
                  <p style={{ color: '#999', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{prize.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 99, padding: '10px 16px', fontSize: 12, fontWeight: 700, background: '#F5F5F5', color: '#444' }}>
                    <PhoneIcon size={13} color="#111" />
                    Montrez cet écran à la caisse
                  </div>
                </div>
              </div>
              <div style={{ '--reveal-delay': '.35s', width: '100%', maxWidth: 320, borderRadius: 28, padding: 20, border: '1px solid #F0F0F0', background: 'white' } as React.CSSProperties} className="qr-slide-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{[...Array(5)].map((_,i) => <StarFilledIcon key={i} size={13} color="#F5A623" opacity={1} />)}</div>
                  <span style={{ fontFamily: 'var(--font-baloo)', fontWeight: 900, fontSize: 13, color: '#111' }}>Partagez votre avis</span>
                </div>
                <p style={{ color: '#BBB', fontSize: 11, lineHeight: 1.6, marginBottom: 16 }}>Un avis Google nous aide vraiment. Ça prend 30 secondes !</p>
                <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'white', fontFamily: 'var(--font-baloo)', fontWeight: 800, fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.08em', padding: '14px 0', borderRadius: 99, width: '100%', background: '#4285F4', textDecoration: 'none' }}
                >
                  <GoogleIcon />
                  Laisser un avis Google
                </a>
              </div>
            </div>
          )}

          {phase === 'thanks' && (
            <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-7 text-center">
              <div style={{ width: 72, height: 72, borderRadius: 24, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="qr-bounce-in">
                <HeartIcon size={36} color="white" />
              </div>
              <div className="qr-slide-up">
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#AAA', marginBottom: 8 }}>Merci</p>
                <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(26px,8vw,42px)', fontWeight: 900, color: '#111', lineHeight: 1.05, textTransform: 'uppercase' as const }}>
                  Votre retour<br/>nous touche
                </h2>
                <p style={{ marginTop: 12, color: '#999', fontSize: 13, lineHeight: 1.6 }}>
                  Nous allons tout mettre en œuvre pour vous satisfaire lors de votre prochaine visite.
                </p>
              </div>
              {!sent ? (
                <>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                    placeholder="Comment améliorer votre expérience ? (facultatif)" rows={3}
                    className="w-full max-w-sm qr-slide-up"
                    style={{ '--reveal-delay': '.2s', background: '#F5F5F5', border: '2px solid #E8E8E8', borderRadius: 20, padding: 16, fontSize: 14, resize: 'none', outline: 'none', color: '#111' } as React.CSSProperties}
                  />
                  <button onClick={() => { setSent(true); saveFeedback(stars, feedback, table ?? '', prize?.label ?? null) }}
                    className="w-full max-w-sm active:scale-[.98] transition-transform qr-slide-up"
                    style={{ '--reveal-delay': '.3s', fontFamily: 'var(--font-baloo)', background: '#111', color: 'white', border: 'none', borderRadius: 99, padding: '16px 24px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,.18)' } as React.CSSProperties}
                  >
                    Envoyer
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 99, padding: '12px 24px', background: '#F5F5F5', border: '1px solid #E8E8E8' }} className="qr-bounce-in">
                  <CheckIcon size={20} color="#111" />
                  <span style={{ fontWeight: 700, color: '#111', fontSize: 14 }}>Message envoyé — merci !</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL "Fini ?" ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }} onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md anim-sheet-up relative" style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '2.5rem 1.5rem calc(2rem + env(safe-area-inset-bottom,0px))', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 99, background: '#E0E0E0', position: 'absolute', top: 12 }} />
            {/* Icône */}
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,.18)', marginTop: 8 }}>
              <UtensilsIcon size={28} color="white" />
            </div>
            {/* Texte */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#AAA', marginBottom: 8 }}>Moment de vérité</p>
              <h3 style={{ fontFamily: 'var(--font-baloo)', fontSize: 'clamp(22px,6vw,28px)', fontWeight: 900, color: '#111', textTransform: 'uppercase', lineHeight: 1.1 }}>
                Avez-vous fini<br/>de manger ?
              </h3>
              <p style={{ marginTop: 10, color: '#999', fontSize: 13, lineHeight: 1.5 }}>Donnez votre avis et tentez de gagner un cadeau !</p>
            </div>
            {/* Boutons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={onFinished}
                style={{ width: '100%', fontFamily: 'var(--font-baloo)', background: '#111', color: 'white', border: 'none', borderRadius: 99, padding: '16px 24px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,.2)' }}
              >
                Oui, j&apos;ai fini
              </button>
              <button onClick={() => setShowModal(false)}
                style={{ width: '100%', fontFamily: 'var(--font-baloo)', background: 'white', color: '#888', border: '1.5px solid #E8E8E8', borderRadius: 99, padding: '14px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
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
            <div className="relative" style={{ height: 230, background: 'white' }}>
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
      <div className="min-h-screen flex flex-col antialiased relative qr-shell" style={{ background: 'white', colorScheme: 'light' }}>

        {/* SEARCH OVERLAY — plein écran quand actif */}
        {showSearch && (
          <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'white' }}>
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => { setShowSearch(false); setSearchQ('') }} style={{ width: 38, height: 38, border: 'none', background: '#F4F4F4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#F4F4F4', borderRadius: 14, padding: '10px 14px' }}>
                <SearchIcon size={15} color="#999" />
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Kebab, tacos, burger…"
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: '#111', outline: 'none' }}
                />
                {searchQ && <button onClick={() => setSearchQ('')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}><CloseIcon size={14} color="#999" /></button>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto qr-noscroll" style={{ padding: '16px 16px 100px' }}>
              {searchQ.length > 1 ? (
                <>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 14 }}>
                    {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {searchResults.length > 0 ? searchResults.map((item) => {
                      const cat = CATEGORIES.find(c => c.cats.includes(item.category))
                      return (
                        <div key={item.title} onClick={() => { playTap(); setSelItem(item) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F5F5F5', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                          <div style={{ width: 64, height: 64, background: '#F7F7F7', borderRadius: 14, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={getImg(item.title, cat?.img ?? '')} alt={item.title} style={{ width: 56, height: 56, objectFit: 'contain' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 13, fontWeight: 800, color: '#111', textTransform: 'uppercase' as const }}>{item.title}</div>
                            <div style={{ fontSize: 11, color: '#999', marginTop: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' as const }}>{item.description}</div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 14, fontWeight: 900, color: '#1E4D3A', flexShrink: 0 }}>{item.price}&thinsp;€</div>
                        </div>
                      )
                    }) : (
                      <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <SearchIcon size={36} color="#E0E0E0" />
                        <p style={{ fontSize: 14, color: '#999', marginTop: 12 }}>Aucun résultat pour «&nbsp;{searchQ}&nbsp;»</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#CCC' }}>
                  <SearchIcon size={36} color="#E0E0E0" />
                  <p style={{ fontSize: 13, marginTop: 12 }}>Tapez pour chercher…</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div ref={contentRef} className="flex-1 overflow-y-auto qr-noscroll qr-shell" style={{ background: 'white', color: '#111' }}>


          {/* ── VUE HOME ── */}
          {view === 'categories' && !showSearch && (
            <div style={{ paddingBottom: 100 }}>

              {/* ── BANNERS CAROUSEL + HEADER INTÉGRÉ ── */}
              <div style={{ position: 'relative' }}>

                {/* Outer — overflow hidden + swipe touch */}
                <div
                  style={{ overflow: 'hidden' }}
                  onTouchStart={e => { touchStartXRef.current = e.touches[0].clientX }}
                  onTouchEnd={e => {
                    const dx = e.changedTouches[0].clientX - touchStartXRef.current
                    if (dx < -40) setBannerIdx(i => Math.min(i + 1, BANNERS_COUNT - 1))
                    if (dx > 40)  setBannerIdx(i => Math.max(i - 1, 0))
                  }}
                >
                  {/* Sliding track — transform-based, fluide */}
                  <div style={{
                    display: 'flex',
                    transform: `translateX(-${bannerIdx * 100}%)`,
                    transition: 'transform 0.52s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    willChange: 'transform',
                  }}>
                    {([
                      { bg: '#D4501E', badgeBg: '#FDEEA3', badgeColor: '#5C2800', badge: '★ Spécialité', title: 'Kebab Artisanal', sub: 'Broche tournée, sauces maison, viande fraîche tranchée à la minute.', btnBg: '#FDEEA3', btnColor: '#5C2800', catId: 'kebab', img: `/uploads/lucid-origin_A_award-winning_professional_studio_food_photography_of_a_gourmet_luxury_kebab._-0.png`, scale: 1 },
                      { bg: '#1E4D3A', badgeBg: '#E8A93B', badgeColor: '#1E4D3A', badge: 'Nouveau', title: 'Maxi Tacos', sub: 'Généreux, fondant, garni à votre goût avec nos sauces exclusives.', btnBg: '#E8A93B', btnColor: '#1E4D3A', catId: 'tacos', img: `/uploads/cut/Maxi%20Tacos.png`, scale: 1.5 },
                      { bg: '#C2385A', badgeBg: '#FDEEA3', badgeColor: '#5C0020', badge: 'Finger Food', title: 'Burgers & Chicken', sub: 'Croustillant, juteux, cuit à la demande — nuggets, tenders et burgers.', btnBg: '#FDEEA3', btnColor: '#5C0020', catId: 'burgers', img: `/uploads/cut/Chicken%20Burger.png`, scale: 1.5 },
                      { bg: '#2C5F8A', badgeBg: '#E8A93B', badgeColor: '#0D2340', badge: 'Gourmet', title: 'Assiettes Complètes', sub: 'Plat complet grillé à la commande, avec accompagnements et salades.', btnBg: '#E8A93B', btnColor: '#0D2340', catId: 'assiettes', img: `/uploads/cut/Assiette%20Kebab.png`, scale: 1.5 },
                    ] as const).map((b, idx) => (
                      <div key={idx} style={{
                        flexShrink: 0, width: '100%',
                        background: b.bg, position: 'relative', overflow: 'hidden',
                        display: 'flex', alignItems: 'center',
                        minHeight: 260, paddingTop: 52,
                      }}>
                        {/* Doodle pattern */}
                        <div style={{
                          position: 'absolute', inset: 0,
                          backgroundImage: `url(${BASE}/uploads/depositphotos_107470690-stock-illustration-various-food-doodle-seamless-background.webp)`,
                          backgroundSize: '280px', backgroundRepeat: 'repeat',
                          opacity: 0.15, mixBlendMode: 'overlay' as const,
                        }} />
                        {/* Gradient lisibilité */}
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${b.bg}EE 0%, ${b.bg}99 50%, transparent 100%)` }} />

                        {/* Texte — entre avec animation quand ce slide devient actif */}
                        <div
                          key={idx === bannerIdx ? `active-${bannerIdx}` : `idle-txt-${idx}`}
                          style={{
                            position: 'relative', zIndex: 2, flex: '0 0 56%',
                            padding: '20px 0 28px 22px',
                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                            animation: idx === bannerIdx ? 'bannerTxtIn .48s cubic-bezier(.25,.46,.45,.94) .04s both' : 'none',
                          }}
                        >
                          <span style={{ background: b.badgeBg, color: b.badgeColor, fontSize: 8, fontWeight: 800, fontFamily: 'var(--font-baloo)', padding: '3px 11px', borderRadius: 99, textTransform: 'uppercase' as const, letterSpacing: '0.1em', backdropFilter: 'blur(4px)' }}>
                            {b.badge}
                          </span>
                          <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 21, fontWeight: 900, color: 'white', lineHeight: 1.1, margin: 0 }}>
                            {b.title}
                          </h2>
                          <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.55, margin: 0, fontWeight: 500 }}>
                            {b.sub}
                          </p>
                          <button
                            onClick={() => { playTap(); setSelCatId(b.catId); setView('items') }}
                            style={{ background: b.btnBg, color: b.btnColor, fontFamily: 'var(--font-baloo)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.07em', border: 'none', borderRadius: 99, padding: '10px 20px', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', marginTop: 4, boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}
                          >
                            Voir le menu →
                          </button>
                        </div>

                        {/* Image — entre depuis la droite quand ce slide devient actif */}
                        <div
                          key={idx === bannerIdx ? `active-img-${bannerIdx}` : `idle-img-${idx}`}
                          style={{
                            position: 'absolute', zIndex: 2, right: 0, top: 0, bottom: 0, width: '52%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '8px 6px 8px 0',
                            animation: idx === bannerIdx ? 'bannerImgIn .56s cubic-bezier(.25,.46,.45,.94) .08s both' : 'none',
                          }}
                        >
                          <img src={BASE + b.img} alt={b.title}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center center', transform: `scale(${b.scale})`, transformOrigin: 'center center' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Header transparent superposé sur le carousel */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'linear-gradient(to bottom, rgba(0,0,0,.32) 0%, transparent 100%)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-baloo)', fontSize: '1rem', fontWeight: 900, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' as const, lineHeight: 1 }}>Chez Ramo</div>
                    {table && <div style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Table {table}</div>}
                  </div>
                  <button onClick={() => { setShowSearch(true); setSearchQ('') }}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.22)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', backdropFilter: 'blur(8px)' }}>
                    <SearchIcon size={15} color="white" />
                  </button>
                </div>

                {/* Dots */}
                <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5, zIndex: 5 }}>
                  {Array.from({ length: BANNERS_COUNT }).map((_, i) => (
                    <button key={i}
                      onClick={() => setBannerIdx(i)}
                      style={{ width: bannerIdx === i ? 18 : 5, height: 5, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent', background: bannerIdx === i ? 'white' : 'rgba(255,255,255,.4)', transition: 'width .3s ease' }}
                    />
                  ))}
                </div>
              </div>

              {/* ── CATÉGORIES SCROLL HORIZONTAL ── */}
              <div style={{ padding: '20px 0 0' }}>
                <h4 style={{ fontFamily: 'var(--font-baloo)', fontSize: 16, fontWeight: 900, color: '#111', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 14, paddingLeft: 14 }}>
                  Nos catégories
                </h4>
                <div className="qr-noscroll qr-hscroll" style={{ display: 'flex', gap: 11, paddingLeft: 14, paddingRight: 14, paddingBottom: 6 }}>
                  {CATEGORIES.map((cat, i) => {
                    const c = CAT_COLORS[cat.id] ?? { bg: '#E6F4EE', text: '#1E4D3A', accent: '#1E4D3A' }
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { playTap(); setSelCatId(cat.id); setView('items') }}
                        className="qr-card-in"
                        style={{
                          '--card-delay': `${i * 50}ms`,
                          flexShrink: 0,
                          background: '#F3F3F3',
                          borderRadius: 22,
                          padding: 0,
                          border: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                          width: 120, overflow: 'hidden',
                        } as React.CSSProperties}
                      >
                        {/* Zone image — centrée, grande */}
                        <div style={{ width: '100%', height: 118, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 8px 0' }}>
                          <img
                            src={BASE + cat.img} alt={cat.label} loading="lazy"
                            style={{ width: 104, height: 104, objectFit: 'contain', objectPosition: 'center', display: 'block' }}
                          />
                        </div>
                        {/* Label */}
                        <div style={{ width: '100%', padding: '6px 8px 13px', textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#111', fontFamily: 'var(--font-baloo)', textTransform: 'uppercase' as const, letterSpacing: '0.03em', whiteSpace: 'nowrap' as const, display: 'block' }}>
                            {cat.label.split(' & ')[0].split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── LES PLUS COMMANDÉS 2-COL ── */}
              <div style={{ padding: '40px 0 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 14px' }}>
                  <h4 style={{ fontFamily: 'var(--font-baloo)', fontSize: 16, fontWeight: 900, color: '#0A0A0A', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                    Les plus commandés
                  </h4>
                  <button onClick={() => { playTap(); setSelCatId('kebab'); setView('items') }}
                    style={{ fontSize: 14, fontWeight: 700, color: '#1E4D3A', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-baloo)', padding: 0 }}>
                    Voir tout ›
                  </button>
                </div>
                <div className="qr-noscroll qr-hscroll" style={{ display: 'flex', gap: 14, paddingLeft: 14, paddingRight: 14, paddingBottom: 8 }}>
                  {BEST_SELLERS.map((bs, i) => {
                    const item = MENU_DATA.find(m => m.title === bs.title)
                    return (
                      <div
                        key={bs.title}
                        role="button"
                        onClick={() => { if (item) { playTap(); setSelItem(item) } }}
                        className="qr-card-in"
                        style={{
                          '--card-delay': `${i * 60}ms`,
                          flexShrink: 0, width: 'calc(50vw - 21px)',
                          minWidth: 160, maxWidth: 200,
                          background: 'white', borderRadius: 22,
                          border: '1.5px solid #EFEFEF',
                          boxShadow: '0 3px 16px rgba(0,0,0,.07)',
                          overflow: 'hidden', cursor: 'pointer',
                          WebkitTapHighlightColor: 'transparent',
                          display: 'flex', flexDirection: 'column',
                        } as React.CSSProperties}
                      >
                        {/* Image — ratio 3:2 exact comme les fichiers PNG (420×280) */}
                        <div style={{ background: 'white', position: 'relative', width: '100%', paddingTop: '66.67%' }}>
                          <img
                            src={BASE + bs.img} alt={bs.title}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', padding: '10px 8px 4px' }}
                          />
                        </div>
                        <div style={{ height: 1, background: '#F5F5F5', margin: '0 14px' }} />
                        {/* Infos centrées */}
                        <div style={{ padding: '13px 14px 16px', textAlign: 'center' }}>
                          <p style={{ fontFamily: 'var(--font-baloo)', fontSize: 13, fontWeight: 800, color: '#0A0A0A', textTransform: 'uppercase' as const, lineHeight: 1.2, marginBottom: 7 }}>
                            {bs.title}
                          </p>
                          <p style={{ fontFamily: 'var(--font-baloo)', fontSize: 20, fontWeight: 900, color: '#1E4D3A' }}>
                            {bs.price}&thinsp;€
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── NOS ACCOMPAGNEMENTS ── */}
              <div style={{ padding: '40px 0 0' }}>
                <div style={{ marginBottom: 16, padding: '0 14px' }}>
                  <h4 style={{ fontFamily: 'var(--font-baloo)', fontSize: 16, fontWeight: 900, color: '#0A0A0A', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                    Nos accompagnements
                  </h4>
                </div>
                <div className="qr-noscroll qr-hscroll" style={{ display: 'flex', gap: 12, paddingLeft: 14, paddingRight: 14, paddingBottom: 8 }}>
                  {[
                    { label: 'Frites',        menuTitle: 'Frites',       price: '3,00', img: '/uploads/cut/Frites.png',              catId: 'extras'  },
                    { label: 'Boisson 33cl',  menuTitle: 'Boissons 33cl',price: '2,00', img: '/uploads/cut/Boissons%2033cl.png',     catId: 'drinks'  },
                    { label: 'Nuggets (x7)',  menuTitle: 'Nuggets (x7)', price: '5,50', img: '/uploads/cut/Nuggets%20(x7).png',      catId: 'burgers' },
                    { label: 'Tiramisu',      menuTitle: 'Tiramisu',     price: '3,50', img: '/uploads/cut/Tiramisu.png',            catId: 'drinks'  },
                    { label: 'Wings (x4)',    menuTitle: 'Wings (x4)',   price: '5,00', img: '/uploads/cut/Wings%20(x8).png',        catId: 'burgers' },
                  ].map((acc) => {
                    const menuItem = MENU_DATA.find(m => m.title === acc.menuTitle)
                    return (
                    <button
                      key={acc.label}
                      onClick={() => { if (menuItem) setSelItem(menuItem); else { setSelCatId(acc.catId); setView('items') } }}
                      style={{
                        flexShrink: 0, width: 110,
                        background: '#F8F8F8', borderRadius: 20,
                        border: '1.5px solid #EFEFEF',
                        padding: 0, cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ width: '100%', paddingTop: '66.67%', position: 'relative', background: 'white' }}>
                        <img src={BASE + acc.img} alt={acc.label}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '8px 6px 4px' }} />
                      </div>
                      <div style={{ padding: '8px 8px 12px', textAlign: 'center', width: '100%' }}>
                        <p style={{ fontFamily: 'var(--font-baloo)', fontSize: 10, fontWeight: 900, color: '#111', textTransform: 'uppercase' as const, lineHeight: 1.2, marginBottom: 3 }}>{acc.label}</p>
                        <p style={{ fontFamily: 'var(--font-baloo)', fontSize: 14, fontWeight: 900, color: '#1E4D3A' }}>{acc.price}&thinsp;€</p>
                      </div>
                    </button>
                  )})}
                </div>
              </div>

            </div>
          )}

          {/* ── VUE ITEMS — list view style McDonald's ── */}
          {view === 'items' && !showSearch && (
            <div style={{ paddingBottom: 100 }}>

              {/* Bouton retour + chips catégories */}
              <div style={{
                position: 'sticky', top: 0,
                background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(16px)',
                zIndex: 10, paddingTop: 12, paddingBottom: 10,
                borderBottom: '1px solid #F0EDE8',
              }}>
                {/* Ligne 1: back + nom catégorie */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 16, marginBottom: 10 }}>
                  <button
                    onClick={() => { playTap(500); setView('categories') }}
                    style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: '#F0EDE8', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E4D3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <span style={{ fontFamily: 'var(--font-baloo)', fontSize: 15, fontWeight: 800, color: '#111', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                    {selCat.label}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: '#F0EDE8', color: '#888', fontFamily: 'var(--font-baloo)' }}>
                    {selItems.length} plats
                  </span>
                </div>
                {/* Ligne 2: chips catégories pour switcher */}
                <div className="qr-noscroll qr-hscroll" style={{ display: 'flex', gap: 8, paddingLeft: 16, paddingRight: 16 }}>
                  {CATEGORIES.map(cat => {
                    const active = selCatId === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelCatId(cat.id)}
                        style={{
                          flexShrink: 0, padding: '7px 14px', borderRadius: 99,
                          border: active ? '2px solid #1E4D3A' : '2px solid #EEECE8',
                          background: active ? '#1E4D3A' : 'white',
                          color: active ? 'white' : '#555',
                          fontSize: 10, fontWeight: 800,
                          fontFamily: 'var(--font-baloo)',
                          textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                          whiteSpace: 'nowrap' as const, cursor: 'pointer',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        {cat.label.split(' & ')[0].split(' ')[0]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Liste items — rows style McDonald's */}
              <div key={selCatId} className="qr-section-in" style={{ padding: '8px 0' }}>
                {selItems.map((item, i) => (
                  <div
                    key={item.title}
                    role="button"
                    onClick={() => { playTap(); setSelItem(item) }}
                    className="qr-item-in"
                    style={{
                      '--item-delay': `${i * 25}ms`,
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      borderBottom: '1px solid #F7F4F0',
                      cursor: 'pointer', background: 'white',
                      WebkitTapHighlightColor: 'transparent',
                    } as React.CSSProperties}
                  >
                    {/* Image */}
                    <div style={{
                      width: 76, height: 76, flexShrink: 0,
                      background: IMG_BG[i % IMG_BG.length],
                      borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      <SmartFoodImg
                        src={getImg(item.title, selCat.img)} alt={item.title}
                        size={76} bg="white" radius={0}
                      />
                    </div>
                    {/* Infos */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 13, fontWeight: 800, color: '#111', textTransform: 'uppercase' as const, lineHeight: 1.2, marginBottom: 3 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#AAA', lineHeight: 1.35, marginBottom: item.menu_price ? 4 : 0,
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                      }}>
                        {item.description}
                      </div>
                      {item.menu_price && item.menu_price !== '' && (
                        <span style={{
                          display: 'inline-block',
                          background: '#FFF3D6', color: '#B8860B',
                          fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-baloo)',
                          padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' as const,
                        }}>
                          Menu {item.menu_price}&thinsp;€
                        </span>
                      )}
                    </div>
                    {/* Prix */}
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 15, fontWeight: 900, color: '#1E4D3A' }}>
                        {item.price}&thinsp;€
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* ── BOTTOM NAV ───────────────────────────────────────────────────── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          padding: '0 16px calc(12px + env(safe-area-inset-bottom, 0px))',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 28,
            boxShadow: '0 4px 24px rgba(0,0,0,.10)',
            border: '1px solid #EFEFEF',
            display: 'flex', alignItems: 'center',
            height: 68,
            pointerEvents: 'auto',
          }}>
            {/* Accueil */}
            <button
              onClick={() => { setShowSearch(false); setSearchQ(''); setView('categories'); contentRef.current?.scrollTo({ top: 0 }) }}
              style={{ flex: 1, height: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', borderRadius: '28px 0 0 28px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <HomeIcon size={22} color={view === 'categories' && !showSearch ? '#111' : '#D0D0D0'} />
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-baloo)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: view === 'categories' && !showSearch ? '#111' : '#D0D0D0' }}>Accueil</span>
              </div>
            </button>

            {/* Centre — FAB cadeau */}
            <button
              onClick={() => setShowModal(true)}
              style={{ flex: 1, height: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: '#111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,.22)',
                  marginTop: -26,
                }}>
                  <GiftIcon size={22} color="white" />
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-baloo)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#999', whiteSpace: 'nowrap' as const }}>Cadeau</span>
              </div>
            </button>

            {/* Recherche */}
            <button
              onClick={() => { setShowSearch(true); setSearchQ('') }}
              style={{ flex: 1, height: '100%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', borderRadius: '0 28px 28px 0' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <SearchIcon size={22} color={showSearch ? '#111' : '#D0D0D0'} />
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-baloo)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: showSearch ? '#111' : '#D0D0D0' }}>Chercher</span>
              </div>
            </button>
          </div>
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
  /* Force light mode — empêche Safari/Brave de forcer le dark mode */
  :root { color-scheme: light only; }
  * { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

  /* Taille de texte minimum pour l'accessibilité */
  body { min-height: 100dvh; }

  .qr-noscroll::-webkit-scrollbar { display: none; }
  .qr-noscroll { -ms-overflow-style: none; scrollbar-width: none; }
  /* Empêche Safari de coloriser le fond en dark */
  @media (prefers-color-scheme: dark) {
    .qr-shell { background: white !important; color: #111 !important; }
  }

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
  @keyframes heroFloat    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
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
  @keyframes bannerTxtIn   { from { opacity:0; transform:translateX(-22px); } to { opacity:1; transform:translateX(0); } }
  @keyframes bannerImgIn   { from { opacity:0; transform:translateX(22px) scale(.94); } to { opacity:1; transform:translateX(0) scale(1); } }

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
