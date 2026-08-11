export const dynamic = 'force-dynamic'

import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { MENU_DATA } from '@/lib/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! as any)

function parseMenuPrice(v: string): number {
  return parseFloat(v.replace(',', '.')) || 0
}

// Compute the authoritative server-side price from the cart item key.
// Key format: "BaseName||mode||drink||sauces||sans:removals"
// Returns null if the base item isn't found in MENU_DATA (Supabase-only item → use client price with validation).
function serverPrice(key: string): number | null {
  const parts = key.split('||')
  const baseName = parts[0]
  const mode = parts[1]
  const saucesStr = parts[3] ?? ''

  const item = MENU_DATA.find(m => m.title === baseName)
  if (!item) return null

  const base = mode === 'menu' && item.menu_price
    ? parseMenuPrice(item.menu_price)
    : parseMenuPrice(item.price)

  const numSauces = saucesStr ? saucesStr.split(',').filter(Boolean).length : 0
  return Math.round((base + Math.max(0, numSauces - 2)) * 100) / 100
}

type CartInput = { key?: string; name?: string; qty: unknown; price: unknown }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cart } = body

    if (!Array.isArray(cart) || cart.length === 0 || cart.length > 30) {
      return NextResponse.json({ error: 'Panier invalide.' }, { status: 400 })
    }

    let total = 0
    for (const raw of cart as CartInput[]) {
      const qty = Number(raw.qty)
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
        return NextResponse.json({ error: 'Quantité invalide.' }, { status: 400 })
      }

      let unitPrice: number | null = null

      // Prefer server-computed price from key (tamper-proof)
      if (typeof raw.key === 'string' && raw.key.length > 0) {
        unitPrice = serverPrice(raw.key)
      }

      // Fallback: validate client-sent price (Supabase-only items)
      if (unitPrice === null) {
        const clientPrice = Number(raw.price)
        if (!isFinite(clientPrice) || clientPrice < 0.5 || clientPrice > 150) {
          return NextResponse.json({ error: 'Prix invalide.' }, { status: 400 })
        }
        unitPrice = Math.round(clientPrice * 100) / 100
      }

      total += unitPrice * qty
    }

    const amountCents = Math.round(total * 100)
    if (amountCents < 50) {
      return NextResponse.json({ error: 'Montant trop faible.' }, { status: 400 })
    }
    if (amountCents > 50000) {
      return NextResponse.json({ error: 'Montant trop élevé.' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        items: JSON.stringify(
          (cart as CartInput[]).slice(0, 10).map(i => ({ n: String(i.name ?? '').slice(0, 80), q: Number(i.qty) }))
        ),
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur Stripe'
    console.error('[stripe]', msg)
    return NextResponse.json({ error: 'Erreur paiement.' }, { status: 500 })
  }
}
