export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, isValidStatus } from '@/lib/adminAuth'

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_KEY!
const SB_HDR = () => ({
  'Content-Type': 'application/json',
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, cart, total, customerToken, customerName } = body

    // Basic validation
    if (!Number.isInteger(orderId) || orderId < 1000 || orderId > 9999) {
      return NextResponse.json({ error: 'orderId invalide.' }, { status: 400 })
    }
    if (!Array.isArray(cart) || cart.length === 0 || cart.length > 50) {
      return NextResponse.json({ error: 'Panier invalide.' }, { status: 400 })
    }
    const totalNum = Number(total)
    if (!isFinite(totalNum) || totalNum <= 0 || totalNum > 5000) {
      return NextResponse.json({ error: 'Total invalide.' }, { status: 400 })
    }

    // Validate customer token (optional but strictly typed if provided)
    const safeToken =
      typeof customerToken === 'string' && UUID_RE.test(customerToken)
        ? customerToken
        : null

    // Sanitize customer name: trim, cap length, strip HTML-like chars
    const safeName =
      typeof customerName === 'string'
        ? customerName.trim().replace(/[<>"']/g, '').slice(0, 80) || null
        : null

    const res = await fetch(`${SB_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...SB_HDR(), Prefer: 'return=minimal' },
      body: JSON.stringify({
        order_id: orderId,
        items: cart,
        total: totalNum,
        status: 'pending',
        customer_token: safeToken,
        customer_name: safeName,
      }),
    })
    if (!res.ok) {
      console.error('[orders POST]', res.status)
      return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=200`,
      { headers: SB_HDR(), cache: 'no-store' }
    )
    if (!res.ok) {
      console.error('[orders GET]', res.status)
      return NextResponse.json([], { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  }
  try {
    const { id, status } = await req.json()

    // Strict input validation — prevent injection and arbitrary values
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: 'id invalide.' }, { status: 400 })
    }
    if (!isValidStatus(status)) {
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 })
    }

    const res = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...SB_HDR(), Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
