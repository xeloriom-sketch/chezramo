export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, cookieValue, COOKIE } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  try {
    const { user, pass } = await req.json()
    if (typeof user !== 'string' || typeof pass !== 'string') {
      return NextResponse.json({ error: 'Identifiants manquants.' }, { status: 400 })
    }
    if (!verifyCredentials(user, pass)) {
      await new Promise(r => setTimeout(r, 300 + Math.random() * 200)) // anti-timing
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 })
    }
    const res = NextResponse.json({ ok: true })
    res.cookies.set(COOKIE, cookieValue(), {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
