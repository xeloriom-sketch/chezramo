import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/adminAuth'

const SB_URL = process.env.SUPABASE_URL!
const SB_KEY = process.env.SUPABASE_KEY!
const HDR = () => ({
  'Content-Type': 'application/json',
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
})

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 })
  try {
    const res = await fetch(`${SB_URL}/rest/v1/feedbacks?select=*&order=created_at.desc&limit=200`, {
      headers: HDR(), cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { stars, message, table_num, prize } = await req.json()
    if (!Number.isInteger(stars) || stars < 1 || stars > 5)
      return NextResponse.json({ error: 'stars invalide.' }, { status: 400 })
    const safeMsg = typeof message === 'string' ? message.trim().slice(0, 1000) : null
    const safeTbl = typeof table_num === 'string' ? table_num.slice(0, 20) : null
    const safePrize = typeof prize === 'string' ? prize.slice(0, 100) : null
    const res = await fetch(`${SB_URL}/rest/v1/feedbacks`, {
      method: 'POST',
      headers: { ...HDR(), Prefer: 'return=minimal' },
      body: JSON.stringify({ stars, message: safeMsg, table_num: safeTbl, prize: safePrize }),
    })
    if (!res.ok) return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
