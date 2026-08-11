export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { COOKIE } from '@/lib/adminAuth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 })
  return res
}
