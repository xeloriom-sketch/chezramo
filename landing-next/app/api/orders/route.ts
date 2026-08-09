import { NextRequest, NextResponse } from 'next/server'

const SB_URL = 'https://hqfewokpvjmxezhnurbm.supabase.co'
const SB_KEY = 'sb_publishable_NmIfxaQb5ncapzCtzI5uNQ_tHdCwAyc'
const SB_HDR = {
  'Content-Type': 'application/json',
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, cart, total } = await req.json()
    const res = await fetch(`${SB_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { ...SB_HDR, Prefer: 'return=minimal' },
      body: JSON.stringify({ order_id: orderId, items: cart, total, status: 'pending' }),
    })
    if (!res.ok) {
      const txt = await res.text()
      console.error('[orders POST]', txt)
      return NextResponse.json({ error: txt }, { status: res.status })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=100`,
      { headers: SB_HDR, cache: 'no-store' }
    )
    if (!res.ok) {
      const txt = await res.text()
      console.error('[orders GET]', res.status, txt)
      return NextResponse.json([], { status: 200 })
    }
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('[orders GET] exception:', err)
    return NextResponse.json([], { status: 200 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    const res = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...SB_HDR, Prefer: 'return=minimal' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
