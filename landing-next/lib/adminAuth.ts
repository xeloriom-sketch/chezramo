import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

const COOKIE = 'ramo_admin'
const ALLOWED_STATUS = ['pending', 'preparing', 'done', 'cancelled', 'collected'] as const

function sessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'fallback'
  return createHmac('sha256', secret).update('chez-ramo-admin-v1').digest('hex')
}

export function cookieValue(): string {
  return sessionToken()
}

export function isAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE)?.value
  if (!cookie) return false
  try {
    const expected = sessionToken()
    const a = Buffer.from(cookie.padEnd(64, ' ').slice(0, 64))
    const b = Buffer.from(expected.padEnd(64, ' ').slice(0, 64))
    return cookie.length === expected.length && timingSafeEqual(a, b)
  } catch { return false }
}

export function verifyCredentials(user: string, pass: string): boolean {
  const eu = process.env.ADMIN_USER ?? ''
  const ep = process.env.ADMIN_PASS ?? ''
  if (!eu || !ep) return false
  try {
    const uBuf = Buffer.from(user.padEnd(64, '\0').slice(0, 64))
    const pBuf = Buffer.from(pass.padEnd(64, '\0').slice(0, 64))
    const euBuf = Buffer.from(eu.padEnd(64, '\0').slice(0, 64))
    const epBuf = Buffer.from(ep.padEnd(64, '\0').slice(0, 64))
    return timingSafeEqual(uBuf, euBuf) && timingSafeEqual(pBuf, epBuf)
  } catch { return false }
}

export function isValidStatus(s: unknown): s is typeof ALLOWED_STATUS[number] {
  return typeof s === 'string' && (ALLOWED_STATUS as readonly string[]).includes(s)
}

export { COOKIE }
