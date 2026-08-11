export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_KEY!
const SB_HDR = () => ({
  'Content-Type': 'application/json',
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  Prefer: 'return=minimal',
})

// Strict UUID v4 pattern — prevents any injection attempt
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? ''

  if (!UUID_RE.test(token)) {
    return NextResponse.json({ error: 'Token invalide.' }, { status: 400 })
  }

  try {
    const url =
      `${SB_URL}/rest/v1/orders` +
      `?customer_token=eq.${encodeURIComponent(token)}` +
      `&select=order_id,status,items,total,created_at` +
      `&order=created_at.desc&limit=20`

    const res = await fetch(url, { headers: SB_HDR(), cache: 'no-store' })
    if (!res.ok) return NextResponse.json([], { status: 200 })
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

// Le client marque sa propre commande comme récupérée
// Sécurité : le token doit correspondre à la commande en base — jamais de mise à jour sans vérification
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const token    = String(body.token    ?? '')
    const order_id = Number(body.order_id ?? 0)

    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: 'Token invalide.' }, { status: 400 })
    }
    if (!Number.isInteger(order_id) || order_id <= 0) {
      return NextResponse.json({ error: 'order_id invalide.' }, { status: 400 })
    }

    // Vérifier que la commande appartient bien à ce token ET est dans un état récupérable
    const checkUrl =
      `${SB_URL}/rest/v1/orders` +
      `?customer_token=eq.${encodeURIComponent(token)}` +
      `&order_id=eq.${order_id}` +
      `&select=id,status`

    const check = await fetch(checkUrl, { headers: SB_HDR(), cache: 'no-store' })
    if (!check.ok) return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    const rows: { id: number; status: string }[] = await check.json()

    if (!rows.length) {
      return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
    }
    // Seuls les statuts "prête" ou "en préparation" peuvent passer en "récupérée" côté client
    const allowed = ['done', 'preparing', 'pending']
    if (!allowed.includes(rows[0].status)) {
      return NextResponse.json({ ok: true }) // déjà collected ou cancelled, on ignore silencieusement
    }

    const patchUrl =
      `${SB_URL}/rest/v1/orders` +
      `?customer_token=eq.${encodeURIComponent(token)}` +
      `&order_id=eq.${order_id}`

    await fetch(patchUrl, {
      method: 'PATCH',
      headers: SB_HDR(),
      body: JSON.stringify({ status: 'collected' }),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
