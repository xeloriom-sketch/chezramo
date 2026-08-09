'use client'

import { create } from 'zustand'
import type { CartItem, CustomizerState, MenuItem } from './types'
import { MENU_DATA, SAUCES, NO_SAUCE_CATEGORIES } from './constants'

function money(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €'
}

function parsePrice(v: string | number | null | undefined): number {
  if (v == null || v === '' || v === 0) return 0
  if (typeof v === 'number') return v
  return parseFloat(String(v).replace(',', '.')) || 0
}

interface AppState {
  // cart
  cart: CartItem[]
  cartOpen: boolean
  // checkout
  checkoutOpen: boolean
  checkoutStep: 1 | 2 | 3
  paymentPhase: 'loading' | 'form' | 'paying' | 'error'
  paymentError: string | null
  orderId: number
  confirmedCart: CartItem[]
  confirmedTotal: number
  // nav
  navMenuOpen: boolean
  // menu
  openCategory: string | null
  menuData: MenuItem[]
  // customizer
  customizer: CustomizerState | null
  custMode: 'seul' | 'menu'
  custSauces: string[]
  custRemovals: string[]
  custQty: number
  custDrink: string
  // reviews
  reviewIndex: number
  // reservation
  reservation: string | null
  newsletterMsg: string

  // computed helpers
  cartCount: () => number
  total: () => number
  sauceExtra: () => number
  custUnitPrice: () => number
  money: (n: number) => string

  // actions
  stepItem: (idx: number, delta: number) => void
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  goToStep: (step: 1 | 2 | 3) => void
  setPaymentPhase: (phase: AppState['paymentPhase']) => void
  setPaymentError: (err: string | null) => void
  finishPayment: () => void
  setNavMenuOpen: (v: boolean) => void
  toggleCategory: (cat: string) => void
  setMenuData: (data: MenuItem[]) => void
  openCustomizer: (name: string, price: number, menuPrice?: number, hasSauce?: boolean) => void
  closeCustomizer: () => void
  toggleSauce: (sauce: string) => void
  toggleRemoval: (item: string) => void
  confirmCustomizer: () => void
  setCustMode: (mode: 'seul' | 'menu') => void
  setCustDrink: (drink: string) => void
  setCustQty: (qty: number) => void
  setReviewIndex: (i: number) => void
  nextReview: () => void
  setReservation: (text: string | null) => void
  setNewsletterMsg: (msg: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  cart: [],
  cartOpen: false,
  checkoutOpen: false,
  checkoutStep: 1,
  paymentPhase: 'form',
  paymentError: null,
  orderId: 1042,
  confirmedCart: [],
  confirmedTotal: 0,
  navMenuOpen: false,
  openCategory: 'burgers',
  menuData: MENU_DATA,
  customizer: null,
  custMode: 'seul',
  custSauces: [],
  custRemovals: [],
  custQty: 1,
  custDrink: '',
  reviewIndex: 2,
  reservation: null,
  newsletterMsg: 'Inscrivez-vous pour recevoir nos promos et nouveautés Chez Ramo.',

  money,

  cartCount: () => get().cart.reduce((t, i) => t + i.qty, 0),
  total: () => get().cart.reduce((t, i) => t + i.price * i.qty, 0),
  sauceExtra: () => Math.max(0, get().custSauces.length - 2),
  custUnitPrice: () => {
    const { customizer, custMode, sauceExtra } = get()
    if (!customizer) return 0
    const base = custMode === 'menu' && customizer.menuPrice > 0
      ? customizer.menuPrice : customizer.price
    return base + sauceExtra()
  },

  stepItem: (idx, delta) => set(s => {
    const cart = [...s.cart]
    const item = cart[idx]
    if (!item) return {}
    item.qty += delta
    if (item.qty <= 0) cart.splice(idx, 1)
    return { cart }
  }),

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  openCheckout: () => set({
    cartOpen: false,
    checkoutOpen: true,
    checkoutStep: 1,
    paymentPhase: 'form',
    paymentError: null,
  }),

  closeCheckout: () => set({
    checkoutOpen: false,
    checkoutStep: 1,
    paymentPhase: 'form',
    paymentError: null,
  }),

  goToStep: (step) => set({ checkoutStep: step }),

  setPaymentPhase: (phase) => set({ paymentPhase: phase }),
  setPaymentError: (err) => set({ paymentError: err }),

  finishPayment: () => set(s => ({
    confirmedCart: [...s.cart],
    confirmedTotal: s.total(),
    orderId: Math.floor(1000 + Math.random() * 9000),
    cart: [],
    checkoutStep: 3,
  })),

  setNavMenuOpen: (v) => set({ navMenuOpen: v }),

  toggleCategory: (cat) => set(s => ({
    openCategory: s.openCategory === cat ? null : cat,
  })),

  setMenuData: (data) => set({ menuData: data }),

  openCustomizer: (name, price, menuPrice = 0, hasSauce = true) => set({
    customizer: { name, price, menuPrice: menuPrice ?? 0, hasSauce, hasCrudites: hasSauce },
    custMode: 'seul',
    custDrink: '',
    custSauces: hasSauce ? [SAUCES[0]] : [],
    custRemovals: [],
    custQty: 1,
  }),

  closeCustomizer: () => set({ customizer: null }),

  toggleSauce: (sauce) => set(s => {
    const idx = s.custSauces.indexOf(sauce)
    const next = [...s.custSauces]
    idx >= 0 ? next.splice(idx, 1) : next.push(sauce)
    return { custSauces: next }
  }),

  toggleRemoval: (item) => set(s => {
    const idx = s.custRemovals.indexOf(item)
    const next = [...s.custRemovals]
    idx >= 0 ? next.splice(idx, 1) : next.push(item)
    return { custRemovals: next }
  }),

  confirmCustomizer: () => set(s => {
    const { customizer, custMode, custDrink, custSauces, custRemovals, custQty, custUnitPrice } = s
    if (!customizer) return {}
    const price = custUnitPrice()
    const parts: string[] = []
    if (customizer.menuPrice > 0) parts.push(custMode === 'menu' ? 'Menu' : 'Seul')
    if (custMode === 'menu' && custDrink) parts.push(custDrink)
    if (custSauces.length > 0) parts.push(custSauces.join(' + '))
    if (custRemovals.length > 0) parts.push('Sans ' + custRemovals.join(' + '))
    const displayName = customizer.name + (parts.length ? ' · ' + parts.join(' · ') : '')
    const key = `${customizer.name}||${custMode}||${custDrink}||${[...custSauces].sort().join(',')}||sans:${[...custRemovals].sort().join(',')}`
    const cart = [...s.cart]
    const existing = cart.find(i => i.key === key)
    if (existing) {
      existing.qty += custQty
    } else {
      cart.push({ key, name: displayName, price, qty: custQty })
    }
    return { cart, customizer: null, cartOpen: true }
  }),

  setCustMode: (mode) => set({ custMode: mode }),
  setCustDrink: (drink) => set({ custDrink: drink }),
  setCustQty: (qty) => set({ custQty: qty }),

  setReviewIndex: (i) => set({ reviewIndex: i }),
  nextReview: () => set(s => ({ reviewIndex: (s.reviewIndex + 1) % 8 })),

  setReservation: (text) => set({ reservation: text }),
  setNewsletterMsg: (msg) => set({ newsletterMsg: msg }),
}))

export function categoryItems(menuData: MenuItem[], cats: string[]): MenuItem[] {
  return menuData.filter(r => cats.includes(r.category))
}

export function fmtPrice(v: string | number | null | undefined): string {
  const n = parsePrice(v)
  return isNaN(n) || n === 0 ? '' : n.toFixed(2).replace('.', ',') + ' €'
}

export function itemHasSauce(cat: string): boolean {
  return !NO_SAUCE_CATEGORIES.includes(cat)
}

export { parsePrice as parseMenuPrice }
