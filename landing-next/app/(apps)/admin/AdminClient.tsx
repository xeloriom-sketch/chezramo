'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Script from 'next/script'

const FUNCTIONS_BASE = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? ''
const ADMIN_TOKEN_KEY = 'ramo_admin_token'

function adminToken() { return typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) ?? '' : '' }
function adminFetchHeaders(withBody = false): Record<string, string> {
  const h: Record<string, string> = {}
  if (withBody) h['Content-Type'] = 'application/json'
  if (FUNCTIONS_BASE) h['Authorization'] = `Bearer ${adminToken()}`
  return h
}

/* ─── types ─────────────────────────────────────────────────── */
type OrderItem = { name: string; qty: number; price: number }
type Order = {
  id: number
  order_id: number
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'done' | 'cancelled' | 'collected'
  created_at: string
}
type Reservation = {
  id: number
  fullname: string
  email: string
  phone: string | null
  date: string
  time: string
  guests: number
  message: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}
type Tab = 'dashboard' | 'commandes' | 'reservations' | 'feedbacks' | 'newsletter' | 'menu' | 'tvs' | 'settings'
type Feedback = {
  id: number
  stars: number
  message: string | null
  table_num: string | null
  prize: string | null
  created_at: string
}
type NewsletterSub = {
  id: number
  email: string
  created_at: string
}

const HERO_IMG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80'
const MAX_ATTEMPTS = 4
const LOCK_SECONDS = 30

function money(n: number) { return n.toFixed(2).replace('.', ',') + ' €' }
function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

/* ─── notification sound ─────────────────────────────────────── */
// On utilise un élément <audio> HTML plutôt que Web Audio API.
// L'<audio> fonctionne dans les onglets en arrière-plan sans restriction
// d'autoplay une fois débloqué par un geste utilisateur (le login).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

let _audio: HTMLAudioElement | null = null
export function warmupAudio() {
  // Appelé au login (geste utilisateur) pour débloquer l'audio du navigateur
  if (typeof window === 'undefined') return
  if (!_audio) {
    _audio = new Audio(`${BASE}/ding.wav`)
    _audio.volume = 1
  }
  // Lecture silencieuse à volume 0 pour débloquer l'autoplay policy
  const tmp = _audio.cloneNode() as HTMLAudioElement
  tmp.volume = 0
  tmp.play().catch(() => {})
}
function playNotificationSound() {
  try {
    if (!_audio) _audio = new Audio(`${BASE}/ding.wav`)
    _audio.currentTime = 0
    _audio.volume = 1
    _audio.play().catch(() => {})
  } catch { /* silent */ }
}

/* ─── login icons ────────────────────────────────────────────── */
function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

const REMEMBER_KEY = 'ramo_admin_remember'

/* ─── login screen ───────────────────────────────────────────── */
function LoginScreen({ onLogin }: { onLogin: (user: string, pw: string) => Promise<boolean> }) {
  const [user, setUser] = useState('')
  const [pw, setPw] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState(false)
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockUntil, setLockUntil] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [focusedField, setFocusedField] = useState<'user' | 'pw' | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) || 'null')
      if (saved?.user) { setUser(saved.user); setPw(saved.pw ?? ''); setRemember(true) }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (!lockUntil) return
    const iv = setInterval(() => {
      const rem = Math.ceil((lockUntil - Date.now()) / 1000)
      if (rem <= 0) { setLockUntil(null); setRemaining(0); setAttempts(0) }
      else setRemaining(rem)
    }, 500)
    return () => clearInterval(iv)
  }, [lockUntil])

  const isLocked = lockUntil !== null

  const submit = async () => {
    if (isLocked || loading) return
    setLoading(true)
    const ok = await onLogin(user, pw)
    setLoading(false)
    if (ok) {
      if (remember) localStorage.setItem(REMEMBER_KEY, JSON.stringify({ user, pw }))
      else localStorage.removeItem(REMEMBER_KEY)
    } else {
      const next = attempts + 1
      setAttempts(next)
      setErr(true)
      setPw('')
      setTimeout(() => setErr(false), 800)
      if (next >= MAX_ATTEMPTS) {
        setLockUntil(Date.now() + LOCK_SECONDS * 1000)
        setRemaining(LOCK_SECONDS)
      }
    }
  }

  const inputBox = (focused: boolean, hasError: boolean) => ({
    display: 'flex', alignItems: 'center', position: 'relative' as const,
    borderRadius: 14,
    border: `2px solid ${hasError ? '#EF4444' : focused ? '#1E4D3A' : '#E2E8F0'}`,
    background: focused ? 'rgba(30,77,58,.03)' : '#FAFAFA',
    transition: 'border-color .18s, background .18s',
    animation: hasError ? 'shake .45s' : 'none',
  })

  return (
    <div style={{ height: '100dvh', display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif", background: 'white', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* Left: form */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 52px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(30,77,58,.07)', border: '1px solid rgba(30,77,58,.15)', borderRadius: 99, padding: '5px 12px', marginBottom: 36, color: '#1E4D3A', fontSize: 12, fontWeight: 600 }}>
            <ShieldIcon /><span>Accès sécurisé</span>
          </div>
          <h1 style={{ fontSize: 46, fontWeight: 800, color: '#1E4D3A', letterSpacing: '.02em', lineHeight: 1.05, margin: '0 0 6px', fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
            Chez <span style={{ color: '#E8A93B' }}>Ramo</span>
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 36, lineHeight: 1.6 }}>
            Panneau d&apos;administration du restaurant
          </p>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '.04em', textTransform: 'uppercase' }}>Adresse mail</label>
            <div style={inputBox(focusedField === 'user', false)}>
              <input type="email" value={user} onChange={e => setUser(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                onFocus={() => setFocusedField('user')} onBlur={() => setFocusedField(null)}
                placeholder="Votre adresse mail" autoFocus autoComplete="email" disabled={isLocked}
                style={{ flex: 1, padding: '14px 18px', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: '#1E293B', cursor: isLocked ? 'not-allowed' : 'text' }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, letterSpacing: '.04em', textTransform: 'uppercase' }}>Mot de passe</label>
            <div style={inputBox(focusedField === 'pw', err)}>
              <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                onFocus={() => setFocusedField('pw')} onBlur={() => setFocusedField(null)}
                placeholder="Votre mot de passe" autoComplete="current-password" disabled={isLocked}
                style={{ flex: 1, padding: '14px 48px 14px 18px', fontSize: 15, background: 'transparent', border: 'none', outline: 'none', color: '#1E293B', cursor: isLocked ? 'not-allowed' : 'text' }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, display: 'flex', alignItems: 'center' }}>
                <EyeIcon off={showPw} />
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#1E4D3A', cursor: 'pointer' }} />
            <span style={{ fontSize: 13, color: '#64748B' }}>Se souvenir de moi</span>
          </label>

          {/* Error / lockout */}
          {isLocked ? (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Compte bloqué — réessayez dans <strong style={{ marginLeft: 4 }}>{remaining}s</strong>
            </div>
          ) : err ? (
            <p style={{ marginBottom: 14, fontSize: 13, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Adresse mail ou mot de passe incorrect{attempts > 1 ? ` · ${MAX_ATTEMPTS - attempts} essai${MAX_ATTEMPTS - attempts > 1 ? 's' : ''} restant` : ''}
            </p>
          ) : <div style={{ marginBottom: 14 }} />}

          <button onClick={submit} disabled={isLocked || !user || !pw || loading}
            style={{
              width: '100%', padding: '15px', borderRadius: 14, border: 'none',
              cursor: isLocked || !user || !pw || loading ? 'not-allowed' : 'pointer',
              background: isLocked || !user || !pw || loading ? '#E2E8F0' : '#1E4D3A',
              color: isLocked || !user || !pw || loading ? '#94A3B8' : 'white',
              fontSize: 15, fontWeight: 700, letterSpacing: '.03em',
              boxShadow: isLocked || !user || !pw || loading ? 'none' : '0 8px 28px rgba(30,77,58,.28)',
              transition: 'all .2s',
            }}>
            {isLocked ? `Réessayez dans ${remaining}s` : loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0 0' }}>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
            <span style={{ padding: '0 12px', fontSize: 11, color: '#CBD5E1', letterSpacing: '.08em', textTransform: 'uppercase' }}>Chez Ramo · Lagnieu</span>
            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
          </div>
        </div>
      </section>

      {/* Right: restaurant photo */}
      <section style={{ flex: 1.1, padding: 16 }} className="login-hero-panel">
        <div style={{
          height: '100%', borderRadius: 24, overflow: 'hidden', position: 'relative',
          backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', bottom: 32, left: 32, color: 'white' }}>
            <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 6 }}>Restaurant · Lagnieu</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.01em', lineHeight: 1.2 }}>Chez Ramo</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>Kebab · Tacos · Burgers · Spécialités</div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}60%{transform:translateX(10px)}}
        .login-hero-panel { display: none; }
        @media (min-width: 768px) { .login-hero-panel { display: block !important; } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}

/* ─── icons ──────────────────────────────────────────────────── */
function IconTrash() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
}
function IconBell() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function IconBellOff() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
}
function IconRefresh() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
}
function IconDash() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function IconOrders() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
}
function IconMenu() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
}
function IconTV() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
}
function IconSettings() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function IconLogout() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function IconCalendar() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function IconHamburger() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function IconX() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IconMail() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}

/* ─── sidebar ────────────────────────────────────────────────── */
type NavItem = { id: Tab; label: string; icon: React.ReactNode; badge?: number }
function Sidebar({ tab, setTab, logout, pendingCount, pendingResCount, mobileOpen, setMobileOpen }: {
  tab: Tab; setTab: (t: Tab) => void; logout: () => void
  pendingCount: number; pendingResCount: number; mobileOpen: boolean; setMobileOpen: (v: boolean) => void
}) {
  const items: NavItem[] = [
    { id: 'dashboard',     label: 'Dashboard',    icon: <IconDash />     },
    { id: 'commandes',     label: 'Commandes',    icon: <IconOrders />,  badge: pendingCount || undefined },
    { id: 'reservations',  label: 'Réservations', icon: <IconCalendar />, badge: pendingResCount || undefined },
    { id: 'feedbacks',     label: 'Avis clients', icon: <IconStar />     },
    { id: 'newsletter',    label: 'Newsletter',   icon: <IconMail />     },
    { id: 'menu',          label: 'Menu',         icon: <IconMenu />     },
    { id: 'tvs',           label: 'TVs',          icon: <IconTV />       },
    { id: 'settings',      label: 'Réglages',     icon: <IconSettings /> },
  ]
  return (
    <>
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 49, backdropFilter: 'blur(2px)' }} />
      )}
      <aside className={`admin-sidebar${mobileOpen ? ' open' : ''}`} style={{
        width: 256, background: 'white', display: 'flex', flexDirection: 'column',
        flexShrink: 0, position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50,
        borderRight: '1px solid #F1F5F9', justifyContent: 'space-between',
        boxShadow: '4px 0 24px rgba(0,0,0,.06)',
      }}>
        <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <span style={{ fontWeight: 800, fontSize: 22, color: '#1E4D3A', fontFamily: "'Baloo 2', system-ui", letterSpacing: '.01em' }}>
              Chez <span style={{ color: '#E8A93B' }}>Ramo</span>
            </span>
            <button onClick={() => setMobileOpen(false)} className="sidebar-close-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4, display: 'none', alignItems: 'center' }}>
              <IconX />
            </button>
          </div>

              {/* Nav */}
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, marginTop: 0 }}>MENU PRINCIPAL</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map(item => (
              <button key={item.id}
                onClick={() => { setTab(item.id); setMobileOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px',
                  borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: tab === item.id ? 'rgba(30,77,58,.08)' : 'transparent',
                  color: tab === item.id ? '#1E4D3A' : '#6B7280',
                  fontSize: 14, fontWeight: tab === item.id ? 700 : 500,
                  transition: 'all .15s',
                }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{ background: '#EF4444', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '1px 7px', minWidth: 18, textAlign: 'center' }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F3F4F6', flexShrink: 0 }}>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 13, fontWeight: 500, borderRadius: 10, transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2', e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#6B7280')}>
            <IconLogout />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}

/* ─── mobile bottom nav ──────────────────────────────────────── */
function MobileBottomNav({ tab, setTab, pendingCount, pendingResCount }: { tab: Tab; setTab: (t: Tab) => void; pendingCount: number; pendingResCount: number }) {
  const items: NavItem[] = [
    { id: 'dashboard',    label: 'Accueil', icon: <IconDash />                                          },
    { id: 'commandes',    label: 'Cmdes',   icon: <IconOrders />,   badge: pendingCount || undefined     },
    { id: 'reservations', label: 'Résas',   icon: <IconCalendar />, badge: pendingResCount || undefined  },
    { id: 'menu',         label: 'Menu',    icon: <IconMenu />      },
    { id: 'settings',     label: 'Config',  icon: <IconSettings />  },
  ]
  return (
    <nav className="mobile-bottom-nav">
      {items.map(item => (
        <button key={item.id} onClick={() => setTab(item.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer', padding: '6px 2px',
            color: tab === item.id ? '#1E4D3A' : '#9CA3AF', gap: 3, position: 'relative',
            transition: 'color .15s',
          }}>
          {tab === item.id && (
            <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: '#1E4D3A', borderRadius: '0 0 4px 4px' }} />
          )}
          <span style={{ position: 'relative' }}>
            {item.icon}
            {(item.badge ?? 0) > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -7, background: '#EF4444', color: 'white', borderRadius: 99, fontSize: 8, fontWeight: 800, padding: '1px 4px', lineHeight: 1.2, minWidth: 14, textAlign: 'center' }}>
                {(item.badge ?? 0) > 9 ? '9+' : item.badge}
              </span>
            )}
          </span>
          <span style={{ fontSize: 10, fontWeight: tab === item.id ? 700 : 500 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

/* ─── stat card icons ────────────────────────────────────────── */
function CardIconOrders() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
}
function CardIconPending() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CardIconRevenue() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}

/* ─── stat card ──────────────────────────────────────────────── */
function StatCard({ icon, iconBg, iconColor, label, value, badge, badgeGreen, footer, onAction, actionLabel }: {
  icon: React.ReactNode; iconBg: string; iconColor: string
  label: string; value: string | number
  badge?: string; badgeGreen?: boolean; footer?: React.ReactNode
  onAction?: () => void; actionLabel?: string
}) {
  return (
    <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,.05)', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', lineHeight: 1.3 }}>{label}</span>
        </div>
        {actionLabel && onAction && (
          <button onClick={onAction} style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', border: '1px solid #E5E7EB', padding: '3px 8px', borderRadius: 7, background: 'none', cursor: 'pointer', flexShrink: 0 }}>{actionLabel}</button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: '#111827', fontFamily: "'Baloo 2', system-ui" }}>{value}</span>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 700, color: badgeGreen ? '#059669' : '#EF4444', background: badgeGreen ? '#D1FAE5' : '#FEE2E2', padding: '2px 6px', borderRadius: 5 }}>{badge}</span>
        )}
      </div>
      {footer && (
        <div style={{ borderTop: '1px solid #F9FAFB', paddingTop: 8, marginTop: 2, fontSize: 10, color: '#9CA3AF' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

/* ─── status badge ───────────────────────────────────────────── */
const STATUS_CFG = {
  pending:   { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B', label: 'En attente'    },
  preparing: { bg: '#FEE4CE', color: '#EA580C', dot: '#F97316', label: 'En préparation' },
  done:      { bg: '#D1FAE5', color: '#059669', dot: '#10B981', label: 'Prête'         },
  cancelled: { bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444', label: 'Annulée'       },
  collected: { bg: '#EDE9FE', color: '#7C3AED', dot: '#8B5CF6', label: 'Récupérée'    },
}
function StatusBadge({ status }: { status: Order['status'] }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending
  const pulse = status === 'pending' || status === 'preparing'
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '4px 10px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0, animation: pulse ? 'ping 1.4s ease-in-out infinite' : 'none' }} />
      {cfg.label}
    </span>
  )
}

/* ─── action buttons ─────────────────────────────────────────── */
function BtnPrepare({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#EA580C', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8M12 8v8"/></svg>
      Préparer
    </button>
  )
}
function BtnReady({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Prête
    </button>
  )
}
function BtnCollected({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
      Récupérée
    </button>
  )
}
function BtnCancel({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={() => { if (window.confirm('Annuler cette commande ?')) onClick() }} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      Annuler
    </button>
  )
}
function BtnReopen({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
      Réouvrir
    </button>
  )
}
function ActionButtons({ id, status, updateStatus }: { id: number; status: Order['status']; updateStatus: (id: number, s: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {status === 'pending' && <>
        <BtnPrepare onClick={() => updateStatus(id, 'preparing')} />
        <BtnCancel  onClick={() => updateStatus(id, 'cancelled')} />
      </>}
      {status === 'preparing' && <>
        <BtnReady  onClick={() => updateStatus(id, 'done')} />
        <BtnCancel onClick={() => updateStatus(id, 'cancelled')} />
      </>}
      {status === 'done' && <BtnCollected onClick={() => updateStatus(id, 'collected')} />}
      {(status === 'cancelled' || status === 'collected') && <BtnReopen onClick={() => updateStatus(id, 'pending')} />}
    </div>
  )
}

/* ─── mobile order card ──────────────────────────────────────── */
function OrderCard({ o, updateStatus }: { o: Order; updateStatus: (id: number, s: string) => void }) {
  const summary = (o.items ?? []).map(i => `${i.qty}× ${i.name}`).join(' · ')
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 800, color: '#1E4D3A', fontSize: 14 }}>RMO-{o.order_id}</div>
        <StatusBadge status={o.status} />
      </div>
      <div style={{ fontSize: 12, color: '#374151', marginBottom: 6, lineHeight: 1.4 }}>{summary}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: '#94A3B8' }}>{fmt(o.created_at)}</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>{money(Number(o.total))}</div>
      </div>
      <ActionButtons id={o.id} status={o.status} updateStatus={updateStatus} />
    </div>
  )
}

/* ─── mobile reservation card ────────────────────────────────── */
function ResCard({ r, updateResStatus, deleteRes }: { r: Reservation; updateResStatus: (id: number, s: string) => void; deleteRes: (id: number) => void }) {
  const fmtD = (d: string) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' }) }
    catch { return d }
  }
  return (
    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 800, color: '#1E4D3A', fontSize: 14 }}>{r.fullname}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{fmtD(r.date)} · {r.time} · {r.guests} pers.</div>
        </div>
        <ResStatusBadge status={r.status} />
      </div>
      {r.message && (
        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8, borderLeft: '3px solid #E5E7EB', paddingLeft: 8 }}>{r.message}</div>
      )}
      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 10 }}>{r.email}{r.phone ? ' · ' + r.phone : ''}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {r.status === 'pending' && (
          <button onClick={() => updateResStatus(r.id, 'confirmed')}
            style={{ flex: 1, padding: '9px', background: '#059669', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            ✓ Confirmer
          </button>
        )}
        {r.status !== 'cancelled' && (
          <button onClick={() => updateResStatus(r.id, 'cancelled')}
            style={{ flex: 1, padding: '9px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Annuler
          </button>
        )}
        {r.status === 'cancelled' && (
          <button onClick={() => updateResStatus(r.id, 'pending')}
            style={{ flex: 1, padding: '9px', background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Réouvrir
          </button>
        )}
        <button onClick={() => deleteRes(r.id)}
          style={{ padding: '9px 12px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Supprimer">
          <IconTrash />
        </button>
      </div>
    </div>
  )
}

/* ─── orders table ───────────────────────────────────────────── */
function OrdersTable({ orders, updateStatus, compact, emptyMsg }: {
  orders: Order[]; updateStatus: (id: number, s: string) => void; compact?: boolean; emptyMsg?: string
}) {
  if (orders.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
        {emptyMsg ?? 'Aucune commande'}
      </div>
    )
  }
  return (
    <>
      {/* Mobile cards */}
      <div className="orders-cards">
        {orders.map(o => <OrderCard key={o.id} o={o} updateStatus={updateStatus} />)}
      </div>
      {/* Desktop/tablet table */}
      <div className="orders-table-wrap" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
            {(['N°', !compact && 'Date', 'Heure', 'Articles', 'Total', 'Statut', 'Action'] as (string|boolean)[]).filter(Boolean).map(h => (
              <th key={String(h)} style={{ padding: compact ? '8px 12px' : '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{String(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const summary = (o.items ?? []).slice(0, 2).map(i => `${i.qty}× ${i.name}`).join(', ') +
              ((o.items?.length ?? 0) > 2 ? ` +${o.items.length - 2}` : '')
            return (
              <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: compact ? '10px 12px' : '14px 16px', fontWeight: 800, color: '#1E4D3A', fontSize: 13, whiteSpace: 'nowrap' }}>RMO-{o.order_id}</td>
                {!compact && <td style={{ padding: '14px 8px', fontSize: 12, color: '#64748B', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>}
                <td style={{ padding: compact ? '10px 8px' : '14px 8px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>{fmt(o.created_at)}</td>
                <td style={{ padding: compact ? '10px 8px' : '14px 8px', fontSize: 12, color: '#64748B', maxWidth: 180, cursor: 'help' }}
                  title={(o.items ?? []).map(i => `${i.qty}× ${i.name}`).join('\n')}>
                  <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{summary}</span>
                </td>
                <td style={{ padding: compact ? '10px 8px' : '14px 8px', fontWeight: 800, fontSize: 14, color: '#1E293B', whiteSpace: 'nowrap' }}>{money(Number(o.total))}</td>
                <td style={{ padding: compact ? '10px 8px' : '14px 8px' }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: compact ? '10px 12px' : '14px 16px' }}>
                  <ActionButtons id={o.id} status={o.status} updateStatus={updateStatus} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </>
  )
}

/* ─── settings tab ──────────────────────────────────────────── */
function SettingsTab({ soundEnabled, onSoundChange, notifEnabled, notifPermission, onNotifChange, onRequestNotif }: {
  soundEnabled: boolean; onSoundChange: (v: boolean) => void
  notifEnabled: boolean; notifPermission: NotificationPermission
  onNotifChange: (v: boolean) => void; onRequestNotif: () => void
}) {
  const row = (label: string, value: string) => (
    <div key={label} style={{ padding: '13px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', padding: '3px 10px', borderRadius: 8 }}>{value}</span>
    </div>
  )
  return (
    <div className="commandes-padding">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Réglages</h1>
        <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 2 }}>Configuration du panneau d&apos;administration</p>
      </div>
      <div className="settings-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Notifications */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>Notifications</p>
          </div>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Son nouvelle commande</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Ding à 3 notes à chaque nouvelle commande reçue</div>
            </div>
            <button onClick={() => onSoundChange(!soundEnabled)}
              style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: soundEnabled ? '#1E4D3A' : '#D1D5DB', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: 2, left: soundEnabled ? 22 : 2, width: 20, height: 20,
                background: 'white', borderRadius: '50%', transition: 'left .2s', display: 'block',
                boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
            </button>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Tester — le navigateur bloque l&apos;audio sans interaction préalable</span>
            <button onClick={() => playNotificationSound()}
              style={{ fontSize: 12, fontWeight: 600, color: '#1E4D3A', border: '1px solid #D1D5DB', padding: '6px 14px', borderRadius: 8, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBell /> Tester le son
            </button>
          </div>
        </div>

        {/* Notifications web (browser) */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>Notifications web</p>
          </div>
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Alerte navigateur</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Popup système même si l&apos;onglet est en arrière-plan</div>
            </div>
            {notifPermission === 'denied' ? (
              <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, background: '#FEF2F2', padding: '4px 10px', borderRadius: 8, flexShrink: 0 }}>Bloqué dans le navigateur</span>
            ) : notifPermission === 'granted' ? (
              <button onClick={() => onNotifChange(!notifEnabled)}
                style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                  background: notifEnabled ? '#1E4D3A' : '#D1D5DB', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                <span style={{ position: 'absolute', top: 2, left: notifEnabled ? 22 : 2, width: 20, height: 20,
                  background: 'white', borderRadius: '50%', transition: 'left .2s', display: 'block',
                  boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
              </button>
            ) : (
              <button onClick={onRequestNotif}
                style={{ fontSize: 12, fontWeight: 700, color: 'white', background: '#1E4D3A', border: 'none', padding: '7px 14px', borderRadius: 8, cursor: 'pointer', flexShrink: 0 }}>
                Activer
              </button>
            )}
          </div>
          {notifPermission === 'denied' && (
            <div style={{ padding: '10px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12, color: '#6B7280' }}>
              Pour réactiver : Paramètres navigateur → Confidentialité → Notifications → chezramo.fr
            </div>
          )}
        </div>

        {/* Système */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>Système</p>
          </div>
          {row('Application', 'Chez Ramo Admin v2.0')}
          {row('Base de données', 'Supabase — PostgreSQL')}
          {row('Paiements', 'Stripe Test Mode')}
          {row('Hébergement', 'Next.js 14 App Router')}
          <div style={{ padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>TVs client</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1,2,3].map(n => (
                <a key={n} href={`${BASE}/tv?tv=${n}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: '#1E4D3A', background: '#EEF6F1', padding: '3px 10px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
                  TV {n} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Accès admin */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>Accès admin</p>
          </div>
          {row('Adresse mail', 'chezramo@gmail.com')}
          <div style={{ padding: '13px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Mot de passe</span>
            <span style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', background: '#F3F4F6', padding: '3px 10px', borderRadius: 8 }}>••••••••</span>
          </div>
        </div>

        {/* Liens rapides */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFC' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>Liens rapides</p>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Menu QR client', href: `${BASE}/menu-qr`, desc: 'Page menu sur table' },
              { label: 'Menu carte', href: `${BASE}/menu-qr`, desc: 'Affichage menu' },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer"
                style={{ flex: 1, minWidth: 140, background: '#F8F9FB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '12px 14px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1E4D3A' }}>{l.label} ↗</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{l.desc}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

/* ─── dashboard tab ──────────────────────────────────────────── */
function IconStar() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}

function StarRating({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= n ? '#F5A623' : 'none'} stroke={i <= n ? '#F5A623' : '#D1D5DB'} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      ))}
    </span>
  )
}

function FeedbacksTab({ feedbacks, onRefresh }: { feedbacks: Feedback[]; onRefresh: () => void }) {
  const avg = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.stars, 0) / feedbacks.length).toFixed(1)
    : '—'

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Baloo 2', system-ui", fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Avis clients</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>
            {feedbacks.length} avis · Moyenne : <strong style={{ color: '#F5A623' }}>{avg} / 5</strong>
          </p>
        </div>
        <button onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
          <IconRefresh /> Actualiser
        </button>
      </div>

      {/* Stats étoiles */}
      {feedbacks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
          {[5,4,3,2,1].map(s => {
            const count = feedbacks.filter(f => f.stars === s).length
            const pct = feedbacks.length ? Math.round(count / feedbacks.length * 100) : 0
            return (
              <div key={s} style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{count}</div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}><StarRating n={s} /></div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{pct}%</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Liste */}
      {feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: .4 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <p style={{ fontSize: 14 }}>Aucun avis pour l&apos;instant</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {feedbacks.map(f => (
            <div key={f.id} style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: f.message ? 10 : 0 }}>
                <StarRating n={f.stars} />
                {f.table_num && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', background: '#F3F4F6', borderRadius: 99, padding: '2px 9px' }}>
                    Table {f.table_num}
                  </span>
                )}
                {f.prize && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1E4D3A', background: 'rgba(30,77,58,.08)', borderRadius: 99, padding: '2px 9px' }}>
                    🎁 {f.prize}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>
                  {new Date(f.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {f.message && (
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, margin: 0, paddingTop: 4, borderTop: '1px solid #F9FAFB' }}>
                  &ldquo;{f.message}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NewsletterTab({ subs, onRefresh }: { subs: NewsletterSub[]; onRefresh: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyAll = () => {
    const txt = subs.map(s => s.email).join('\n')
    navigator.clipboard.writeText(txt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <div style={{ padding: '28px 28px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Baloo 2', system-ui", fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Newsletter</h2>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{subs.length} inscrits</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copyAll} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: copied ? '#D1FAE5' : 'white', cursor: 'pointer', fontSize: 13, color: copied ? '#065F46' : '#374151', fontWeight: 600, transition: 'all .2s' }}>
            {copied ? '✓ Copié !' : 'Copier tous les emails'}
          </button>
          <button onClick={onRefresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 500 }}>
            <IconRefresh /> Actualiser
          </button>
        </div>
      </div>

      {subs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9CA3AF' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: .4 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <p style={{ fontSize: 14 }}>Aucun inscrit pour l&apos;instant</p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #F3F4F6', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '.08em', textTransform: 'uppercase' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#111827' }}>{s.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DashboardTab({ orders, updateStatus, onGoToCommandes }: {
  orders: Order[]; updateStatus: (id: number, s: string) => void; onGoToCommandes: () => void
}) {
  const today = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today)
  const pending = orders.filter(o => o.status === 'pending')
  const done = todayOrders.filter(o => o.status === 'done')
  const revenue = todayOrders.filter(o => o.status !== 'cancelled').reduce((t, o) => t + Number(o.total), 0)
  const recentOrders = orders.slice(0, 8)

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F8F9FB' }}>

      {/* Hero banner */}
      <div className="dash-hero" style={{ background: '#F0F7F3', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', margin: '0 0 2px' }}>
            Bonjour, <span style={{ color: '#1E4D3A', fontWeight: 700 }}>Admin</span>
          </p>
          <h1 className="dash-hero-title" style={{ fontWeight: 900, color: '#111827', margin: '0 0 10px', fontFamily: "'Baloo 2', system-ui", letterSpacing: '-.01em', lineHeight: 1.1 }}>
            Bienvenue chez Ramo
          </h1>
          <LiveIndicator />
        </div>
        <svg className="dash-hero-deco" width="340" height="110" viewBox="0 0 380 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', right: 24, top: 0, bottom: 0, opacity: .8, flexShrink: 0 }}>
          <path d="M60 45 Q110 15, 170 45 T250 28" stroke="#1E4D3A" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <circle cx="290" cy="42" r="26" fill="#E8A93B" stroke="#C68B1A" strokeWidth="2.5"/>
          <path d="M278 32 Q290 16, 302 32" stroke="#C68B1A" strokeWidth="1.5" fill="none"/>
          <ellipse cx="240" cy="82" rx="30" ry="13" fill="#86EFAC" stroke="#16A34A" strokeWidth="2.5" transform="rotate(-12 240 82)"/>
          <ellipse cx="218" cy="92" rx="22" ry="18" fill="#BBF7D0" stroke="#16A34A" strokeWidth="2.5"/>
          <path d="M320 34 L345 95 L308 85 Z" fill="#FCD34D" stroke="#B45309" strokeWidth="2.5"/>
          <path d="M168 18 C148 38, 188 62, 178 82" stroke="#EF4444" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <circle cx="100" cy="88" r="18" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2"/>
        </svg>
      </div>

      {/* Content */}
      <div className="dash-padding">
        <div className="dash-grid">

          {/* Left: cards + table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            {/* Stat cards */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14, marginTop: 0 }}>Aperçu du jour</h3>
              <div className="stats-grid">
                <StatCard
                  icon={<CardIconOrders />} iconBg="#EEF6F1" iconColor="#1E4D3A"
                  label="Commandes aujourd'hui" value={todayOrders.length}
                  badge={done.length > 0 ? `+${done.length} livrées` : undefined} badgeGreen
                  footer={<>Total : <strong style={{color:'#111827'}}>{orders.length}</strong> commandes</>}
                />
                <StatCard
                  icon={<CardIconPending />} iconBg="#FFF7ED" iconColor="#EA580C"
                  label="En attente" value={pending.length}
                  badge={pending.length > 0 ? `${pending.length} urgent${pending.length > 1 ? 'es' : 'e'}` : undefined}
                  badgeGreen={false}
                  footer="À préparer maintenant"
                  onAction={onGoToCommandes} actionLabel="Voir tout"
                />
                <StatCard
                  icon={<CardIconRevenue />} iconBg="#F0FDF4" iconColor="#16A34A"
                  label="Chiffre du jour" value={money(revenue)}
                  badge={done.length > 0 ? `${done.length} livrées` : undefined} badgeGreen
                  footer="Paiements Stripe"
                />
              </div>
            </div>

            {/* Recent orders */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14, marginTop: 0 }}>Commandes récentes</h3>
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #F3F4F6', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                {recentOrders.length === 0 ? (
                  <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                    Aucune commande pour l&apos;instant
                  </div>
                ) : (
                  <>
                    <div className="orders-cards">
                      {recentOrders.map(o => <OrderCard key={o.id} o={o} updateStatus={updateStatus} />)}
                    </div>
                    <div className="orders-table-wrap" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                        <thead>
                          <tr style={{ background: 'rgba(243,244,246,.7)', borderBottom: '1px solid #F3F4F6' }}>
                            {['N° commande','Heure','Articles','Total','Statut','Action'].map(h => (
                              <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map(o => {
                            const summary = (o.items ?? []).slice(0, 2).map(i => `${i.qty}× ${i.name}`).join(', ') + ((o.items?.length ?? 0) > 2 ? ` +${o.items.length - 2}` : '')
                            return (
                              <tr key={o.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1E4D3A', fontSize: 13, whiteSpace: 'nowrap' }}>RMO-{o.order_id}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmt(o.created_at)}</td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#374151', maxWidth: 180 }}>
                                  <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{summary}</span>
                                </td>
                                <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: '#111827', whiteSpace: 'nowrap' }}>{money(Number(o.total))}</td>
                                <td style={{ padding: '12px 14px' }}>
                                  <StatusBadge status={o.status} />
                                </td>
                                <td style={{ padding: '12px 14px' }}>
                                  <ActionButtons id={o.id} status={o.status} updateStatus={updateStatus} />
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: promo card */}
          <div className="promo-panel" style={{ background: 'white', borderRadius: 20, border: '1px solid #F3F4F6', boxShadow: '0 1px 4px rgba(0,0,0,.05)', padding: 16, flexDirection: 'column', gap: 20, minHeight: 480 }}>
            <div style={{ borderRadius: 14, overflow: 'hidden', height: 210, position: 'relative', background: '#F3F4F6', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80" alt="Plat Chez Ramo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ textAlign: 'center', padding: '0 8px' }}>
              <p style={{ fontStyle: 'italic', fontSize: 20, color: '#111827', margin: '0 0 4px', fontFamily: "'Baloo 2', serif", fontWeight: 600 }}>Délicieux</p>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1.25, fontFamily: "'Baloo 2', system-ui" }}>
                Notre Menu<br />Kebab & Tacos
              </h3>
            </div>
            <a href={`${BASE}/menu-qr`} target="_blank" rel="noreferrer"
              style={{ display: 'block', width: '100%', background: '#1E4D3A', color: 'white', borderRadius: 14, padding: '13px', textAlign: 'center', fontWeight: 600, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(30,77,58,.3)', textDecoration: 'none', marginTop: 'auto' }}>
              Voir la carte →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── live sync indicator ────────────────────────────────────── */
function LiveIndicator() {
  const [tick, setTick] = useState(0)
  const [lastSync, setLastSync] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => { setTick(t => t + 1); setLastSync(new Date()) }, 5000)
    return () => clearInterval(iv)
  }, [])
  void tick
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 99, padding: '4px 12px', fontSize: 11, color: '#059669', fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'ping 1.4s ease-in-out infinite' }} />
      En direct · MAJ {lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  )
}

/* ─── commandes tab ──────────────────────────────────────────── */
function CommandesTab({ orders, updateStatus }: { orders: Order[]; updateStatus: (id: number, s: string) => void }) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'done' | 'cancelled' | 'collected'>('all')
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    done: orders.filter(o => o.status === 'done').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    collected: orders.filter(o => o.status === 'collected').length,
  }

  return (
    <div className="commandes-padding">
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Commandes</h1>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 2 }}>{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
        </div>
        <LiveIndicator />
        <div className="filters-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'preparing', 'done', 'collected', 'cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: filter === f ? '#1E4D3A' : '#F1F5F9',
                color: filter === f ? 'white' : '#64748B',
                transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5,
              }}>
              {{ all: 'Toutes', pending: 'En attente', preparing: 'En préparation', done: 'Prêtes', collected: 'Récupérées', cancelled: 'Annulées' }[f]}
              <span style={{ opacity: .65, fontSize: 11 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        <OrdersTable orders={filtered} updateStatus={updateStatus} emptyMsg="Aucune commande dans cette catégorie" />
      </div>
    </div>
  )
}

/* ─── notification toast ─────────────────────────────────────── */
function NewOrderToast({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, typeof document !== 'undefined' && document.hasFocus() ? 15000 : 60000)
    return () => clearTimeout(t)
  }, [count, onDismiss])

  return (
    <div className="toast-pos" style={{
      position: 'fixed', zIndex: 200,
      background: '#1E4D3A', color: 'white', borderRadius: 16,
      padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp .35s ease-out',
    }}>
      <div style={{ width: 36, height: 36, background: '#E8A93B', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconOrders />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>
          {count === 1 ? 'Nouvelle commande !' : `${count} nouvelles commandes !`}
        </div>
        <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>Un client vient de payer en ligne</div>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', padding: 4, marginLeft: 4, display: 'flex', alignItems: 'center' }}><IconX /></button>
    </div>
  )
}

/* ─── reservation toast ──────────────────────────────────────── */
function NewResToast({ count, onDismiss }: { count: number; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, typeof document !== 'undefined' && document.hasFocus() ? 15000 : 60000)
    return () => clearTimeout(t)
  }, [count, onDismiss])
  return (
    <div className="toast-pos toast-pos-2" style={{
      position: 'fixed', zIndex: 201,
      background: '#1E4D3A', color: 'white', borderRadius: 16,
      padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,.28)',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp .35s ease-out',
    }}>
      <div style={{ width: 36, height: 36, background: '#E8A93B', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <IconCalendar />
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14 }}>
          {count === 1 ? 'Nouvelle réservation !' : `${count} nouvelles réservations !`}
        </div>
        <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>Un client demande une table</div>
      </div>
      <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', cursor: 'pointer', padding: 4, marginLeft: 4, display: 'flex', alignItems: 'center' }}><IconX /></button>
    </div>
  )
}

/* ─── reservations tab ───────────────────────────────────────── */
const RES_STATUS = {
  pending:   { bg: '#FEF3C7', color: '#D97706', dot: '#F59E0B', label: 'En attente' },
  confirmed: { bg: '#D1FAE5', color: '#059669', dot: '#10B981', label: 'Confirmée'  },
  cancelled: { bg: '#FEE2E2', color: '#DC2626', dot: '#EF4444', label: 'Annulée'    },
}
function ResStatusBadge({ status }: { status: Reservation['status'] }) {
  const cfg = RES_STATUS[status] ?? RES_STATUS.pending
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', flexShrink: 0, animation: status === 'pending' ? 'ping 1.4s ease-in-out infinite' : 'none' }} />
      {cfg.label}
    </span>
  )
}

function ReservationsTab({ reservations, updateResStatus, deleteRes }: {
  reservations: Reservation[]
  updateResStatus: (id: number, status: string) => void
  deleteRes: (id: number) => void
}) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all')
  const filtered = (filter === 'all' ? reservations : reservations.filter(r => r.status === filter))
    .slice().sort((a, b) => {
      const da = new Date(`${a.date}T${a.time ?? '00:00'}`).getTime()
      const db = new Date(`${b.date}T${b.time ?? '00:00'}`).getTime()
      return da - db
    })
  const counts = {
    all: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  }

  const fmtResDate = (d: string) => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' }) }
    catch { return d }
  }

  return (
    <div className="commandes-padding">
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0 }}>Réservations</h1>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 2 }}>
            {reservations.length} réservation{reservations.length !== 1 ? 's' : ''} · {counts.pending} en attente
          </p>
        </div>
        <div className="filters-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: filter === f ? '#1E4D3A' : '#F1F5F9', color: filter === f ? 'white' : '#64748B', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5 }}>
              {{ all: 'Toutes', pending: 'En attente', confirmed: 'Confirmées', cancelled: 'Annulées' }[f]}
              <span style={{ opacity: .65, fontSize: 11 }}>({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
            Aucune réservation
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="res-cards">
              {filtered.map(r => <ResCard key={r.id} r={r} updateResStatus={updateResStatus} deleteRes={deleteRes} />)}
            </div>
            {/* Desktop table */}
            <div className="res-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                    {['Nom', 'Date', 'Heure', 'Pers.', 'Contact', 'Message', 'Statut', 'Action'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#1E4D3A', fontSize: 13, whiteSpace: 'nowrap' }}>{r.fullname}</td>
                      <td style={{ padding: '14px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>{fmtResDate(r.date)}</td>
                      <td style={{ padding: '14px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' }}>{r.time}</td>
                      <td style={{ padding: '14px', fontSize: 13, color: '#334155', textAlign: 'center' }}>{r.guests}</td>
                      <td style={{ padding: '14px', fontSize: 12, color: '#64748B' }}>
                        <div style={{ whiteSpace: 'nowrap' }}>{r.email}</div>
                        {r.phone && <div style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{r.phone}</div>}
                      </td>
                      <td style={{ padding: '14px', fontSize: 12, color: '#64748B', maxWidth: 160 }}>
                        {r.message
                          ? <span title={r.message} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.message}</span>
                          : <span style={{ color: '#D1D5DB' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px' }}><ResStatusBadge status={r.status} /></td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {r.status === 'pending' && (
                            <button onClick={() => updateResStatus(r.id, 'confirmed')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              ✓ Confirmer
                            </button>
                          )}
                          {r.status !== 'cancelled' && (
                            <button onClick={() => updateResStatus(r.id, 'cancelled')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Annuler
                            </button>
                          )}
                          {r.status === 'cancelled' && (
                            <button onClick={() => updateResStatus(r.id, 'pending')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: 'white', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Réouvrir
                            </button>
                          )}
                          <button onClick={() => deleteRes(r.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5px 8px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            title="Supprimer définitivement">
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── main component ─────────────────────────────────────────── */
export default function AdminClient() {
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [newsletter, setNewsletter] = useState<NewsletterSub[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [newOrderCount, setNewOrderCount] = useState(0)
  const [newResCount, setNewResCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const soundEnabledRef = useRef(true)
  const [notifEnabled, setNotifEnabled] = useState(true)
  const notifEnabledRef = useRef(true)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const lastMaxId = useRef<number>(0)
  const lastMaxResId = useRef<number>(0)
  const isFirst = useRef(true)
  const isFirstRes = useRef(true)

  useEffect(() => {
    if (FUNCTIONS_BASE) {
      const token = adminToken()
      if (token) {
        fetch(`${FUNCTIONS_BASE}/admin-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', token }),
        }).then(r => r.ok ? r.json() : null).then(d => { if (d?.ok) setAuthed(true) }).catch(() => {})
      }
    } else {
      fetch('/api/admin/verify').then(r => { if (r.ok) setAuthed(true) }).catch(() => {})
    }
    const v = localStorage.getItem('sound_enabled')
    if (v !== null) { const e = v !== 'false'; setSoundEnabled(e); soundEnabledRef.current = e }
    const n = localStorage.getItem('notif_enabled')
    if (n !== null) { const e = n !== 'false'; setNotifEnabled(e); notifEnabledRef.current = e }

    // Lire la permission au montage ET à chaque fois que la fenêtre reprend le focus
    // (l'utilisateur peut changer la permission dans les réglages du navigateur)
    const checkPerm = () => {
      if (typeof Notification !== 'undefined') setNotifPermission(Notification.permission)
    }
    checkPerm()
    window.addEventListener('focus', checkPerm)
    return () => window.removeEventListener('focus', checkPerm)
  }, [])

  const requestNotifPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setNotifPermission(perm)
    return perm
  }, [])

  const showOrderNotif = useCallback((order: Order) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!notifEnabledRef.current) return
    const n = new Notification('Nouvelle commande !', {
      body: `RMO-${order.order_id} · ${money(order.total)} · Voir dans l'admin`,
      icon: `${BASE}/favicon.svg`,
      badge: `${BASE}/favicon.svg`,
      tag: `order-${order.id}`,
      requireInteraction: true,
    })
    n.onclick = () => { window.focus(); n.close() }
  }, [])

  const showResNotif = useCallback((res: Reservation) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    if (!notifEnabledRef.current) return
    const n = new Notification('Nouvelle réservation !', {
      body: `${res.fullname} · ${res.guests} pers. le ${res.date} à ${res.time}`,
      icon: `${BASE}/favicon.svg`,
      badge: `${BASE}/favicon.svg`,
      tag: `res-${res.id}`,
      requireInteraction: true,
    })
    n.onclick = () => { window.focus(); n.close() }
  }, [])

  const fetchReservations = useCallback(async () => {
    try {
      const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/admin-reservations` : '/api/reservations'
      const res = await fetch(url, { headers: adminFetchHeaders() })
      if (!res.ok) return
      const data: Reservation[] = await res.json()
      if (!Array.isArray(data)) return
      setReservations(data)

      if (data.length > 0) {
        const maxResId = Math.max(...data.map(r => r.id))
        if (!isFirstRes.current && maxResId > lastMaxResId.current) {
          const newResas = data.filter(r => r.id > lastMaxResId.current)
          setNewResCount(n => n + newResas.length)
          if (soundEnabledRef.current) playNotificationSound()
          newResas.forEach(r => showResNotif(r))
        }
        lastMaxResId.current = maxResId
        isFirstRes.current = false
      }
    } catch { /* silent */ }
  }, [showResNotif])

  const updateResStatus = useCallback(async (id: number, status: string) => {
    const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/admin-reservations` : '/api/reservations'
    await fetch(url, {
      method: 'PATCH',
      headers: adminFetchHeaders(true),
      body: JSON.stringify({ id, status }),
    })
    fetchReservations()
  }, [fetchReservations])

  const deleteReservation = useCallback(async (id: number) => {
    if (!window.confirm('Supprimer définitivement cette réservation ?')) return
    const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/admin-reservations?id=${id}` : `/api/reservations?id=${id}`
    await fetch(url, { method: 'DELETE', headers: adminFetchHeaders() })
    fetchReservations()
  }, [fetchReservations])

  const fetchOrders = useCallback(async () => {
    try {
      const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/admin-orders` : '/api/orders'
      const res = await fetch(url, { headers: adminFetchHeaders() })
      if (!res.ok) return
      const data: Order[] = await res.json()
      if (!Array.isArray(data)) return
      setOrders(data)

      if (data.length > 0) {
        const maxId = Math.max(...data.map(o => o.id))
        if (!isFirst.current && maxId > lastMaxId.current) {
          const newOrders = data.filter(o => o.id > lastMaxId.current)
          setNewOrderCount(n => n + newOrders.length)
          if (soundEnabledRef.current) playNotificationSound()
          newOrders.forEach(o => showOrderNotif(o))
        }
        lastMaxId.current = maxId
        isFirst.current = false
      }
    } catch { /* silent */ }
  }, [showOrderNotif])

  const fetchFeedbacks = useCallback(async () => {
    try {
      const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/feedbacks` : '/api/feedbacks'
      const res = await fetch(url, { headers: adminFetchHeaders() })
      if (!res.ok) return
      const data: Feedback[] = await res.json()
      if (Array.isArray(data)) setFeedbacks(data)
    } catch { /* silent */ }
  }, [])

  const fetchNewsletter = useCallback(async () => {
    try {
      const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/newsletter` : '/api/newsletter'
      const res = await fetch(url, { headers: adminFetchHeaders() })
      if (!res.ok) return
      const data: NewsletterSub[] = await res.json()
      if (Array.isArray(data)) setNewsletter(data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchOrders()
    fetchReservations()
    fetchFeedbacks()
    fetchNewsletter()
    const iv = setInterval(fetchOrders, 5000)
    const iv2 = setInterval(fetchReservations, 5000)
    const iv3 = setInterval(fetchFeedbacks, 30000)
    return () => { clearInterval(iv); clearInterval(iv2); clearInterval(iv3) }
  }, [authed, fetchOrders, fetchReservations, fetchFeedbacks, fetchNewsletter])

  // Force le nouveau SW à prendre le contrôle sans intervention DevTools
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let reloading = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return
      reloading = true
      window.location.reload()
    })
    navigator.serviceWorker.getRegistration(BASE + '/').then(reg => {
      if (!reg) return
      const forceSkip = (sw: ServiceWorker | null) => {
        if (!sw) return
        if (sw.state === 'installed') sw.postMessage('SKIP_WAITING')
        sw.addEventListener('statechange', () => {
          if ((sw as ServiceWorker).state === 'installed') sw.postMessage('SKIP_WAITING')
        })
      }
      forceSkip(reg.waiting)
      reg.addEventListener('updatefound', () => forceSkip(reg.installing))
      reg.update().catch(() => { /* hors ligne */ })
    }).catch(() => { /* pas de SW */ })
  }, [])

  // Track current tab so onLoad can read it
  const tabRef = useRef<Tab>(tab)
  useEffect(() => { tabRef.current = tab }, [tab])

  // When switching to a legacy tab, call showTab() + fetchMenu() directly
  useEffect(() => {
    if (!authed) return
    if (!(['menu', 'tvs'] as Tab[]).includes(tab)) return
    const call = () => {
      const w = window as unknown as Record<string, unknown>
      // Reload menu data every time Menu tab is opened (ensures fresh data)
      if (tab === 'menu' && typeof w.fetchMenu === 'function') {
        (w.fetchMenu as () => void)()
      }
      if (typeof w.showTab === 'function') {
        (w.showTab as (t: string) => void)(tab)
      }
    }
    if (typeof (window as unknown as Record<string, unknown>).showTab === 'function') {
      setTimeout(call, 80)
    } else {
      setTimeout(call, 400)
    }
  }, [tab, authed])

  const login = async (user: string, pw: string): Promise<boolean> => {
    try {
      if (FUNCTIONS_BASE) {
        const res = await fetch(`${FUNCTIONS_BASE}/admin-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', user, pass: pw }),
        })
        if (!res.ok) return false
        const data = await res.json()
        if (!data.token) return false
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      } else {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user, pass: pw }),
        })
        if (!res.ok) return false
      }
      setAuthed(true)
      warmupAudio()
      return true
    } catch { return false }
  }

  const logout = async () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    if (!FUNCTIONS_BASE) await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    setAuthed(false)
  }

  const handleSoundChange = (v: boolean) => {
    setSoundEnabled(v)
    soundEnabledRef.current = v
    localStorage.setItem('sound_enabled', v ? 'true' : 'false')
  }

  const handleNotifChange = (v: boolean) => {
    setNotifEnabled(v)
    notifEnabledRef.current = v
    localStorage.setItem('notif_enabled', v ? 'true' : 'false')
  }

  const updateStatus = useCallback(async (id: number, status: string) => {
    const url = FUNCTIONS_BASE ? `${FUNCTIONS_BASE}/admin-orders` : '/api/orders'
    await fetch(url, {
      method: 'PATCH',
      headers: adminFetchHeaders(true),
      body: JSON.stringify({ id, status }),
    })
    fetchOrders()
  }, [fetchOrders])

  const goToCommandes = useCallback(() => { setTab('commandes'); setNewOrderCount(0) }, [])
  const goToReservations = useCallback(() => { setTab('reservations'); setNewResCount(0) }, [])
  // Badge = toutes les commandes actives non finalisées (en attente + en préparation)
  const pendingCount = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length
  const pendingResCount = reservations.filter(r => r.status === 'pending').length
  const isAdminJsTab = tab === 'menu' || tab === 'tvs'

  if (!authed) return <LoginScreen onLogin={login} />

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; background: #F8F9FB; }

        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes ping    { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

        /* ── admin legacy ── */
        #admin-legacy-wrap .topbar         { display: none !important; }
        #admin-legacy-wrap .stats-bar      { display: none !important; }
        #admin-legacy-wrap .bottom-tab-bar { display: none !important; }
        #admin-legacy-wrap #sidebar        { display: none !important; }
        #admin-legacy-wrap .admin-footer   { display: none !important; }
        #admin-legacy-wrap #login-screen   { display: none !important; }
        #admin-legacy-wrap #app            { display: block !important; }
        /* Save-bar : masquée par défaut, visible uniquement quand admin.js détecte des changements */
        .save-bar                          { display: none !important; }
        .admin-legacy-active .save-bar.visible {
          display: flex !important; position: fixed !important;
          bottom: 0; left: 0; right: 0; z-index: 300;
          transform: none !important;
        }

        /* ═══ Menu panel — light table layout ═══ */
        #admin-legacy-wrap #content {
          padding: 24px !important; background: #F8F9FB !important; min-height: 100% !important;
        }
        #admin-legacy-wrap .cat-section {
          background: white !important; border-radius: 16px !important;
          border: 1px solid #F3F4F6 !important; box-shadow: 0 1px 4px rgba(0,0,0,.05) !important;
          margin-bottom: 20px !important; overflow: hidden !important;
        }
        #admin-legacy-wrap .cat-header {
          background: white !important; border-bottom: 2px solid #F3F4F6 !important; padding: 14px 20px !important;
        }
        #admin-legacy-wrap .cat-name {
          font-family: 'Baloo 2', system-ui !important; font-size: 15px !important;
          font-weight: 800 !important; color: #1E4D3A !important; letter-spacing: 0 !important;
        }
        #admin-legacy-wrap .cat-count { color: #9CA3AF !important; font-size: 11px !important; }

        /* Items list = TABLE */
        #admin-legacy-wrap .items-list {
          display: table !important; width: 100% !important;
          border-collapse: collapse !important; flex-direction: unset !important; gap: 0 !important;
        }
        #admin-legacy-wrap .item-card {
          display: table-row !important; background: white !important;
          border: none !important; border-radius: 0 !important;
          padding: 0 !important; min-height: unset !important; position: static !important;
        }
        #admin-legacy-wrap .item-card:hover { background: #F0F7F3 !important; }
        #admin-legacy-wrap .item-card.has-changes { background: rgba(220,38,38,.04) !important; }
        #admin-legacy-wrap .item-card.has-changes::before { display: none !important; }

        /* Columns */
        #admin-legacy-wrap .item-thumb,
        #admin-legacy-wrap .item-info,
        #admin-legacy-wrap .item-prices,
        #admin-legacy-wrap .item-actions {
          display: table-cell !important; vertical-align: middle !important;
          padding: 10px 14px !important; border-bottom: 1px solid #F3F4F6 !important;
        }
        #admin-legacy-wrap .item-thumb {
          width: 58px !important; padding: 8px 6px 8px 16px !important;
          background: transparent !important; height: unset !important;
          flex-shrink: unset !important; border-radius: 0 !important; font-size: 0 !important;
        }
        #admin-legacy-wrap .item-thumb img {
          width: 44px !important; height: 44px !important;
          border-radius: 8px !important; object-fit: cover !important; display: block !important;
        }
        #admin-legacy-wrap .item-info { min-width: 160px !important; flex: unset !important; }
        #admin-legacy-wrap .item-title {
          font-family: 'DM Sans', system-ui !important; font-size: 13px !important;
          font-weight: 700 !important; color: #111827 !important; white-space: nowrap !important;
          margin-bottom: 3px !important; overflow: hidden !important; text-overflow: ellipsis !important;
        }
        #admin-legacy-wrap .item-meta { display: flex !important; gap: 4px !important; flex-wrap: wrap !important; }
        #admin-legacy-wrap .item-badge {
          font-size: 10px !important; font-weight: 600 !important; padding: 2px 8px !important;
          border-radius: 6px !important; background: rgba(30,77,58,.08) !important;
          color: #1E4D3A !important; text-transform: none !important; letter-spacing: 0 !important;
        }
        #admin-legacy-wrap .item-prices {
          display: table-cell !important; white-space: nowrap !important;
          flex-shrink: unset !important; align-items: unset !important;
        }
        #admin-legacy-wrap .price-group {
          flex-direction: row !important; align-items: center !important;
          gap: 6px !important; margin-bottom: 4px !important;
        }
        #admin-legacy-wrap .price-group:last-child { margin-bottom: 0 !important; }
        #admin-legacy-wrap .price-group label {
          font-size: 10px !important; color: #9CA3AF !important; width: 58px !important;
          text-align: right !important; text-transform: none !important;
          letter-spacing: 0 !important; font-weight: 500 !important;
        }
        #admin-legacy-wrap .price-input {
          width: 72px !important; background: #F8FAFC !important;
          border: 1px solid #E5E7EB !important; color: #111827 !important;
          border-radius: 8px !important; font-size: 13px !important; font-weight: 700 !important;
          min-height: 30px !important; padding: 4px 6px !important; text-align: center !important;
        }
        #admin-legacy-wrap .price-input:focus {
          border-color: #1E4D3A !important; box-shadow: 0 0 0 3px rgba(30,77,58,.1) !important; outline: none !important;
        }
        #admin-legacy-wrap .item-actions {
          text-align: right !important; white-space: nowrap !important;
          padding-right: 16px !important; flex-shrink: unset !important;
        }
        #admin-legacy-wrap .btn-icon {
          width: 30px !important; height: 30px !important; min-height: 30px !important;
          border-radius: 8px !important; border: 1px solid #E5E7EB !important;
          background: white !important; color: #6B7280 !important;
        }
        #admin-legacy-wrap .btn-edit:hover  { background: #EEF6F1 !important; border-color: #1E4D3A !important; color: #1E4D3A !important; }
        #admin-legacy-wrap .btn-delete:hover { background: #FEF2F2 !important; border-color: #EF4444 !important; color: #EF4444 !important; }

        /* Sidebar category nav */
        #admin-legacy-wrap nav#sidebar { background: white !important; border-right-color: #F1F5F9 !important; }
        #admin-legacy-wrap .sidebar-title { color: #9CA3AF !important; }
        #admin-legacy-wrap #sidebar-links a,
        #admin-legacy-wrap #sidebar-links .sidebar-link {
          color: #374151 !important; background: transparent !important; border-radius: 8px !important; display: block !important; padding: 7px 12px !important; font-size: 13px !important;
        }
        #admin-legacy-wrap #sidebar-links a:hover { background: rgba(30,77,58,.07) !important; color: #1E4D3A !important; }
        #admin-legacy-wrap #sidebar-links a.active { background: rgba(30,77,58,.1) !important; color: #1E4D3A !important; font-weight: 700 !important; }
        #admin-legacy-wrap .btn-outline {
          border-color: #1E4D3A !important; color: #1E4D3A !important; background: transparent !important; border-radius: 8px !important; font-size: 12px !important;
        }
        #admin-legacy-wrap .btn-outline:hover { background: #1E4D3A !important; color: white !important; }
        #admin-legacy-wrap .status-pill.online  { background: rgba(5,150,105,.12) !important; color: #059669 !important; border: none !important; }
        #admin-legacy-wrap .status-pill.loading { background: rgba(234,88,12,.1) !important;   color: #EA580C !important; border: none !important; }
        #admin-legacy-wrap .status-pill.offline { background: rgba(239,68,68,.1) !important;   color: #DC2626 !important; border: none !important; }

        /* ── responsive layout classes ── */
        .admin-sidebar   { transition: transform .28s cubic-bezier(.4,0,.2,1); }
        .mobile-hamburger { display: none !important; }
        .mobile-bottom-nav { display: none; }
        .admin-topbar { display: flex; }
        .sidebar-close-btn { display: none; }
        .toast-pos { bottom: 28px; right: 28px; max-width: 340px; }
        .toast-pos-2 { bottom: 96px; }

        /* dashboard */
        .dash-hero   { padding: 32px 36px; min-height: 148px; }
        .dash-hero-title { font-size: 34px; }
        .dash-padding { padding: 28px 32px; }
        .dash-grid   { display: grid; grid-template-columns: 1fr 280px; gap: 24px; align-items: start; }
        .stats-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .promo-panel { display: flex; }
        .commandes-padding { padding: 32px 28px; }
        .notif-banner { flex-direction: row; padding: 10px 20px; }
        .notif-banner-text { font-size: 13px; }

        /* Tables plein largeur */
        .res-cards { display: none; }
        .orders-cards { display: none; }

        /* ── tablet (sidebar collapses) ── */
        @media (max-width: 960px) {
          .admin-sidebar { transform: translateX(-256px); }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-main { margin-left: 0 !important; }
          .mobile-hamburger { display: flex !important; }
          .sidebar-close-btn { display: flex !important; }
          .dash-grid { grid-template-columns: 1fr; }
          .promo-panel { display: none; }
        }

        /* ── mobile ── */
        @media (max-width: 640px) {
          /* Navigation unique : bottom nav seulement */
          .mobile-bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: 62px;
            background: white; border-top: 1px solid #F1F5F9; z-index: 40;
            padding-bottom: env(safe-area-inset-bottom, 0px);
            box-shadow: 0 -4px 24px rgba(0,0,0,.1);
          }
          /* Masquer le top bar sur mobile (bottom nav remplace) */
          .admin-topbar { display: none !important; }
          /* Compensation pour le bottom nav fixe */
          .admin-tab-content { padding-bottom: 72px !important; }
          .dash-hero   { padding: 14px 12px; min-height: auto; }
          .dash-hero-title { font-size: 20px !important; }
          .dash-hero-deco { display: none !important; }
          .dash-padding { padding: 10px; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
          .commandes-padding { padding: 10px; }
          .toast-pos { bottom: 74px; right: 10px; left: 10px; max-width: none; }
          .toast-pos-2 { bottom: 148px; }
          /* Mobile: cards au lieu de tables */
          .res-table-wrap { display: none !important; }
          .res-cards { display: block; }
          .orders-table-wrap { display: none !important; }
          .orders-cards { display: block; }
          /* Bannières notifications compactes */
          .notif-banner { flex-direction: column; gap: 8px; padding: 10px 12px; align-items: flex-start !important; }
          .notif-banner-text { font-size: 12px !important; }
          /* Settings scrollable */
          .settings-wrap { max-width: none !important; }
          /* Filtres scrollables horizontalement */
          .filters-row { flex-wrap: nowrap !important; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
          .filters-row::-webkit-scrollbar { display: none; }
        }

        @media (max-width: 420px) {
          .stats-grid { grid-template-columns: 1fr; }
        }

        /* ═══ TV panel — table layout ═══ */
        #admin-legacy-wrap #content-tvs {
          background: #F8F9FB !important; padding: 0 !important;
          display: flex !important; flex-direction: column !important; height: 100%;
        }
        #admin-legacy-wrap #content-tvs .panel-header {
          padding: 24px 24px 18px !important; background: white !important;
          border-bottom: 1px solid #F1F5F9 !important;
        }
        #admin-legacy-wrap .panel-title {
          font-family: 'Baloo 2', system-ui !important; font-size: 19px !important;
          font-weight: 900 !important; color: #111827 !important; letter-spacing: 0 !important;
        }
        #admin-legacy-wrap .panel-subtitle {
          font-size: 12px !important; color: #94A3B8 !important; margin-top: 2px !important;
        }

        /* Table header (rendered in JSX, static) */
        #admin-legacy-wrap .tv-table-head {
          display: flex; align-items: center;
          background: #F8FAFC; border-bottom: 2px solid #E2E8F0;
          padding: 10px 0;
        }
        #admin-legacy-wrap .tv-table-head span {
          font-size: 10px; font-weight: 700; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: .1em;
        }

        /* TV grid container */
        #admin-legacy-wrap .tv-grid {
          display: flex !important; flex-direction: column !important;
          gap: 0 !important; grid-template-columns: unset !important;
          background: white !important; margin: 20px 24px !important;
          border-radius: 16px !important; border: 1px solid #F3F4F6 !important;
          overflow: hidden !important; box-shadow: 0 1px 4px rgba(0,0,0,.05) !important;
        }

        /* TV card = table row */
        #admin-legacy-wrap .tv-card {
          display: flex !important; align-items: center !important; flex-direction: row !important;
          background: white !important; border: none !important; border-radius: 0 !important;
          border-bottom: 1px solid #F3F4F6 !important; padding: 0 !important;
          margin: 0 !important; cursor: default !important; min-height: 76px !important;
          box-shadow: none !important;
        }
        #admin-legacy-wrap .tv-card:last-child { border-bottom: none !important; }
        #admin-legacy-wrap .tv-card:hover { background: #F9FAFB !important; }
        #admin-legacy-wrap .tv-card.tv-card-online { background: #F0FFF6 !important; }
        #admin-legacy-wrap .tv-card.tv-card-online:hover { background: #E6FFF0 !important; }

        /* Column: Status/Icon */
        #admin-legacy-wrap .tv-card-top,
        #admin-legacy-wrap .tv-table-head .tvcol-status {
          width: 88px; flex-shrink: 0; padding: 12px 10px 12px 16px !important;
        }
        #admin-legacy-wrap .tv-card-top {
          display: flex !important; flex-direction: column !important;
          align-items: center !important; gap: 6px !important;
          justify-content: center !important; border-right: none !important;
          background: transparent !important; margin: 0 !important;
        }
        #admin-legacy-wrap .tv-icon {
          width: 36px !important; height: 36px !important; border-radius: 10px !important;
          background: #F1F5F9 !important; color: #64748B !important;
          display: flex !important; align-items: center !important;
          justify-content: center !important;
        }
        #admin-legacy-wrap .tv-card-online .tv-icon {
          background: #D1FAE5 !important; color: #059669 !important;
        }
        #admin-legacy-wrap .tv-badge {
          font-size: 9px !important; font-weight: 700 !important; padding: 2px 7px !important;
          border-radius: 99px !important; letter-spacing: .06em !important; white-space: nowrap !important;
          animation: none !important;
        }
        #admin-legacy-wrap .tv-badge::before { display: none !important; }
        #admin-legacy-wrap .tv-badge-live   { background: #D1FAE5 !important; color: #059669 !important; border: none !important; }
        #admin-legacy-wrap .tv-badge-offline{ background: #F1F5F9 !important; color: #94A3B8 !important; border: none !important; }

        /* Column: Name */
        #admin-legacy-wrap .tv-card > div:nth-child(2),
        #admin-legacy-wrap .tv-table-head .tvcol-name {
          width: 150px; flex-shrink: 0; padding: 12px !important;
        }
        #admin-legacy-wrap .tv-label {
          font-family: 'Baloo 2', system-ui !important; font-weight: 800 !important;
          font-size: 15px !important; color: #111827 !important;
          letter-spacing: 0 !important; margin-bottom: 2px !important;
        }
        #admin-legacy-wrap .tv-sublabel {
          font-size: 11px !important; color: #94A3B8 !important; font-weight: 500 !important;
        }

        /* Column: Device */
        #admin-legacy-wrap .tv-device,
        #admin-legacy-wrap .tv-table-head .tvcol-device {
          flex: 1; min-width: 110px; padding: 12px !important;
        }
        #admin-legacy-wrap .tv-device {
          display: flex !important; flex-direction: column !important; gap: 3px !important;
          border: none !important; border-radius: 0 !important; background: transparent !important; margin: 0 !important;
        }
        #admin-legacy-wrap .tv-device-id {
          font-family: 'Courier New', monospace !important; font-size: 11px !important;
          color: #374151 !important; background: #F3F4F6 !important;
          padding: 2px 8px !important; border-radius: 6px !important; display: inline-block !important;
        }
        #admin-legacy-wrap .tv-device-seen {
          font-size: 10px !important; color: #94A3B8 !important; margin-left: 0 !important;
        }
        #admin-legacy-wrap .tv-device.empty {
          color: #D1D5DB !important; font-style: italic !important; font-size: 12px !important;
        }

        /* Column: URL */
        #admin-legacy-wrap .tv-url-section,
        #admin-legacy-wrap .tv-table-head .tvcol-url {
          flex: 2; min-width: 180px; padding: 12px !important;
        }
        #admin-legacy-wrap .tv-url-section {
          display: flex !important; flex-direction: column !important; gap: 3px !important;
        }
        #admin-legacy-wrap .tv-url-label {
          font-size: 9px !important; color: #94A3B8 !important;
          text-transform: uppercase !important; letter-spacing: .08em !important;
        }
        #admin-legacy-wrap .tv-url-box {
          font-size: 10px !important; color: #374151 !important;
          background: #F8FAFC !important; border: 1px solid #E5E7EB !important;
          border-radius: 7px !important; padding: 4px 10px !important;
          font-family: 'Courier New', monospace !important;
          white-space: nowrap !important; overflow: hidden !important;
          text-overflow: ellipsis !important; max-width: 280px !important;
        }

        /* Column: Actions */
        #admin-legacy-wrap .tv-actions,
        #admin-legacy-wrap .tv-table-head .tvcol-actions {
          width: 196px; flex-shrink: 0; padding: 12px 16px 12px 12px !important;
        }
        #admin-legacy-wrap .tv-actions {
          display: flex !important; gap: 8px !important; justify-content: flex-end !important;
          flex-direction: row !important; flex-wrap: wrap !important;
        }
        #admin-legacy-wrap .tv-actions .btn {
          font-size: 11px !important; padding: 6px 10px !important;
          border-radius: 8px !important; display: flex !important;
          align-items: center !important; gap: 5px !important;
          cursor: pointer !important; font-weight: 600 !important;
          border: 1px solid transparent !important;
        }
        #admin-legacy-wrap .tv-actions .btn-ghost {
          background: white !important; border-color: #E5E7EB !important; color: #374151 !important;
        }
        #admin-legacy-wrap .tv-actions .btn-ghost:hover {
          border-color: #EF4444 !important; color: #EF4444 !important; background: #FEF2F2 !important;
        }
        #admin-legacy-wrap .tv-actions .btn-primary {
          background: #1E4D3A !important; color: white !important; border-color: #1E4D3A !important;
        }
        #admin-legacy-wrap .tv-actions .btn-primary:hover { background: #163D2F !important; }

        /* TV loading state */
        #admin-legacy-wrap .tv-loading {
          text-align: center !important; padding: 40px !important;
          color: #94A3B8 !important; font-size: 13px !important;
        }

        /* ═══ Settings panel overrides ═══ */
        #admin-legacy-wrap #content-settings { display: none !important; }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F8F9FB' }}>
        <Sidebar
          tab={tab} setTab={t => { setTab(t); if (t === 'commandes') setNewOrderCount(0); if (t === 'reservations') setNewResCount(0) }}
          logout={logout} pendingCount={pendingCount} pendingResCount={pendingResCount}
          mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: 256 }} className="admin-main">
          {/* Top bar — masqué sur mobile (bottom nav prend le relais) */}
          <div className="admin-topbar" style={{ background: 'white', borderBottom: '1px solid #F3F4F6', padding: '0 20px', height: 56, alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button onClick={() => setMobileOpen(v => !v)} className="mobile-hamburger"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, alignItems: 'center' }}>
              <IconHamburger />
            </button>
            <div style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#111827' }}>
              {{ dashboard: 'Dashboard', commandes: 'Commandes', reservations: 'Réservations', feedbacks: 'Avis clients', newsletter: 'Newsletter', menu: 'Menu', tvs: 'TVs', settings: 'Réglages' }[tab]}
            </div>
            {pendingCount > 0 && (
              <button onClick={goToCommandes}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FEF3C7', padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', animation: 'ping 1s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#D97706' }}>{pendingCount} en attente</span>
              </button>
            )}
          </div>

          {/* Bannière permission notifications — visible tant que pas accordée */}
          {notifPermission !== 'granted' && notifPermission !== 'denied' && (
            <div className="notif-banner" style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', flexShrink: 0 }}><IconBell /></span>
                <span className="notif-banner-text" style={{ fontWeight: 600, color: '#92400E' }}>
                  Active les notifications pour être alerté dès qu&apos;une commande arrive
                </span>
              </div>
              <button
                onClick={requestNotifPermission}
                style={{ flexShrink: 0, background: '#1E4D3A', color: 'white', border: 'none', borderRadius: 10, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Activer
              </button>
            </div>
          )}
          {notifPermission === 'denied' && (
            <div className="notif-banner" style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div className="notif-banner-text" style={{ fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 6 }}><IconBellOff /> Notifications bloquées dans le navigateur</div>
                <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 3, lineHeight: 1.5 }}>
                  Chrome : cadenas → Notifications → Autoriser → recharge<br/>
                  Safari : Préférences → Sites web → Notifications → Autoriser
                </div>
              </div>
              <button
                onClick={() => {
                  const p = typeof Notification !== 'undefined' ? Notification.permission : 'denied'
                  setNotifPermission(p)
                  if (p === 'granted') return
                  Notification.requestPermission().then(r => setNotifPermission(r)).catch(() => {})
                }}
                style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#991B1B', border: '1px solid #FECACA', background: 'white', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconRefresh /> Re-tester
              </button>
            </div>
          )}

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto' }} className="admin-tab-content">
            {tab === 'dashboard'    && <DashboardTab orders={orders} updateStatus={updateStatus} onGoToCommandes={goToCommandes} />}
            {tab === 'commandes'    && <CommandesTab orders={orders} updateStatus={updateStatus} />}
            {tab === 'reservations' && <ReservationsTab reservations={reservations} updateResStatus={updateResStatus} deleteRes={deleteReservation} />}
            {tab === 'feedbacks'    && <FeedbacksTab feedbacks={feedbacks} onRefresh={fetchFeedbacks} />}
            {tab === 'newsletter'   && <NewsletterTab subs={newsletter} onRefresh={fetchNewsletter} />}
            {tab === 'settings'     && <SettingsTab soundEnabled={soundEnabled} onSoundChange={handleSoundChange} notifEnabled={notifEnabled} notifPermission={notifPermission} onNotifChange={handleNotifChange} onRequestNotif={requestNotifPermission} />}

            <div id="admin-legacy-wrap" className={isAdminJsTab ? 'admin-legacy-active' : ''} style={{ display: isAdminJsTab ? 'block' : 'none', minHeight: '100%' }}>
              <div id="login-screen" style={{ display: 'none' }} />
              <div id="app">
                <div id="toast-container" />
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                  <div style={{ display: 'none' }}>
                    <button id="stab-menu" className="sidebar-tab" data-tab="menu">Menu</button>
                    <button id="stab-tvs" className="sidebar-tab" data-tab="tvs">TVs</button>
                    <button id="stab-settings" className="sidebar-tab" data-tab="settings">Réglages</button>
                    <button id="btab-menu" className="bottom-tab" data-tab="menu">Menu</button>
                    <button id="btab-tvs" className="bottom-tab" data-tab="tvs">TVs</button>
                    <button id="btab-settings" className="bottom-tab" data-tab="settings">Réglages</button>
                    <button id="menu-toggle-btn" />
                    <div id="sidebar-overlay" />
                    <input id="search-input" type="text" />
                    <input id="search-input-mobile" type="text" />
                    <div id="status-pill" /><div id="stat-cats" />
                    <div id="stat-items" /><div id="pending-count-stat">0</div>
                  </div>
                  <nav id="sidebar" className="sidebar" style={{ width: 220, background: 'white', borderRight: '1px solid #F1F5F9', flexShrink: 0, overflow: 'auto' }}>
                    <div className="sidebar-tabs" style={{ display: 'none' }} />
                    <div className="sidebar-title" id="sidebar-cat-label" style={{ padding: '16px 16px 8px', fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '.1em', textTransform: 'uppercase' }}>Catégories</div>
                    <div id="sidebar-links" />
                  </nav>
                  <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                    <main id="content" className="content" style={{ display: 'none', padding: 0 }}>
                      <div style={{ padding: '3rem', textAlign: 'center', color: '#555' }}>Chargement…</div>
                    </main>
                    <main id="content-tvs" className="content content-panel" style={{ display: 'none' }}>
                      <div className="panel-header"><div className="panel-title">Moniteur TVs</div><div className="panel-subtitle">Gérez les écrans de votre restaurant en temps réel</div></div>
                      <div className="tv-table-head" style={{ padding: '0 0 0 0' }}>
                        <span className="tvcol-status" style={{ textAlign: 'center' }}>Statut</span>
                        <span className="tvcol-name">TV</span>
                        <span className="tvcol-device">Appareil</span>
                        <span className="tvcol-url">Lien écran</span>
                        <span className="tvcol-actions" style={{ textAlign: 'right' }}>Actions</span>
                      </div>
                      <div id="tv-cards-grid" className="tv-grid"><div className="tv-loading">Chargement des TVs…</div></div>
                    </main>
                    <main id="content-settings" className="content content-panel" style={{ display: 'none' }}>
                      <div className="panel-header"><div className="panel-title">Réglages</div><div className="panel-subtitle">Configuration avancée du système</div></div>
                      <div className="settings-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        <div className="settings-placeholder-title">Configuration avancée</div>
                        <div className="settings-placeholder-text">À venir — configuration des paramètres avancés du restaurant.</div>
                      </div>
                    </main>
                    <div id="save-bar" className="save-bar">
                      <span id="pending-count" className="save-count">0 modification en attente</span>
                      <div className="save-actions">
                        <button className="btn btn-ghost btn-sm" id="discard-btn">Annuler</button>
                        <button id="btn-save-all" className="btn btn-primary btn-sm">Sauvegarder</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav tab={tab} setTab={t => { setTab(t); if (t === 'commandes') setNewOrderCount(0); if (t === 'reservations') setNewResCount(0) }} pendingCount={pendingCount} pendingResCount={pendingResCount} />

      {/* Modals (needed by admin.js) */}
      <div id="edit-modal" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-box">
          <div className="modal-header">
            <div className="modal-title">Modifier l&apos;article</div>
            <button className="modal-close" id="edit-modal-close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-photo-row">
              <div className="modal-photo-wrap">
                <img id="modal-img-preview" className="modal-photo-img" src="" alt="" />
                <div className="modal-photo-placeholder" id="modal-photo-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              </div>
              <div className="modal-photo-fields">
                <div className="form-group">
                  <label className="form-label">Catégorie</label>
                  <input id="modal-category" className="form-input" type="text" placeholder="Sandwichs Vedettes" />
                </div>
                <div className="form-group">
                  <label className="form-label">Chemin de l&apos;image</label>
                  <input id="modal-url" className="form-input" type="text" placeholder="/uploads/Kebab Geant.png" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom du plat</label>
              <input id="modal-title" className="form-input form-input-lg" type="text" placeholder="Kebab Géant" />
            </div>
            <div className="form-group">
              <label className="form-label">Description <span className="form-hint">(optionnel)</span></label>
              <textarea id="modal-desc" className="form-input form-textarea" placeholder="Double portion de viande de veau…" rows={2} />
            </div>
            <div className="modal-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Prix seul</label>
                <div className="price-field-wrap">
                  <input id="modal-price" className="form-input form-input-price" type="text" placeholder="9,00" />
                  <span className="price-field-euro">€</span>
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Prix menu</label>
                <div className="price-field-wrap">
                  <input id="modal-menuprice" className="form-input form-input-price" type="text" placeholder="12,00" />
                  <span className="price-field-euro">€</span>
                </div>
              </div>
            </div>
            <input id="modal-id" type="hidden" />
            <input id="modal-badge" type="hidden" />
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" id="edit-modal-cancel">Annuler</button>
            <button className="btn btn-primary" id="edit-modal-save">Enregistrer</button>
          </div>
        </div>
      </div>

      <div id="confirm-dialog" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-box confirm-box">
          <div className="confirm-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <div className="confirm-title">Confirmer la suppression</div>
          <div id="confirm-msg" className="confirm-msg">Supprimer cet article ?</div>
          <div className="confirm-actions">
            <button className="btn btn-ghost" id="confirm-cancel">Annuler</button>
            <button className="btn btn-danger" id="confirm-delete">Supprimer</button>
          </div>
        </div>
      </div>

      {newOrderCount > 0 && (
        <NewOrderToast count={newOrderCount} onDismiss={() => setNewOrderCount(0)} />
      )}
      {newResCount > 0 && (
        <NewResToast count={newResCount} onDismiss={() => { setNewResCount(0); goToReservations() }} />
      )}

      <link rel="stylesheet" href={`${BASE}/admin/admin.css`} />
      <Script
        src={`${BASE}/admin/admin.js`}
        strategy="afterInteractive"
        onLoad={() => {
          // DOMContentLoaded already fired — manually init admin.js
          const w = window as unknown as Record<string, unknown>
          w.isLoggedIn = true
          // Prevent the tutorial from running (it forces the save-bar visible)
          try { localStorage.setItem('tuto_seen', '1') } catch { /* silent */ }
          // Load menu data
          if (typeof w.fetchMenu === 'function') (w.fetchMenu as () => void)()
          // If already on a legacy tab, show it now
          const cur = tabRef.current
          if (['menu', 'tvs'].includes(cur) && typeof w.showTab === 'function') {
            setTimeout(() => {
              if (cur === 'menu' && typeof w.fetchMenu === 'function') (w.fetchMenu as () => void)()
              ;(w.showTab as (t: string) => void)(cur)
            }, 120)
          }
        }}
      />
    </>
  )
}
