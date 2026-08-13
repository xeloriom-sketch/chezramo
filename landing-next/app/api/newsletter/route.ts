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
    const res = await fetch(
      `${SB_URL}/rest/v1/newsletter?select=*&order=created_at.desc&limit=1000`,
      { headers: HDR(), cache: 'no-store' }
    )
    const data = await res.json()
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (typeof email !== 'string' || !email.includes('@'))
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    const res = await fetch(`${SB_URL}/rest/v1/newsletter`, {
      method: 'POST',
      headers: { ...HDR(), Prefer: 'return=minimal' },
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    })
    if (!res.ok) {
      const body = await res.text()
      if (body.includes('duplicate') || res.status === 409)
        return NextResponse.json({ ok: true, duplicate: true })
      return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
